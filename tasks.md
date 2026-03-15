# TrendSense — Tasks Document

## Execution Order Overview

```
Phase 1: Foundation       (Day 1–2)
Phase 2: Data & Sentiment  (Day 3–5)
Phase 3: Intelligence & RAG (Day 6–8)
Phase 4: Synthesis & Brief (Day 9–10)
Phase 5: API & Dash          (Day 11–14)
Phase 6: Deployment & Obs    (Day 15–16)
```

---

## Phase 1: Foundation

### TASK-001 — Project Scaffold
**Goal:** Monorepo structure, Docker Compose, env config
```
- [ ] Create trendsense/ root directory
- [ ] Create backend/ with FastAPI skeleton (main.py, requirements.txt, Dockerfile)
- [ ] Create frontend/ with Vite + React + TypeScript + Tailwind (npm create vite)
- [ ] Create docker-compose.yml with services: backend, frontend, postgres, chromadb
- [ ] Create .env.example with all required keys
- [ ] Verify docker-compose up brings all 4 services online
```
**Done when:** `docker-compose up` runs without errors, all services healthy.

---

### TASK-002 — Database Setup
**Goal:** PostgreSQL schema + SQLAlchemy models
```
- [ ] Install: sqlalchemy, asyncpg, alembic
- [ ] Write SQLAlchemy models: Trend, RawPost, DailyBrief (matching schema in design.md)
- [ ] Set up Alembic for migrations
- [ ] Run initial migration — verify tables created in postgres
- [ ] Write database.py with async session factory
```
**Done when:** Tables exist in postgres, session factory returns working connection.

---

### TASK-003 — ChromaDB Setup
**Goal:** ChromaDB client + collection initialisation
```
- [ ] Install: chromadb, sentence-transformers
- [ ] Write chroma_service.py with:
      - get_or_create_collection("historical_trends")
      - upsert_trend(trend_id, title, domain, metadata)
      - query_similar(text, n_results=5)
- [ ] Write embeddings.py — load all-MiniLM-L6-v2, expose encode(text) → List[float]
- [ ] Test: upsert 3 dummy trends, query returns correct results
```
**Done when:** ChromaDB query returns semantically similar results.

---

### TASK-004 — Config & Logging
**Goal:** Centralised config, structured logging
```
- [ ] Write config.py using pydantic BaseSettings — reads all env vars
- [ ] Set up structlog with JSON output
- [ ] Write logger.py — expose get_logger(name)
- [ ] Add request logging middleware to FastAPI
```
**Done when:** All config loaded from .env, logs output clean JSON.

---

## Phase 2: Data & Sentiment

### TASK-005 — Reddit & HN Services
**Goal:** Fetch raw signals.

### TASK-006 — Sentiment Agent (Resume Boost)
**Goal:** Implement fine-grained sentiment & emotion analysis.
```
- [ ] Install: textblob, vaderSentiment, transformers
- [ ] Write sentiment_service.py:
      - analyze_sentiment(text) -> {polarity: float, subjectivity: float}
      - detect_emotion(text) -> {joy: float, fear: float, surprise: float...}
- [ ] Implement Sentiment Agent node in LangGraph
- [ ] Test: analysis of 10 r/MachineLearning comments
```
**Done when:** State includes `sentiment_metrics` per cluster.

---

## Phase 3: Intelligence & RAG

### TASK-007 — Hybrid RAG Agent
**Goal:** Vector search + Keyword search + Self-Correction.
```
- [ ] Implement Hybrid Search in ChromaService
- [ ] Implement RAG Agent node with "Self-Correction" logic (verify facts against source)
- [ ] Add "Historical Pattern Matching" (comparing current velocity to historical peaks)
```

---

## Phase 4: Synthesis & Brief

### TASK-008 — Synthesis & Thesis Agent
**Goal:** Generate summaries + "Investment Thesis" + "Product Opportunity".
```
- [ ] Refine Synthesis Agent prompt to include:
      - Investment Thesis (why this matters for capital)
      - Product Opportunity (what can be built)
      - Risk Assessment (hype vs reality)
- [ ] Generate S-TVS (Sentiment-Adjusted Trend Velocity Score)
```
      - extract: objectID, title, url, points, num_comments, created_at
      - For Ask HN posts: fetch top 10 comments via /items/{id}
