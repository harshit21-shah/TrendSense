# TrendSense — Design Document

## 1. System Architecture

TrendSense follows a **four-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│         (Dashboard, Trend Cards, Timeline, Chat)        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼──────────────────────────────────┐
│                   FastAPI Backend                        │
│          (REST API, SSE streaming, Auth middleware)      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│             LangGraph Multi-Agent Pipeline               │
│   Router → [Reddit | HN | News] → [Sentiment Agent]     │
│                      │                                   │
│            [Synthesis & Thesis Agent]                    │
│                      ↕                                   │
│            [RAG Agent with Self-Correction]              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   Data Layer                             │
│          PostgreSQL (trends)  +  ChromaDB (vectors)     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. LangGraph Agent Architecture

### 2.1 State Schema

```python
class TrendSenseState(TypedDict):
    run_id: str
    domains: List[str]
    raw_reddit: List[RawPost]
    raw_hn: List[RawPost]
    raw_news: List[RawArticle]
    clustered_topics: List[TopicCluster]
    rag_context: List[HistoricalTrend]
    scored_trends: List[ScoredTrend]
    daily_brief: str
    errors: List[str]
```

### 2.2 Agent Graph

```
START
  │
  ▼
[Router Agent]
  │ dispatches in parallel
  ├──────────────────────────┐──────────────────────────┐
  ▼                          ▼                          ▼
[Reddit Agent]        [HackerNews Agent]          [News Agent]
  │                          │                          │
  └──────────────────────────┴──────────────────────────┘
                             │ merge
                             ▼
                    [Synthesis Agent]
                             │
                             ▼
                       [RAG Agent]
                             │
                             ▼
                    [Scoring Agent]
                             │
                             ▼
                    [Brief Generator]
                             │
                            END
```

### 2.3 Agent Responsibilities

#### Router Agent
- Reads `domains` from state
- Dispatches parallel fetch tasks to Reddit, HN, and News agents
- Handles failures gracefully — if one source fails, others continue

```python
def router_agent(state: TrendSenseState) -> TrendSenseState:
    # Fan out to source agents
    # Sets dispatch flags in state
    return state
```

#### Reddit Agent
- Uses PRAW to fetch top 50 posts + top 20 comments per configured subreddit
- Filters: score > 50, created_within_24h
- Extracts: title, body, score, subreddit, url, created_utc
- Calls LLM to extract topic keywords and 1-sentence summary per post
- Appends to `state.raw_reddit`

#### HackerNews Agent
- Fetches top 100 stories from HN Algolia API
- Filters: points > 50, num_comments > 10
- Extracts: title, url, points, num_comments, created_at
- Fetches top-level comments for Ask HN posts
- Appends to `state.raw_hn`

#### News Agent
- Fetches from NewsAPI across configured categories (technology, science, business)
- Filters: published within 24h, source reliability score > 0.6
- Extracts: title, description, url, source, publishedAt
- Appends to `state.raw_news`

#### Synthesis Agent
- Merges all raw data into unified post objects
- Computes embeddings for each item using `sentence-transformers`
- Clusters semantically similar items using HDBSCAN (min_cluster_size=3)
- Each cluster becomes a `TopicCluster` with:
  - Representative title (LLM-generated)
  - Member count per source
  - Aggregated engagement score
  - Domain tag (LLM-classified)
- Appends to `state.clustered_topics`

#### RAG Agent
- For each TopicCluster, queries ChromaDB for similar historical trends
- Returns: first_seen_date, previous_peak_score, was_mainstream
- Adds historical context to each cluster
- Flags: "This pattern matches X from 3 weeks ago which later peaked at Y"

#### Scoring Agent
- Computes **Trend Velocity Score (TVS)** for each cluster:

```
TVS = (
    (mentions_today / rolling_7day_avg) * 40 +   # velocity component
    (cross_source_bonus) * 20 +                   # appears in 2+ sources
    (engagement_score_normalized) * 25 +          # upvotes/points normalized
    (novelty_score) * 15                          # inverse of historical familiarity
) clamped to [0, 100]
```

- Assigns trend stage: Emerging (0-40), Rising (41-70), Mainstream (71-100)

#### Brief Generator
- Takes top 10 scored trends
- Prompts LLM to write a daily brief in markdown
- Format: executive summary + 10 trend entries with TVS, stage, summary, sources

---

## 3. Data Models

### PostgreSQL Schema

```sql
-- trends table
CREATE TABLE trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    domain VARCHAR(50),
    tvs_score FLOAT,
    stage VARCHAR(20),
    summary TEXT,
    sources JSONB,          -- [{title, url, source_type}]
    first_seen_at TIMESTAMP,
    run_date DATE,
    velocity_history JSONB, -- [{date, score}] last 14 days
    created_at TIMESTAMP DEFAULT NOW()
);

-- raw_posts table
CREATE TABLE raw_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(20),     -- reddit | hackernews | news
    external_id TEXT,
    title TEXT,
    body TEXT,
    url TEXT,
    engagement INT,
    fetched_at TIMESTAMP,
    trend_id UUID REFERENCES trends(id)
);

-- daily_briefs table
CREATE TABLE daily_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_date DATE UNIQUE,
    content TEXT,
    top_trend_ids UUID[],
    generated_at TIMESTAMP DEFAULT NOW()
);
```

