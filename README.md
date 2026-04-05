# TrendSense

Real-time market intelligence platform powered by a LangGraph multi-agent AI pipeline. Aggregates signals from Reddit, Hacker News, and 12+ RSS news feeds, then synthesizes them into actionable trend intelligence with **Trend Velocity Scores (TVS)**.

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-multiagent-orange)](https://langchain-ai.github.io/langgraph/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## What It Does

TrendSense continuously monitors the internet for emerging signals across **AI, Fintech, Health, Biotech, Climate, and Crypto** domains. A LangGraph pipeline fetches raw data, runs sentiment analysis, synthesizes trends using an LLM, and validates them against historical context via RAG — all automatically.

Each trend gets a **TVS (Trend Velocity Score)** from 0–100 representing how fast it's accelerating, along with an investment thesis, product opportunity, and risk assessment written by the AI.

---

## Features

- **Multi-source signal aggregation** — Reddit RSS, Hacker News (Algolia), NewsAPI, and 12 RSS feeds (TechCrunch, Wired, The Verge, Ars Technica, MIT Tech Review, VentureBeat, Nature, Product Hunt, and more)
- **LangGraph 4-node pipeline** — Fetcher → Sentiment → Synthesis → RAG validation
- **TVS scoring** — 0–100 velocity score with delta tracking (rising/falling)
- **AI chat (Shruti)** — SSE-streamed conversational interface grounded in stored trends via ChromaDB
- **Semantic deduplication** — Jaccard + string similarity removes duplicate trends before serving
- **Daily brief** — Markdown intelligence report
- **Historical timeline** — Track trend evolution over time
- **Watchlist** — Save and organize signals
- **Dark mode + mobile responsive** — Tailwind CSS + Framer Motion UI

---

## Architecture

```
┌─────────────────────────────────────────┐
│           React Frontend                │
│  Dashboard / Timeline / Chat / Brief    │
└──────────────────┬──────────────────────┘
                   │ REST + SSE
┌──────────────────▼──────────────────────┐
│           FastAPI Backend               │
│  /trends  /search  /query  /health      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│       LangGraph Pipeline                │
│                                         │
│  [Fetcher Node]                         │
│   ├─ Reddit RSS (7 subreddits)          │
│   ├─ Hacker News Algolia API            │
│   ├─ NewsAPI (4 categories)             │
│   └─ RSS Feeds (12 sources)             │
│          ↓                              │
│  [Sentiment Node]  ← VADER + TextBlob   │
│          ↓                              │
│  [Synthesis Node]  ← Groq LLM          │
│          ↓                              │
│  [RAG Validation]  ← ChromaDB          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Data Layer                    │
│   SQLite / PostgreSQL  +  ChromaDB      │
└─────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Query, Vite |
| Backend | FastAPI, Uvicorn, SQLAlchemy (async), aiosqlite / asyncpg |
| AI Pipeline | LangGraph, LangChain, Groq (Llama 3.1 8B) |
| Vector DB | ChromaDB (persistent local or HTTP client) |
| Sentiment | VADER + TextBlob |
| Data Sources | Reddit RSS, HN Algolia, NewsAPI, 12× RSS feeds |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A free [Groq API key](https://console.groq.com/) (required)
- A free [NewsAPI key](https://newsapi.org/) (optional — RSS feeds work without it)

### 1. Clone

```bash
git clone https://github.com/harshit21-shah/TrendSense.git
cd TrendSense
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=gsk_your_key_here
NEWS_API_KEY=your_newsapi_key        # optional
DATABASE_URL=sqlite+aiosqlite:///trendsense.db
CHROMA_HOST=
CHROMA_PORT=8000
LOG_LEVEL=INFO
ENVIRONMENT=development
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

App is at `http://localhost:5173`, API docs at `http://localhost:8000/docs`.

### 4. Run with Docker Compose

```bash
docker-compose up -d
```

- Frontend: `http://localhost:80`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
- ChromaDB: `localhost:8001`

---

## Running the Pipeline

The pipeline doesn't run automatically on startup — trigger it manually via the UI or API:

```bash
# Trigger via API
curl -X POST http://localhost:8000/run-pipeline

# Check status
curl http://localhost:8000/pipeline-status
```

Or click **"Run Pipeline"** in the dashboard. It runs in the background and takes ~30–60 seconds depending on network speed and Groq response time.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | DB + ChromaDB health check |
| `GET` | `/trends` | List trends (filter by `domains`, `stages`) |
| `GET` | `/search?q=...` | Full-text search across trends |
| `GET` | `/domains` | Domain list with counts |
| `GET` | `/stages` | Stage list with counts |
| `POST` | `/run-pipeline` | Trigger the LangGraph pipeline |
| `GET` | `/pipeline-status` | Check if pipeline is running |
| `POST` | `/query` | SSE stream — AI chat grounded in trends |
| `GET` | `/deduplication-report` | Stats on duplicate trends in DB |

Full interactive docs: `http://localhost:8000/docs`

---

## Project Structure

```
TrendSense/
├── backend/
│   ├── app/
│   │   ├── graph.py            # LangGraph pipeline definition
│   │   ├── fetcher nodes:
│   │   │   ├── reddit_service.py   # Reddit RSS
│   │   │   ├── hn_service.py       # Hacker News Algolia
│   │   │   ├── news_service.py     # NewsAPI
│   │   │   └── rss_service.py      # 12 RSS feeds
│   │   ├── sentiment_agent.py  # VADER + TextBlob node
│   │   ├── synthesis_agent.py  # Groq LLM synthesis node
│   │   ├── rag_agent.py        # ChromaDB RAG validation node
│   │   ├── chroma_service.py   # Vector DB client
│   │   ├── deduplication.py    # Semantic dedup (Jaccard + string sim)
│   │   ├── models.py           # SQLAlchemy ORM models
│   │   ├── database.py         # Async DB engine + session
│   │   ├── config.py           # Pydantic settings
│   │   ├── text_utils.py       # Title normalization
│   │   └── logger.py           # Structlog setup
│   ├── main.py                 # FastAPI app + all endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Main trend feed
│   │   │   ├── Timeline.tsx    # Historical view
│   │   │   ├── DailyBrief.tsx  # AI-generated brief
│   │   │   └── Saved.tsx       # Bookmarked trends
│   │   ├── components/
│   │   │   ├── trends/         # TrendRow, TrendDrawer
│   │   │   ├── layout/         # Header, Sidebar, MobileNav
│   │   │   └── ui/             # Badge, ExpandableText, Filters
│   │   ├── hooks/              # useAutoSync, custom hooks
│   │   ├── store/              # Zustand state
│   │   ├── api/                # API client
│   │   └── types/              # TypeScript types
│   └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key — get one free at [console.groq.com](https://console.groq.com) |
| `NEWS_API_KEY` | No | NewsAPI key — RSS feeds work without it |
| `DATABASE_URL` | Yes | SQLite (`sqlite+aiosqlite:///trendsense.db`) or PostgreSQL |
| `CHROMA_HOST` | No | Leave empty for local persistent ChromaDB |
| `CHROMA_PORT` | No | Default `8000` |
| `LOG_LEVEL` | No | `INFO` or `DEBUG` |
| `ENVIRONMENT` | No | `development` or `production` |

---

## Deployment

### Railway (backend) + Vercel (frontend)

The repo includes `railway.json` and `railway.toml` for one-click Railway deploys.

1. Push to GitHub
2. Create a new Railway project, connect the repo, set root to `backend/`
3. Add env vars in Railway dashboard
4. Deploy frontend to Vercel, set `VITE_API_URL` to your Railway backend URL

### Docker (production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Data Sources

| Source | Type | Requires Key |
|---|---|---|
| Reddit | RSS (public) | No |
| Hacker News | Algolia API (public) | No |
| TechCrunch (main + AI/Fintech/Climate/Health) | RSS | No |
| The Verge | RSS | No |
| Wired | RSS | No |
| Ars Technica | RSS | No |
| MIT Technology Review | RSS | No |
| VentureBeat | RSS | No |
| Nature News | RSS | No |
| Product Hunt | RSS | No |
| NewsAPI | REST API | Yes (free tier) |

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE).