- [ ] Test: fetch top 100, verify filter reduces to ~30–40 posts
```
**Done when:** HN fetch returns filtered posts with engagement data.

---

### TASK-007 — NewsAPI Service
**Goal:** Fetch news articles via NewsAPI
```
- [ ] Install: requests or httpx
- [ ] Write news_service.py:
      - fetch_top_headlines(category, page_size=50) → List[RawArticle]
      - categories: technology, science, business, health
      - filter: published within 24h
      - extract: title, description, url, source.name, publishedAt
- [ ] Test: fetch technology headlines, verify recency filter works
```
**Done when:** NewsAPI returns fresh articles, old articles filtered out.

---

### TASK-008 — Reddit Agent (LangGraph Node)
**Goal:** LangGraph node wrapping Reddit service + LLM keyword extraction
```
- [ ] Write agents/reddit_agent.py:
      - Input: state (reads domains)
      - Calls reddit_service.fetch_top_posts for each domain's subreddits
      - For each post: calls LLM (Groq) to extract:
            - topic_keywords: List[str] (max 5)
            - one_line_summary: str
      - Writes results to state.raw_reddit
      - Logs: source="reddit", posts_fetched=N, posts_after_filter=M
- [ ] Handle rate limits with exponential backoff
- [ ] Test node in isolation: mock state → verify state.raw_reddit populated
```
**Done when:** Node populates state.raw_reddit with keyword-enriched posts.

---

### TASK-009 — HackerNews Agent (LangGraph Node)
**Goal:** LangGraph node wrapping HN service
```
- [ ] Write agents/hn_agent.py:
      - Input: state
      - Calls hn_service.fetch_top_stories
      - LLM extraction: topic_keywords, one_line_summary per story
      - Writes to state.raw_hn
- [ ] Test node in isolation
```
**Done when:** Node populates state.raw_hn.

---

### TASK-010 — News Agent (LangGraph Node)
**Goal:** LangGraph node wrapping NewsAPI service
```
- [ ] Write agents/news_agent.py:
      - Input: state
      - Calls news_service.fetch_top_headlines for each category
      - LLM extraction: topic_keywords, one_line_summary, domain_tag per article
      - Writes to state.raw_news
- [ ] Test node in isolation
```
**Done when:** Node populates state.raw_news with domain-tagged articles.

---

## Phase 3: Intelligence Layer

### TASK-011 — Clustering Utility
**Goal:** Semantic clustering of raw posts into topic clusters
```
- [ ] Install: hdbscan, numpy, scikit-learn
- [ ] Write utils/clustering.py:
      - cluster_posts(posts: List[RawPost]) → List[TopicCluster]
      - Compute embeddings for each post title + summary
      - Run HDBSCAN(min_cluster_size=3, metric='cosine')
      - For each cluster:
            - Pick representative title (most central embedding)
            - Count members per source (reddit / hn / news)
            - Sum engagement scores
      - Noise points (label=-1) become singleton clusters if engagement > threshold
- [ ] Test: 50 mixed posts → verify meaningful clusters form
```
**Done when:** Clustering groups related posts across sources.

---

### TASK-012 — Synthesis Agent (LangGraph Node)
**Goal:** Merge all raw data, cluster, tag domains
```
- [ ] Write agents/synthesis_agent.py:
      - Combines state.raw_reddit + state.raw_hn + state.raw_news
      - Deduplicates by URL
      - Calls clustering.cluster_posts()
      - For each cluster: calls LLM to:
            - Generate representative title
            - Assign domain tag (AI/Fintech/Health/Climate/Crypto/Other)
            - Write 2–3 sentence summary with source references
      - Writes to state.clustered_topics
- [ ] Test: full merge → verify clusters have titles, domains, summaries
```
**Done when:** state.clustered_topics contains well-formed TopicCluster objects.

---

### TASK-013 — TVS Scoring Algorithm
**Goal:** Trend Velocity Score computation
```
- [ ] Write utils/scoring.py:
      - compute_tvs(cluster: TopicCluster, historical_avg: float) → float
      - Formula:
          velocity  = min(cluster.mentions_today / max(historical_avg, 1), 5) / 5 * 40
          cross_src  = (len(cluster.sources) >= 2) * 20
          engagement = normalize(cluster.total_engagement, 0, 10000) * 25
          novelty    = (1 - cluster.historical_familiarity) * 15
          tvs        = clamp(velocity + cross_src + engagement + novelty, 0, 100)
      - assign_stage(tvs) → "Emerging" | "Rising" | "Mainstream"