### ChromaDB Collections

```python
# historical_trends collection
{
    "id": "trend_uuid",
    "embedding": [...],      # 384-dim from all-MiniLM-L6-v2
    "metadata": {
        "title": str,
        "domain": str,
        "first_seen": str,
        "peak_tvs": float,
        "went_mainstream": bool,
        "run_date": str
    }
}
```

---

## 4. API Design

### Endpoints

```
GET  /trends
     ?domain=ai&stage=emerging&date=2025-03-15&page=1&limit=20
     → PaginatedTrendList

GET  /trends/{id}
     → TrendDetail (full data + velocity history)

GET  /brief/today
     → DailyBrief { date, content, top_trends[] }

GET  /timeline/{topic}
     → TimelineData { topic, data_points: [{date, tvs_score}] }

POST /query
     Body: { question: str, session_id: str }
     → StreamingResponse (SSE)

GET  /domains
     → List[str] (all available domain tags)
```

### Response Models (Pydantic)

```python
class TrendCard(BaseModel):
    id: UUID
    title: str
    domain: str
    tvs_score: float
    stage: Literal["Emerging", "Rising", "Mainstream"]
    summary: str
    sources: List[Source]
    first_seen_at: datetime
    run_date: date

class Source(BaseModel):
    title: str
    url: str
    source_type: Literal["reddit", "hackernews", "news"]

class DailyBrief(BaseModel):
    brief_date: date
    content: str
    top_trends: List[TrendCard]
    generated_at: datetime
```

---

## 5. Frontend Architecture

### Component Tree

```
App
├── Navbar (search bar, domain filter tabs)
├── Routes
│   ├── /dashboard
│   │   ├── TrendingTicker (top 5 live ticker)
│   │   ├── FilterBar (domain, stage, date)
│   │   └── TrendGrid
│   │       └── TrendCard[]
│   │           └── TrendDetail (expanded modal)
│   │               ├── VelocitySparkline (Recharts)
│   │               ├── SourceList
│   │               └── BookmarkButton
│   ├── /timeline
│   │   └── TimelineChart (Recharts LineChart)
│   ├── /brief
│   │   ├── DailyBriefViewer (markdown rendered)
│   │   └── ExportPDFButton
│   └── /chat
│       ├── ChatWindow (SSE streaming)
│       └── MessageList
└── Footer
```

### State Management
- **React Query** — server state (trends, brief, timeline)
- **Zustand** — client state (filters, bookmarks, chat session)

---

## 6. Scheduler Design

```python
# APScheduler daily pipeline
scheduler.add_job(
    func=run_trendsense_pipeline,
    trigger=CronTrigger(hour=4, minute=0, timezone="Asia/Kolkata"),  # 4 AM IST
    id="daily_trend_pipeline",
    max_instances=1,
    coalesce=True
)

# Pipeline steps
async def run_trendsense_pipeline():
    1. Invoke LangGraph pipeline → scored_trends
    2. Upsert trends to PostgreSQL
    3. Upsert embeddings to ChromaDB
    4. Generate daily brief → store in daily_briefs
    5. Log pipeline run metrics
```

---

## 7. Docker Compose Layout

```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment: [GROQ_API_KEY, REDDIT_CLIENT_ID, ...]
    depends_on: [postgres, chromadb]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]

  postgres:
    image: postgres:15
    volumes: [postgres_data:/var/lib/postgresql/data]

  chromadb:
    image: chromadb/chroma
    ports: ["8001:8001"]
    volumes: [chroma_data:/chroma/chroma]
```

---

## 8. Project File Structure

```
trendsense/
├── backend/
│   ├── main.py                    # FastAPI app, routes
│   ├── agents/
│   │   ├── graph.py               # LangGraph definition
│   │   ├── router.py
│   │   ├── reddit_agent.py
│   │   ├── hn_agent.py
│   │   ├── news_agent.py
│   │   ├── synthesis_agent.py
│   │   ├── rag_agent.py
│   │   ├── scoring_agent.py
│   │   └── brief_generator.py
│   ├── models/
│   │   ├── database.py            # SQLAlchemy models
│   │   └── schemas.py             # Pydantic schemas
│   ├── services/
│   │   ├── reddit_service.py      # PRAW wrapper
│   │   ├── hn_service.py          # HN API wrapper
│   │   ├── news_service.py        # NewsAPI wrapper
│   │   ├── chroma_service.py      # ChromaDB wrapper
│   │   └── scheduler.py           # APScheduler setup
│   ├── utils/
│   │   ├── embeddings.py          # sentence-transformers
│   │   ├── clustering.py          # HDBSCAN clustering
│   │   └── scoring.py             # TVS algorithm
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TrendCard.tsx
│   │   │   ├── TrendDetail.tsx
│   │   │   ├── VelocitySparkline.tsx
│   │   │   ├── TrendingTicker.tsx
│   │   │   ├── DailyBrief.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   └── FilterBar.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── Brief.tsx
│   │   │   └── Chat.tsx
│   │   ├── store/
│   │   │   └── useStore.ts        # Zustand store
│   │   ├── hooks/
│   │   │   ├── useTrends.ts       # React Query hooks
│   │   │   └── useSSE.ts          # SSE streaming hook
│   │   └── types/
│   │       └── index.ts
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```
