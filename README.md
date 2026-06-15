# TrendSense — Signal Intelligence Platform

A multi-agent AI system that continuously monitors 5 live data sources, synthesizes emerging trends, and surfaces investment-grade intelligence for founders and analysts.

![TrendSense](frontend/public/favicon.svg)

## What It Does

- **Fetches** signals from Reddit, Hacker News, NewsAPI, 20+ RSS feeds, and GitHub Trending in parallel
- **Analyzes** each domain (AI, Fintech, Health, Biotech, Climate, Crypto) with a dedicated LLM agent
- **Synthesizes** cross-domain trends, deduplicates overlapping signals, and scores each trend with a Trend Velocity Score (TVS 0–100)
- **Validates** each trend against a ChromaDB vector store of historical context
- **Generates** a daily executive intelligence brief in markdown
- **Notifies** in real-time when trends spike or fade (TVS delta ≥ 5)

Pipeline runs automatically every 12 hours (configurable).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 · TypeScript · Vite · TanStack Query v5 · Zustand · Tailwind CSS v4 · Framer Motion |
| Backend | FastAPI · SQLAlchemy (async) · LangGraph · LangChain · Groq (Llama 3.1) |
| Vector DB | ChromaDB (local persistent) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Scheduler | APScheduler |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env — set GROQ_API_KEY at minimum
```

Start the server:
```bash
uvicorn main:app --reload --port 8001
```

Backend runs at `http://localhost:8001`. Swagger docs at `/docs`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8001
```

Start dev server:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Run the Pipeline

Either click **Run** in the top bar of the app, or:
```bash
curl -X POST http://localhost:8001/run-pipeline
```

The pipeline takes ~60–90 seconds and populates the trend database.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | LLM inference ([console.groq.com](https://console.groq.com)) |
| `GROQ_MODEL` | No | Default: `llama-3.1-8b-instant` |
| `NEWS_API_KEY` | No | [newsapi.org](https://newsapi.org) — enriches news signals |
| `REDDIT_CLIENT_ID` | No | Reddit OAuth2 — 100 req/min vs ~1/min unauthenticated |
| `REDDIT_CLIENT_SECRET` | No | Reddit OAuth2 secret |
| `PIPELINE_DOMAINS` | No | Comma-separated list. Default: `AI,Fintech,Health,Biotech,Climate,Crypto` |
| `PIPELINE_SCHEDULE_MINUTES` | No | Auto-run interval. Default: `720` (12 hours) |
| `PIPELINE_API_KEY` | No | Protects `/run-pipeline` endpoint in production |
| `DATABASE_URL` | No | Default: `sqlite+aiosqlite:///trendsense.db` |
| `CORS_ORIGINS` | No | Comma-separated. Default: `http://localhost:5173` |

## Architecture

```
5 Source Agents (parallel)
  ├── Reddit RSS / OAuth2
  ├── Hacker News API
  ├── NewsAPI
  ├── 20+ RSS Feeds
  └── GitHub Trending
         │
         ▼
  Sentiment Agent (batch labeling)
         │
         ▼
  Domain Analyst Agents (parallel, one per domain)
         │
         ▼
  Synthesis Coordinator (cross-domain ranking)
         │
         ▼
  RAG Validation Agent (ChromaDB fact-check)
         │
         ▼
  Brief Agent (daily markdown report)
         │
         ▼
  Persist to SQLite → API → React UI
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | System health |
| GET | `/trends` | Ranked trend list (filterable) |
| GET | `/trends/{id}` | Single trend detail |
| GET | `/search?q=` | Full-text search |
| GET | `/domains` | Domain distribution |
| GET | `/stages` | Stage distribution |
| GET | `/daily-brief` | Latest AI-generated brief |
| GET | `/notifications` | Trend spike/fade alerts |
| GET | `/pipeline-status` | Current run status |
| POST | `/run-pipeline` | Trigger pipeline |
| POST | `/query` | SSE streaming chat (RAG) |

## Production Deployment

See [`SETUP_GUIDE.md`](SETUP_GUIDE.md) for Railway / Docker deployment.

## License

MIT — see [`LICENSE`](LICENSE).