- [ ] Write unit tests for scoring with edge cases (zero history, single source)
```
**Done when:** TVS produces consistent 0–100 scores, stages assigned correctly.

---

### TASK-014 — RAG Agent (LangGraph Node)
**Goal:** Query ChromaDB for historical context, enrich clusters
```
- [ ] Write agents/rag_agent.py:
      - For each clustered topic:
            - Query ChromaDB with topic title → top 3 similar historical trends
            - Extract: first_seen_date, peak_tvs, went_mainstream
            - Compute historical_familiarity = max_similarity_score (0–1)
            - Add historical_context string: "Similar to X trend from Y weeks ago"
      - Writes enriched clusters back to state.clustered_topics
- [ ] Test: query with known topic, verify historical match returned
```
**Done when:** Each cluster has historical_familiarity and historical_context.

---

### TASK-015 — Scoring Agent (LangGraph Node)
**Goal:** Apply TVS to all clusters, sort, filter top 20
```
- [ ] Write agents/scoring_agent.py:
      - For each cluster: call compute_tvs with historical data from RAG agent
      - Sort clusters by TVS descending
      - Keep top 20
      - Writes to state.scored_trends
- [ ] Test: 30 clusters in → 20 scored trends out, sorted correctly
```
**Done when:** state.scored_trends contains top 20 trends sorted by TVS.

---

### TASK-016 — Brief Generator (LangGraph Node)
**Goal:** Generate daily markdown brief from top 10 trends
```
- [ ] Write agents/brief_generator.py:
      - Takes top 10 from state.scored_trends
      - Prompt LLM: "Write a concise daily intelligence brief for founders and investors.
        Format: executive summary (2 sentences) + 10 trend entries.
        Each entry: ## [Rank]. [Title] | TVS: X | Stage: Y
        Summary: [2-3 sentences grounded in sources]
        Sources: [source1](url1), [source2](url2)"
      - Writes to state.daily_brief
- [ ] Test: 10 scored trends → valid markdown brief generated
```
**Done when:** state.daily_brief contains well-formatted markdown.

---

### TASK-017 — LangGraph Graph Assembly
**Goal:** Wire all agents into LangGraph state machine
```
- [ ] Write agents/graph.py:
      - Define StateGraph(TrendSenseState)
      - Add nodes: router, reddit, hackernews, news, synthesis, rag, scoring, brief
      - Add edges:
          START → router
          router → [reddit, hackernews, news]  (parallel fan-out)
          [reddit, hackernews, news] → synthesis  (fan-in after all complete)
          synthesis → rag
          rag → scoring
          scoring → brief
          brief → END
      - Compile graph
      - Expose: run_pipeline(domains: List[str]) → TrendSenseState
- [ ] Test full graph: run with ["AI", "Fintech"] → verify all state fields populated
```
**Done when:** Full pipeline runs end-to-end, state fully populated.

---

### TASK-018 — Scheduler Setup
**Goal:** Daily automated pipeline runs
```
- [ ] Write services/scheduler.py:
      - APScheduler AsyncIOScheduler
      - Job: run_trendsense_pipeline() at 4:00 AM IST daily
      - Pipeline: graph.run_pipeline → upsert to postgres → upsert to chromadb → store brief
      - On failure: log error, send alert (print for now), retry once after 30 min
- [ ] Wire scheduler startup/shutdown into FastAPI lifespan events
- [ ] Test: trigger manually via endpoint POST /admin/run-pipeline
```
**Done when:** Pipeline triggers on schedule, results stored in DB.

---

## Phase 4: FastAPI Backend

### TASK-019 — Core API Routes
**Goal:** All REST endpoints from requirements
```
- [ ] GET /trends — paginated, filterable (domain, stage, date)
- [ ] GET /trends/{id} — full detail + velocity history
- [ ] GET /brief/today — today's daily brief
- [ ] GET /timeline/{topic} — 14-day TVS history for topic
- [ ] GET /domains — list of available domain tags
- [ ] POST /admin/run-pipeline — manual trigger (no auth, dev only)
- [ ] Add pagination, filtering via query params
- [ ] Return proper 404s with detail messages
```
**Done when:** All endpoints return correct data, tested via Swagger UI.

---

### TASK-020 — RAG Chat Endpoint (SSE Streaming)
**Goal:** Natural language query over trend data
```
- [ ] POST /query accepts { question: str, session_id: str }
- [ ] Flow:
      1. Embed question
      2. Query ChromaDB → top 5 relevant trends
      3. Build prompt with trend context + conversation history
      4. Stream LLM response via SSE (text/event-stream)
