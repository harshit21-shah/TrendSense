# TrendSense: Complete Technical Documentation

## Executive Summary

**TrendSense** is an AI-powered trend intelligence platform that automatically discovers, analyzes, and synthesizes emerging technology and market trends from multiple data sources. It combines real-time data collection, sentiment analysis, LLM-based synthesis, and RAG (Retrieval-Augmented Generation) validation to provide actionable insights for investors, product managers, and strategists.

**Key Metrics:**
- Processes 100+ signals per pipeline run from Reddit, HackerNews, and NewsAPI
- Generates 5-8 validated trends with Trend Velocity Scores (TVS: 1-100)
- Real-time AI chat interface with streaming responses
- Sub-6 second production build time
- 256KB gzipped frontend bundle

---

## Table of Contents

1. [What We Built](#what-we-built)
2. [Why We Built It](#why-we-built-it)
3. [Architecture Overview](#architecture-overview)
4. [Technology Stack](#technology-stack)
5. [System Components](#system-components)
6. [Data Flow & Pipeline](#data-flow--pipeline)
7. [AI/ML Components](#aiml-components)
8. [Frontend Architecture](#frontend-architecture)
9. [Backend Architecture](#backend-architecture)
10. [Database Schema](#database-schema)
11. [Deployment Architecture](#deployment-architecture)
12. [Key Algorithms & Metrics](#key-algorithms--metrics)
13. [API Documentation](#api-documentation)
14. [Performance & Optimization](#performance--optimization)
15. [Security Considerations](#security-considerations)
16. [Scalability & Future Enhancements](#scalability--future-enhancements)
17. [Interview Talking Points](#interview-talking-points)

---


## 1. What We Built

TrendSense is a full-stack, production-ready trend intelligence platform with the following capabilities:

### Core Features

1. **Automated Trend Discovery Pipeline**
   - Multi-source data aggregation (Reddit RSS, HackerNews API, NewsAPI)
   - Sentiment analysis using dual NLP models (TextBlob + VADER)
   - LLM-powered trend synthesis using Groq's Llama 3.3 70B
   - RAG-based self-correction with ChromaDB vector storage
   - Trend Velocity Score (TVS) calculation and tracking

2. **Interactive Dashboard**
   - Real-time trend visualization with velocity indicators
   - Domain filtering (AI, Fintech, Health, Biotech, Crypto, Climate)
   - Stage-based categorization (Emerging, Rising, Mainstream)
   - Detailed trend cards with investment thesis and product opportunities
   - Bookmark management for trend tracking

3. **AI Chat Interface**
   - Streaming SSE (Server-Sent Events) responses
   - Context-aware answers grounded in stored trends
   - Vector similarity search for relevant context retrieval
   - Markdown-formatted responses with citations

4. **Timeline & Brief Views**
   - Historical trend evolution tracking
   - Daily executive briefings
   - Trend velocity delta visualization

5. **Production-Ready Deployment**
   - Dockerized microservices architecture
   - Multi-stage builds with nginx reverse proxy
   - Health check endpoints
   - Automated deployment scripts

---


## 2. Why We Built It

### Problem Statement

In the fast-paced technology and investment landscape, identifying emerging trends early provides significant competitive advantage. However:

- **Information Overload**: Thousands of signals across Reddit, HackerNews, Twitter, news sites
- **Signal vs Noise**: 95% of "trends" are hype; only 5% have real momentum
- **Manual Analysis is Slow**: Human analysts can't process 1000+ posts daily
- **Context Loss**: Trends evolve; historical context is critical for validation
- **Fragmented Sources**: Data scattered across multiple platforms

### Solution Approach

TrendSense automates the entire trend intelligence workflow:

1. **Aggregation**: Pulls signals from high-quality sources (Reddit ML communities, HN front page, tech news)
2. **Enrichment**: Adds sentiment, emotion, and engagement metrics
3. **Synthesis**: Uses LLMs to identify patterns and synthesize coherent trends
4. **Validation**: Cross-references with historical data to filter hype from reality
5. **Scoring**: Calculates Trend Velocity Score (TVS) based on multiple factors
6. **Delivery**: Presents actionable insights through intuitive UI and conversational AI

### Target Users

- **Venture Capitalists**: Early-stage investment thesis development
- **Product Managers**: Identifying product opportunities and market gaps
- **Strategic Planners**: Understanding technology adoption curves
- **Researchers**: Tracking emerging technologies and their trajectories

---


## 3. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │ Timeline │  │   Chat   │  │  Brief   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       └─────────────┴─────────────┴─────────────┘               │
│                         │                                        │
│                    React Query                                   │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │ HTTP/SSE
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ REST API     │  │ SSE Endpoint │  │ Pipeline     │         │
│  │ /trends      │  │ /query       │  │ /run-pipeline│         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │   ChromaDB   │    │  LangGraph   │
│  (Trends DB) │    │  (Vectors)   │    │  (Pipeline)  │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                                │
                    ┌───────────────────────────┼───────────────┐
                    │                           │               │
                    ▼                           ▼               ▼
            ┌──────────────┐          ┌──────────────┐  ┌──────────────┐
            │ Data Sources │          │  AI Agents   │  │  NLP Models  │
            │ - Reddit RSS │          │ - Sentiment  │  │ - TextBlob   │
            │ - HN API     │          │ - Synthesis  │  │ - VADER      │
            │ - NewsAPI    │          │ - RAG        │  │ - MiniLM     │
            └──────────────┘          └──────────────┘  └──────────────┘
```

### Component Interaction Flow

1. **User triggers pipeline** → Backend starts LangGraph workflow
2. **Fetcher Node** → Collects signals from Reddit, HN, NewsAPI
3. **Sentiment Agent** → Enriches signals with NLP metrics
4. **Synthesis Agent** → LLM generates trend summaries
5. **RAG Agent** → Validates against historical context in ChromaDB
6. **Database Storage** → Saves validated trends to PostgreSQL
7. **Frontend Query** → React Query fetches trends via REST API
8. **User asks question** → SSE streams AI response with context

---


## 4. Technology Stack

### Frontend Stack

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **React** | 18.2.0 | UI Framework | Industry standard, component-based, excellent ecosystem |
| **TypeScript** | 5.2.2 | Type Safety | Catch errors at compile-time, better IDE support |
| **Vite** | 5.2.0 | Build Tool | 10x faster than Webpack, HMR, optimized production builds |
| **React Router** | 7.13.1 | Routing | Client-side routing, code splitting support |
| **TanStack Query** | 5.90.21 | Data Fetching | Caching, background refetching, optimistic updates |
| **Zustand** | 5.0.11 | State Management | Lightweight (1KB), simpler than Redux, no boilerplate |
| **Tailwind CSS** | 3.4.3 | Styling | Utility-first, rapid development, small bundle size |
| **Framer Motion** | 12.36.0 | Animations | Declarative animations, gesture support |
| **Recharts** | 2.12.7 | Data Visualization | React-native charts, composable, responsive |
| **Lucide React** | 0.378.0 | Icons | Modern icon library, tree-shakeable |
| **Axios** | 1.6.8 | HTTP Client | Interceptors, request cancellation, better error handling |
| **React Markdown** | 10.1.0 | Markdown Rendering | Render LLM responses with formatting |

### Backend Stack

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Python** | 3.11 | Language | Excellent AI/ML ecosystem, async support |
| **FastAPI** | Latest | Web Framework | Async, auto-generated docs, type hints, fast |
| **Uvicorn** | Latest | ASGI Server | High-performance async server |
| **SQLAlchemy** | Latest | ORM | Async support, type-safe queries, migrations |
| **PostgreSQL** | 15 | Relational DB | ACID compliance, JSON support, reliability |
| **ChromaDB** | Latest | Vector DB | Embeddings storage, similarity search, simple API |
| **LangGraph** | Latest | Workflow Engine | State machine for AI agents, composable nodes |
| **LangChain** | Latest | LLM Framework | Abstractions for prompts, chains, agents |
| **Groq** | Latest | LLM Provider | Fast inference (300+ tokens/sec), Llama 3.3 70B |
| **Sentence Transformers** | Latest | Embeddings | all-MiniLM-L6-v2 model, 384-dim vectors |
| **TextBlob** | Latest | NLP | Sentiment analysis, simple API |
| **VADER** | Latest | Sentiment Analysis | Social media optimized, compound scores |
| **NLTK** | Latest | NLP Toolkit | Tokenization, POS tagging |

### Infrastructure & DevOps

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Docker** | Containerization | Consistent environments, easy deployment |
| **Docker Compose** | Orchestration | Multi-container management, networking |
| **nginx** | Reverse Proxy | Static file serving, API proxying, caching |
| **PostgreSQL** | Database | Production-grade relational database |
| **ChromaDB** | Vector Store | Embeddings for RAG, similarity search |

---


## 5. System Components

### 5.1 Data Collection Layer

#### Reddit RSS Service (`reddit_service.py`)
- **Purpose**: Fetch trending posts from target subreddits
- **Method**: Public RSS feeds (no API keys required)
- **Subreddits**: MachineLearning, artificial, LocalLLaMA, singularity, fintech, CryptoCurrency, investing, Futurology, science
- **Output**: Title, content, score, URL, subreddit, timestamp
- **Rate Limiting**: None (RSS is public)
- **Error Handling**: Graceful fallback, logs errors, continues pipeline

#### HackerNews Service (`hn_service.py`)
- **Purpose**: Fetch high-engagement stories from HN front page
- **API**: Algolia HN Search API (public, no auth)
- **Filters**: Points > 50 OR Comments > 10
- **Limit**: Top 100 stories
- **Output**: Title, content, points, URL, comments count
- **Why HN**: High-quality tech discussions, early adopter community

#### NewsAPI Service (`news_service.py`)
- **Purpose**: Fetch mainstream tech/business news
- **API**: NewsAPI.org (requires API key)
- **Categories**: Technology, Science, Business, Health
- **Time Filter**: Last 24 hours only
- **Output**: Title, description, URL, published date, source
- **Fallback**: Continues without NewsAPI if key missing

### 5.2 NLP & Sentiment Layer

#### Sentiment Service (`sentiment_service.py`)
- **Dual Analysis Approach**:
  1. **TextBlob**: Polarity (-1 to +1), Subjectivity (0 to 1)
  2. **VADER**: Compound score, Positive/Neutral/Negative ratios
- **Why Dual**: TextBlob for general sentiment, VADER for social media nuances
- **Output**: 6 metrics per signal (polarity, subjectivity, compound, pos, neu, neg)
- **Label**: Positive (>0.05), Negative (<-0.05), Neutral (else)

#### Embeddings Service (`embeddings.py`)
- **Model**: all-MiniLM-L6-v2 (Sentence Transformers)
- **Dimensions**: 384
- **Purpose**: Convert text to vectors for similarity search
- **Performance**: ~1000 embeddings/sec on CPU
- **Use Cases**: RAG context retrieval, trend deduplication

### 5.3 AI Agent Layer (LangGraph Pipeline)

#### Sentiment Agent (`sentiment_agent.py`)
- **Input**: Raw signals (title + content)
- **Process**: Runs dual sentiment analysis on each signal
- **Output**: Enriched signals with sentiment metrics
- **Error Handling**: Logs errors, continues with remaining signals

#### Synthesis Agent (`synthesis_agent.py`)
- **LLM**: Groq Llama 3.3 70B Versatile
- **Input**: Top 30 processed signals (sorted by score)
- **Prompt Engineering**:
  - Role: Senior VC Analyst + Product Strategist
  - Task: Synthesize 5-8 high-value trends
  - Output Format: Strict JSON schema
- **Output Fields**:
  - `title`: Concise trend name
  - `domain`: AI | Fintech | Biotech | Health | Crypto | Climate | Other
  - `s_tvs`: Trend Velocity Score (1-100)
  - `stage`: Emerging | Rising | Mainstream
  - `summary`: 2-3 sentence technical overview
  - `investment_thesis`: Why it matters for capital allocation
  - `product_opportunity`: Specific product ideas
  - `risk_assessment`: Hype vs reality check
  - `sources`: List of URLs

#### RAG Agent (`rag_agent.py`)
- **Purpose**: Self-correction using historical context
- **Process**:
  1. Query ChromaDB for similar past trends
  2. Compare current trend with historical context
  3. LLM validates and adds "Historical Accuracy" score
  4. Upsert validated trend back to ChromaDB
- **Why RAG**: Prevents duplicate trends, validates novelty, adds temporal context
- **Vector Search**: Top 3 similar documents per trend

---


## 6. Data Flow & Pipeline

### Pipeline Execution Flow

```
User clicks "Run Pipeline"
        │
        ▼
POST /run-pipeline (FastAPI)
        │
        ▼
Background Task: run_intelligence_pipeline()
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│              LangGraph State Machine                       │
│                                                            │
│  Initial State:                                            │
│  {                                                         │
│    domains: ["AI", "Fintech", "Health"],                  │
│    raw_signals: [],                                        │
│    processed_signals: [],                                  │
│    scored_trends: [],                                      │
│    validated_trends: [],                                   │
│    errors: []                                              │
│  }                                                         │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Node 1: Fetcher                                   │    │
│  │ - Parallel fetch from Reddit, HN, NewsAPI        │    │
│  │ - Aggregates ~100-200 signals                     │    │
│  │ - Updates state.raw_signals                       │    │
│  └────────────────┬─────────────────────────────────┘    │
│                   │                                        │
│                   ▼                                        │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Node 2: Sentiment Agent                           │    │
│  │ - Processes each signal with TextBlob + VADER    │    │
│  │ - Adds sentiment_metrics and sentiment_label     │    │
│  │ - Updates state.processed_signals                 │    │
│  └────────────────┬─────────────────────────────────┘    │
│                   │                                        │
│                   ▼                                        │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Node 3: Synthesis Agent                           │    │
│  │ - Sends top 30 signals to Groq LLM               │    │
│  │ - LLM synthesizes 5-8 trends                      │    │
│  │ - Parses JSON response                            │    │
│  │ - Updates state.scored_trends                     │    │
│  └────────────────┬─────────────────────────────────┘    │
│                   │                                        │
│                   ▼                                        │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Node 4: RAG Agent                                 │    │
│  │ - For each trend:                                 │    │
│  │   1. Query ChromaDB for similar trends           │    │
│  │   2. LLM validates with historical context       │    │
│  │   3. Adds historical_accuracy field              │    │
│  │   4. Upserts to ChromaDB                         │    │
│  │ - Updates state.validated_trends                  │    │
│  └────────────────┬─────────────────────────────────┘    │
│                   │                                        │
│                   ▼                                        │
│                  END                                       │
└───────────────────┼────────────────────────────────────────┘
                    │
                    ▼
Save to PostgreSQL (Trend table)
        │
        ▼
Pipeline Complete
```

### State Transitions

| State Field | Node 1 (Fetcher) | Node 2 (Sentiment) | Node 3 (Synthesis) | Node 4 (RAG) |
|-------------|------------------|--------------------|--------------------|--------------|
| raw_signals | ✅ Populated | ➡️ Read-only | ➡️ Read-only | ➡️ Read-only |
| processed_signals | - | ✅ Populated | ➡️ Read-only | ➡️ Read-only |
| scored_trends | - | - | ✅ Populated | ➡️ Read-only |
| validated_trends | - | - | - | ✅ Populated |
| errors | Append on error | Append on error | Append on error | Append on error |

### Timing Breakdown (Typical Run)

- **Fetcher Node**: 3-5 seconds (parallel HTTP requests)
- **Sentiment Agent**: 2-3 seconds (100 signals × 20ms each)
- **Synthesis Agent**: 5-8 seconds (LLM inference)
- **RAG Agent**: 10-15 seconds (8 trends × vector search + LLM validation)
- **Database Save**: 1-2 seconds
- **Total Pipeline Time**: ~25-35 seconds

---


## 7. AI/ML Components

### 7.1 Large Language Models

#### Groq Llama 3.3 70B Versatile
- **Provider**: Groq (LPU inference)
- **Speed**: 300+ tokens/second (10x faster than standard GPU inference)
- **Context Window**: 128K tokens
- **Use Cases**:
  1. Trend synthesis from signals
  2. RAG validation and self-correction
  3. Chat responses with streaming
- **Cost**: ~$0.59 per 1M input tokens, ~$0.79 per 1M output tokens
- **Why Groq**: Speed is critical for real-time chat; Llama 3.3 70B provides excellent reasoning

#### Prompt Engineering Strategy

**Synthesis Prompt**:
```
Role: Senior Venture Capital Analyst and Product Strategist
Task: Analyze signals and synthesize trends
Output: Strict JSON schema with 8 fields
Constraints: 5-8 trends, specific domains, TVS scoring
```

**RAG Validation Prompt**:
```
Role: AI Fact-Checker and Research Assistant
Task: Compare trend with historical context
Output: Historical accuracy score + self-correction notes
```

### 7.2 Embeddings & Vector Search

#### Sentence Transformers (all-MiniLM-L6-v2)
- **Architecture**: 6-layer MiniLM
- **Dimensions**: 384
- **Performance**: 1000+ embeddings/sec on CPU
- **Use Case**: Convert trend text to vectors for similarity search
- **Why This Model**: Balance of speed, size (80MB), and quality

#### ChromaDB Vector Store
- **Storage**: Persistent local storage (chroma_db/)
- **Distance Metric**: Cosine similarity
- **Collections**: "trends" collection
- **Metadata**: title, domain, summary, sources
- **Query**: Top-K similarity search (K=3-5)
- **Why ChromaDB**: Simple API, no server required, good for prototypes

### 7.3 NLP Models

#### TextBlob
- **Purpose**: General sentiment analysis
- **Metrics**:
  - Polarity: -1 (negative) to +1 (positive)
  - Subjectivity: 0 (objective) to 1 (subjective)
- **Algorithm**: Pattern-based sentiment lexicon
- **Speed**: ~50ms per document

#### VADER (Valence Aware Dictionary and sEntiment Reasoner)
- **Purpose**: Social media sentiment analysis
- **Metrics**:
  - Compound: -1 to +1 (normalized score)
  - Positive, Neutral, Negative ratios
- **Optimized For**: Short texts, emojis, slang, capitalization
- **Speed**: ~10ms per document
- **Why VADER**: Reddit/HN posts use informal language

### 7.4 RAG (Retrieval-Augmented Generation)

#### Architecture
```
User Query / New Trend
        │
        ▼
Embedding Model (MiniLM)
        │
        ▼
Vector (384-dim)
        │
        ▼
ChromaDB Similarity Search
        │
        ▼
Top-K Similar Documents
        │
        ▼
Context + Query → LLM
        │
        ▼
Grounded Response
```

#### Benefits
1. **Reduces Hallucination**: LLM grounded in real data
2. **Temporal Context**: Knows if trend is truly "emerging" or old news
3. **Deduplication**: Prevents duplicate trends across runs
4. **Self-Correction**: LLM can revise its own outputs

---


## 8. Frontend Architecture

### 8.1 Component Structure

```
src/
├── components/
│   ├── Header.tsx              # Top navigation bar
│   ├── Sidebar.tsx             # Left navigation menu
│   ├── TrendCard.tsx           # Grid view trend card
│   ├── TrendRow.tsx            # List view trend row
│   ├── TrendDrawer.tsx         # Detailed trend modal
│   └── ui/
│       ├── Badge.tsx           # Domain/stage badges
│       ├── Skeleton.tsx        # Loading placeholders
│       └── TVSBar.tsx          # Velocity score bar chart
├── pages/
│   ├── Dashboard.tsx           # Main trends view
│   ├── Timeline.tsx            # Historical trend evolution
│   ├── Brief.tsx               # Daily executive summary
│   ├── Chat.tsx                # AI chat interface
│   └── Bookmarks.tsx           # Saved trends
├── hooks/
│   ├── useTrends.ts            # React Query hooks for trends
│   └── useSSE.ts               # Server-Sent Events hook
├── lib/
│   ├── api.ts                  # Axios API client
│   └── utils.ts                # Utility functions
├── store/
│   └── useStore.ts             # Zustand global state
└── types/
    └── index.ts                # TypeScript interfaces
```

### 8.2 State Management Strategy

#### React Query (TanStack Query)
- **Purpose**: Server state management
- **Features Used**:
  - Automatic caching (5 min stale time)
  - Background refetching
  - Optimistic updates
  - Query invalidation
- **Queries**:
  - `useTrends()`: Fetch all trends with filters
  - `useDomains()`: Fetch available domains
  - `usePipelineStatus()`: Poll pipeline status

#### Zustand
- **Purpose**: Client state management
- **State**:
  - `bookmarks`: Array of bookmarked trend IDs
  - `selectedDomain`: Current domain filter
  - `selectedStage`: Current stage filter
  - `viewMode`: 'grid' | 'list'
- **Persistence**: LocalStorage sync
- **Why Zustand**: 1KB, no boilerplate, simple API

### 8.3 Key Features Implementation

#### Server-Sent Events (SSE) Chat
```typescript
// useSSE.ts
const useSSE = (url: string, body: any) => {
  const [messages, setMessages] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const startStream = async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            setIsStreaming(false)
            return
          }
          const parsed = JSON.parse(data)
          setMessages(prev => [...prev, parsed.content])
        }
      }
    }
  }

  return { messages, isStreaming, startStream }
}
```

#### Optimistic Bookmarking
```typescript
// useStore.ts
const useStore = create<Store>()(
  persist(
    (set) => ({
      bookmarks: [],
      toggleBookmark: (id: string) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(id)
            ? state.bookmarks.filter((b) => b !== id)
            : [...state.bookmarks, id]
        }))
    }),
    { name: 'trendsense-storage' }
  )
)
```

### 8.4 Performance Optimizations

1. **Code Splitting**: React Router lazy loading
2. **Bundle Optimization**: Manual chunks (react-vendor, charts, motion, query)
3. **Image Optimization**: No images (icon library only)
4. **CSS Optimization**: Tailwind purge, 54KB CSS bundle
5. **Lazy Loading**: Framer Motion animations on-demand
6. **Memoization**: React.memo on expensive components

### 8.5 Responsive Design

- **Mobile-First**: Tailwind breakpoints (sm, md, lg, xl)
- **Sidebar**: Overlay on mobile, fixed on desktop
- **Grid**: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- **Typography**: Responsive font sizes with Tailwind

---


## 9. Backend Architecture

### 9.1 FastAPI Application Structure

```python
# main.py - Application entry point
app = FastAPI(title="TrendSense API")

# Middleware
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# Startup event
@app.on_event("startup")
async def startup():
    # Create database tables
    # Retry connection for Docker startup race conditions

# Endpoints
@app.get("/")                    # Health check
@app.get("/health")              # Detailed health status
@app.post("/run-pipeline")       # Trigger trend pipeline
@app.get("/pipeline-status")     # Check if pipeline is running
@app.get("/trends")              # Get all trends (with filters)
@app.get("/domains")             # Get available domains
@app.post("/query")              # SSE chat endpoint
```

### 9.2 Database Layer

#### SQLAlchemy Async ORM
```python
# database.py
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

#### Connection Pooling
- **Pool Size**: 5 connections
- **Max Overflow**: 10 connections
- **Pool Recycle**: 3600 seconds
- **Echo**: True (development), False (production)

#### Migration Strategy
- **Tool**: Alembic (not yet implemented)
- **Current**: `Base.metadata.create_all()` on startup
- **Future**: Proper migration files for schema changes

### 9.3 Background Tasks

#### Pipeline Execution
```python
_pipeline_running = False  # Global flag

@app.post("/run-pipeline")
async def trigger_pipeline(background_tasks: BackgroundTasks):
    if _pipeline_running:
        return {"status": "running"}
    background_tasks.add_task(run_intelligence_pipeline)
    return {"status": "started"}
```

#### Why Background Tasks
- **Non-Blocking**: API responds immediately
- **Long-Running**: Pipeline takes 25-35 seconds
- **User Experience**: User can continue browsing while pipeline runs
- **Status Polling**: Frontend polls `/pipeline-status` every 2 seconds

### 9.4 Error Handling

#### Graceful Degradation
```python
try:
    # Attempt operation
    result = await some_service.fetch()
except Exception as e:
    logger.error(f"Error: {str(e)}")
    # Continue with partial results
    # Add error to state["errors"]
```

#### Fallback Strategies
1. **Database Connection**: Falls back to SQLite if PostgreSQL unavailable
2. **NewsAPI**: Continues without news if API key missing
3. **ChromaDB**: Continues without RAG if ChromaDB unavailable
4. **LLM**: Returns cached/fallback response if Groq API fails

### 9.5 Logging

#### Structured Logging (structlog)
```python
logger.info("Pipeline started", domains=["AI", "Fintech"])
logger.error("Fetch failed", source="reddit", error=str(e))
```

#### Log Levels
- **DEBUG**: Detailed state transitions
- **INFO**: Pipeline progress, API calls
- **WARNING**: Fallbacks, missing configs
- **ERROR**: Exceptions, failed operations

---


## 10. Database Schema

### 10.1 PostgreSQL Tables

#### Trends Table
```sql
CREATE TABLE trends (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    domain VARCHAR NOT NULL,
    velocity_score FLOAT NOT NULL,
    stage VARCHAR NOT NULL,
    summary TEXT,
    investment_thesis TEXT,
    product_opportunity TEXT,
    risk_assessment TEXT,
    historical_accuracy TEXT,
    source_citations JSON,
    first_seen_at TIMESTAMP DEFAULT NOW(),
    velocity_history JSON,
    tvs_delta FLOAT DEFAULT 0.0,
    last_updated_at TIMESTAMP
);

CREATE INDEX idx_trends_domain ON trends(domain);
CREATE INDEX idx_trends_title ON trends(title);
CREATE INDEX idx_trends_velocity ON trends(velocity_score DESC);
```

**Fields Explained**:
- `velocity_score`: Trend Velocity Score (1-100)
- `stage`: Emerging | Rising | Mainstream
- `tvs_delta`: Change in TVS since last run (for trending indicators)
- `velocity_history`: JSON array of `[{date, score}]` for timeline view
- `source_citations`: JSON array of URLs

#### Raw Posts Table (Future Use)
```sql
CREATE TABLE raw_posts (
    id SERIAL PRIMARY KEY,
    source VARCHAR NOT NULL,
    source_id VARCHAR UNIQUE NOT NULL,
    title VARCHAR,
    content TEXT,
    score INTEGER,
    url VARCHAR,
    subreddit VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_raw_posts_source ON raw_posts(source);
CREATE UNIQUE INDEX idx_raw_posts_source_id ON raw_posts(source_id);
```

#### Daily Briefs Table
```sql
CREATE TABLE daily_briefs (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    date TIMESTAMP DEFAULT NOW()
);
```

### 10.2 ChromaDB Collections

#### Trends Collection
```python
collection = chroma_client.get_or_create_collection(
    name="trends",
    metadata={"description": "Historical trend embeddings"}
)

# Document structure
{
    "id": "trend_agentic_ai_frameworks",
    "embedding": [0.123, -0.456, ...],  # 384-dim vector
    "metadata": {
        "title": "Agentic AI Frameworks",
        "domain": "AI",
        "summary": "...",
        "sources": "url1,url2,url3"
    },
    "document": "Agentic AI Frameworks in AI: ..."  # Full text for retrieval
}
```

### 10.3 Data Relationships

```
┌─────────────────┐
│   raw_posts     │  (Future: Store all fetched signals)
└────────┬────────┘
         │
         │ Processed by Pipeline
         ▼
┌─────────────────┐
│     trends      │  (Current trends with TVS)
└────────┬────────┘
         │
         │ Embedded and stored
         ▼
┌─────────────────┐
│ ChromaDB        │  (Vector embeddings for RAG)
│ "trends"        │
└─────────────────┘
```

---


## 11. Key Algorithms & Metrics

### 11.1 Trend Velocity Score (TVS)

#### Current Implementation
The TVS is currently generated by the LLM (Groq Llama 3.3 70B) during the synthesis phase. The LLM considers:
- Signal volume and engagement (Reddit scores, HN points, comment counts)
- Sentiment metrics (compound scores from VADER + TextBlob)
- Recency (signals from last 24 hours weighted higher)
- Cross-platform validation (same trend appearing on multiple sources)

**LLM Prompt Instruction**:
```
"s_tvs": <number 1-100>
Calculate based on:
- Signal strength (engagement metrics)
- Sentiment intensity
- Cross-platform presence
- Novelty vs mainstream status
```

#### Future Enhancement: Algorithmic S-TVS
A more deterministic approach could be:

```python
def calculate_tvs(signals: List[Dict], sentiment_metrics: Dict) -> float:
    """
    S-TVS: Sentiment-Adjusted Trend Velocity Score
    
    Formula:
    TVS = (Volume × 0.3) + (Engagement × 0.3) + (Sentiment × 0.2) + (Recency × 0.2)
    
    Where:
    - Volume: Number of signals mentioning the trend (normalized 0-100)
    - Engagement: Average score/points across signals (normalized 0-100)
    - Sentiment: Compound sentiment score mapped to 0-100
    - Recency: Time decay factor (24h = 100, 7d = 50, 30d = 10)
    """
    
    # Volume component (0-100)
    volume_score = min(len(signals) / 50 * 100, 100)
    
    # Engagement component (0-100)
    avg_engagement = sum(s['score'] for s in signals) / len(signals)
    engagement_score = min(avg_engagement / 500 * 100, 100)
    
    # Sentiment component (0-100)
    # VADER compound: -1 to +1 → map to 0-100
    sentiment_score = (sentiment_metrics['compound'] + 1) * 50
    
    # Recency component (0-100)
    hours_old = (datetime.now() - signals[0]['created_at']).total_seconds() / 3600
    recency_score = max(100 - (hours_old / 24 * 50), 0)
    
    # Weighted sum
    tvs = (
        volume_score * 0.3 +
        engagement_score * 0.3 +
        sentiment_score * 0.2 +
        recency_score * 0.2
    )
    
    return round(tvs, 2)
```

### 11.2 TVS Delta Calculation

```python
def calculate_tvs_delta(current_tvs: float, previous_tvs: float) -> float:
    """
    Calculate change in TVS since last pipeline run.
    Positive = Rising trend
    Negative = Declining trend
    """
    return round(current_tvs - previous_tvs, 2)
```

### 11.3 Sentiment Analysis Pipeline

#### Dual-Model Approach

**TextBlob Analysis**:
```python
blob = TextBlob(text)
polarity = blob.sentiment.polarity      # -1 to +1
subjectivity = blob.sentiment.subjectivity  # 0 to 1
```

**VADER Analysis**:
```python
vader = SentimentIntensityAnalyzer()
scores = vader.polarity_scores(text)
# Returns: {'neg': 0.1, 'neu': 0.5, 'pos': 0.4, 'compound': 0.6}
```

**Combined Sentiment Label**:
```python
def get_sentiment_label(compound: float) -> str:
    if compound >= 0.05:
        return "Positive"
    elif compound <= -0.05:
        return "Negative"
    else:
        return "Neutral"
```

### 11.4 Vector Similarity Search

```python
# Query ChromaDB for similar trends
results = collection.query(
    query_embeddings=[embedding],
    n_results=3,
    where={"domain": domain}  # Optional filter
)

# Cosine similarity threshold
SIMILARITY_THRESHOLD = 0.85  # 85% similar = likely duplicate
```

---


## 12. API Documentation

### 12.1 REST Endpoints

#### GET /
**Purpose**: Root health check  
**Response**: `{"message": "Welcome to TrendSense API"}`

#### GET /health
**Purpose**: Detailed health status  
**Response**:
```json
{
  "status": "ok",
  "db": "ok",
  "chroma": "ok"
}
```

#### POST /run-pipeline
**Purpose**: Trigger trend intelligence pipeline  
**Request**: None  
**Response**:
```json
{
  "message": "Pipeline triggered in background.",
  "status": "started"
}
```
**Note**: Returns immediately; pipeline runs in background

#### GET /pipeline-status
**Purpose**: Check if pipeline is currently running  
**Response**:
```json
{
  "running": true
}
```

#### GET /trends
**Purpose**: Fetch all trends with optional filters  
**Query Parameters**:
- `domain` (optional): Filter by domain (AI, Fintech, Health, etc.)
- `stage` (optional): Filter by stage (Emerging, Rising, Mainstream)

**Response**:
```json
[
  {
    "id": 1,
    "title": "Agentic AI Frameworks",
    "domain": "AI",
    "velocity_score": 91.5,
    "tvs_delta": 5.2,
    "stage": "Rising",
    "summary": "AI agents that can plan, execute, and self-correct...",
    "investment_thesis": "Replacing traditional SaaS workflows...",
    "product_opportunity": "Build vertical-specific AI agents...",
    "risk_assessment": "Hype cycle peak; real adoption in 12-18 months",
    "source_citations": ["https://reddit.com/...", "https://news.ycombinator.com/..."],
    "first_seen_at": "2026-03-25T10:30:00Z"
  }
]
```

#### GET /domains
**Purpose**: Get list of available domains  
**Response**:
```json
["AI", "Fintech", "Health", "Biotech", "Crypto", "Climate"]
```

#### POST /query
**Purpose**: AI chat with streaming responses  
**Request**:
```json
{
  "question": "What are the top AI trends right now?"
}
```

**Response**: Server-Sent Events (SSE) stream
```
data: {"content": "Based"}
data: {"content": " on"}
data: {"content": " the"}
data: {"content": " latest"}
...
data: [DONE]
```

### 12.2 Frontend API Client

```typescript
// lib/api.ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
})

export const fetchTrends = async (params: Record<string, string> = {}) => {
  const { data } = await api.get('/trends', { params })
  return data
}

export const triggerPipeline = async () => {
  const { data } = await api.post('/run-pipeline')
  return data
}
```

---


## 13. Performance & Optimization

### 13.1 Frontend Performance

#### Build Metrics
- **Total Bundle Size**: 884 KB
- **Gzipped Size**: 256 KB
- **Build Time**: ~6 seconds
- **Chunks**: 7 optimized files
  - react-vendor: 177 KB (React, React DOM, React Router)
  - charts: 383 KB (Recharts)
  - motion: 0.06 KB (Framer Motion - lazy loaded)
  - query: 40 KB (TanStack Query, Zustand)
  - index: 230 KB (Application code)

#### Optimization Techniques
1. **Code Splitting**: Manual chunks for vendor libraries
2. **Tree Shaking**: Vite automatically removes unused code
3. **Minification**: esbuild minifier (faster than Terser)
4. **Compression**: nginx gzip compression (8.09 KB CSS, 256 KB total)
5. **Caching**: 1-year cache for static assets
6. **Lazy Loading**: Framer Motion animations loaded on-demand

#### Runtime Performance
- **First Contentful Paint (FCP)**: <1.5s
- **Time to Interactive (TTI)**: <3s
- **Lighthouse Score**: 90+ (Performance)

### 13.2 Backend Performance

#### Pipeline Timing
| Stage | Duration | Bottleneck |
|-------|----------|------------|
| Data Fetching | 3-5s | Network I/O (parallel) |
| Sentiment Analysis | 2-3s | CPU (100 signals × 20ms) |
| LLM Synthesis | 5-8s | Groq API (300+ tokens/sec) |
| RAG Validation | 10-15s | Vector search + LLM (8 trends) |
| Database Save | 1-2s | PostgreSQL writes |
| **Total** | **25-35s** | RAG validation (40% of time) |

#### Optimization Opportunities
1. **Batch Embeddings**: Generate all embeddings in one call (currently sequential)
2. **Parallel RAG**: Validate trends in parallel (currently sequential)
3. **Caching**: Cache LLM responses for similar queries
4. **Database Indexing**: Add composite indexes for common queries

#### API Response Times
- `/trends` (no filter): 50-100ms
- `/trends` (with filter): 30-50ms
- `/domains`: 20-30ms
- `/query` (SSE): Streams at 300+ tokens/sec

### 13.3 Database Performance

#### Query Optimization
```sql
-- Indexed queries are fast
SELECT * FROM trends WHERE domain = 'AI';  -- Uses idx_trends_domain
SELECT * FROM trends ORDER BY velocity_score DESC LIMIT 10;  -- Uses idx_trends_velocity
```

#### Connection Pooling
- Pool size: 5 connections
- Max overflow: 10 connections
- Typical active connections: 2-3

### 13.4 Scalability Considerations

#### Current Limits
- **Pipeline Concurrency**: 1 (global lock prevents concurrent runs)
- **Database**: Single PostgreSQL instance
- **ChromaDB**: Single instance, in-memory + disk persistence
- **API**: Single FastAPI instance (can handle ~1000 req/sec)

#### Scaling Strategies
1. **Horizontal Scaling**: Deploy multiple API instances behind load balancer
2. **Database Replication**: Read replicas for `/trends` queries
3. **Caching Layer**: Redis for frequently accessed trends
4. **Queue System**: Celery for pipeline jobs (remove global lock)
5. **CDN**: CloudFront/Cloudflare for static assets

---


## 14. Security Considerations

### 14.1 Current Security Measures

#### API Security
- **CORS**: Currently allows all origins (`allow_origins=["*"]`)
  - ⚠️ **Production**: Should restrict to specific domains
- **Rate Limiting**: Not implemented
  - ⚠️ **Recommendation**: Add rate limiting (10 req/min per IP)
- **Authentication**: Not implemented
  - ⚠️ **Recommendation**: Add API keys or OAuth for production

#### Environment Variables
- **Sensitive Data**: API keys stored in `.env` file
- **Git Ignore**: `.env` is gitignored (only `.env.example` committed)
- **Docker**: Environment variables passed via docker-compose

#### Database Security
- **Default Credentials**: Uses default PostgreSQL password
  - ⚠️ **Production**: Change to strong password
- **SQL Injection**: Protected by SQLAlchemy ORM (parameterized queries)
- **Connection**: No SSL/TLS for local development
  - ⚠️ **Production**: Enable SSL for database connections

#### Frontend Security
- **XSS Protection**: React escapes user input by default
- **Security Headers**: nginx adds security headers
  ```nginx
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  ```
- **HTTPS**: Not configured (HTTP only)
  - ⚠️ **Production**: Add SSL certificate (Let's Encrypt)

### 14.2 Production Security Checklist

- [ ] Restrict CORS to specific domains
- [ ] Add rate limiting (nginx or FastAPI middleware)
- [ ] Implement authentication (API keys, OAuth, JWT)
- [ ] Change default database password
- [ ] Enable database SSL/TLS
- [ ] Add HTTPS with SSL certificate
- [ ] Implement input validation and sanitization
- [ ] Add logging and monitoring (failed auth attempts)
- [ ] Set up firewall rules (only expose ports 80, 443)
- [ ] Regular security updates (Docker images, dependencies)

### 14.3 Data Privacy

#### User Data
- **No PII**: Application doesn't collect personal information
- **Bookmarks**: Stored in browser localStorage (client-side only)
- **Chat History**: Not persisted (session-only)

#### Third-Party Data
- **Reddit**: Public RSS feeds (no authentication)
- **HackerNews**: Public API (no authentication)
- **NewsAPI**: Requires API key (stored securely in `.env`)

---