- [ ] Maintain session history using LangChain ConversationBufferMemory (in-memory, keyed by session_id)
- [ ] Write useSSE hook on frontend to consume stream
```
**Done when:** Chat endpoint streams LLM response, grounded in real trend data.

---

### TASK-021 — CORS, Error Handling, Middleware
**Goal:** Production-ready API hygiene
```
- [ ] Add CORS middleware (allow localhost:3000 in dev)
- [ ] Add global exception handler → returns structured error JSON
- [ ] Add request ID middleware (UUID per request, logged)
- [ ] Add response time logging
- [ ] Write health check: GET /health → { status: "ok", db: "ok", chroma: "ok" }
```
**Done when:** Errors return structured JSON, health check passes.

---

## Phase 5: React Frontend

### TASK-022 — Project Setup & Routing
```
- [ ] Install: react-router-dom, @tanstack/react-query, zustand, axios, recharts
- [ ] Set up React Router: /dashboard, /timeline, /brief, /chat
- [ ] Set up React Query client with 5min stale time
- [ ] Set up Zustand store: filters (domain, stage, date), bookmarks[], chatSession
- [ ] Build Navbar with logo, route links, search bar
```

---

### TASK-023 — Trend Card Component
```
- [ ] TrendCard.tsx:
      - Shows: title, domain badge (colored by domain), TVS score bar, stage pill, summary preview
      - TVS bar: green (emerging) → yellow (rising) → red (mainstream)
      - Click → opens TrendDetail modal
- [ ] TrendDetail.tsx (modal):
      - Full summary with source links
      - VelocitySparkline (7-day TVS chart, Recharts AreaChart)
      - First seen date, cross-source badge ("Reddit + HN + News")
      - Bookmark button → saves to Zustand store
```

---

### TASK-024 — Dashboard Page
```
- [ ] Dashboard.tsx:
      - TrendingTicker: horizontal scrolling top-5 trends
      - FilterBar: domain tabs, stage pills, date picker
      - TrendGrid: 3-col masonry layout of TrendCards
      - useTrends() hook: GET /trends with filter params via React Query
      - Loading skeleton cards while fetching
      - Empty state: "No trends found for these filters"
```

---

### TASK-025 — Timeline Page
```
- [ ] Timeline.tsx:
      - Search input for topic
      - GET /timeline/{topic} → Recharts LineChart
      - X-axis: dates, Y-axis: TVS score (0–100)
      - Annotations: mark "Emerging → Rising → Mainstream" transition points
      - Multiple topics overlay (up to 3) for comparison
```

---

### TASK-026 — Daily Brief Page
```
- [ ] Brief.tsx:
      - GET /brief/today → render markdown (use react-markdown)
      - Show generation timestamp
      - ExportPDF button → uses browser print API (window.print() with print stylesheet)
      - Previous briefs navigation (← yesterday | today →)
```

---

### TASK-027 — Chat Page
```
- [ ] ChatWindow.tsx:
      - Message input + send button
      - MessageList: user messages (right) + AI messages (left)
      - SSE streaming: AI response streams word by word
      - useSSE.ts hook: EventSource connection to POST /query
      - Session ID generated on page load (UUID stored in Zustand)
      - "Grounded in X trends" badge on each AI response
```

---

## Phase 6: Polish & Deploy

### TASK-028 — README
```
- [ ] Architecture diagram (ASCII, same as design.md)
- [ ] Prerequisites: Docker, API keys needed
- [ ] Quick start: git clone → cp .env.example .env → docker-compose up
- [ ] Screenshots: dashboard, trend detail, chat, brief
- [ ] Resume bullet (write the final honest bullet here)
```

---

### TASK-029 — Final Resume Bullet
Once built, this is what you write:

> Built TrendSense, a multi-agent trend intelligence system using LangGraph to orchestrate 5 specialized agents (Reddit, HackerNews, News, RAG, Synthesis) across 3 live data sources; implemented semantic clustering with HDBSCAN, a custom Trend Velocity Scoring algorithm, and RAG over ChromaDB for historical pattern matching — served via FastAPI with a React + TypeScript dashboard featuring SSE-streamed LLM chat.

---

## API Keys Required

| Service | Where to get |
|---|---|
| Groq API | console.groq.com (free) |
| Reddit API | reddit.com/prefs/apps (free) |
| NewsAPI | newsapi.org (free tier: 100 req/day) |
| OpenAI (optional) | platform.openai.com |

---

## Total Estimated Time

| Phase | Days |
|---|---|
| Foundation | 2 |
| Data Agents | 3 |
| Intelligence Layer | 3 |
| FastAPI | 2 |
| Frontend | 4 |
| Polish | 2 |
| **Total** | **~16 days** |
