# TrendSense — Requirements Document

## 1. Project Overview

TrendSense is a proactive, multi-agent AI system that continuously monitors internet sources (Reddit, HackerNews, NewsAPI) to detect emerging trends **2–3 weeks before they go mainstream**. It scores trend velocity, stores historical signal data, and delivers a daily intelligence brief via a React dashboard — helping founders, investors, and product teams act on what's about to matter.

---

## 2. Goals

- Detect weak signals from high-signal communities before mainstream coverage
- Score and rank trends by velocity (acceleration rate, not just volume)
- Provide source-cited, summarized trend cards — not raw data dumps
- Allow users to subscribe to specific domains (AI, fintech, health, crypto, etc.)
- Show trend timelines — when a topic first appeared vs when it exploded
- Be fully automated — runs daily with zero manual input

---

## 3. Functional Requirements

### 3.1 Data Collection
- **FR-01**: System shall fetch top posts and comments from Reddit (minimum 5 configurable subreddits per domain)
- **FR-02**: System shall fetch top stories and comments from HackerNews (Ask HN, Show HN, top stories)
- **FR-03**: System shall fetch news articles from NewsAPI across configurable categories
- **FR-04**: System shall run data collection on a daily scheduled pipeline (configurable cron)
- **FR-05**: System shall deduplicate content across sources using semantic similarity
- **FR-06**: System shall store raw collected data with timestamps in a PostgreSQL database

### 3.2 Trend Detection
- **FR-07**: System shall compute a **Sentiment-Adjusted Trend Velocity Score (S-TVS)** — weighting velocity by positive/negative sentiment intensity.
- **FR-08**: System shall perform **Emotion Detection** (e.g., Fear, Joy, Anger, Surprise) on clustered topics to identify "hype" vs "controversy".
- **FR-09**: System shall use a vector database (ChromaDB) with **Hybrid Search** (semantic + keyword) for high-precision historical trend retrieval.
- **FR-10**: System shall cluster semantically similar content using **BERTopic** or similar embedding-based clustering for automated topic discovery.
- **FR-11**: System shall tag each trend with a domain label and classify stage: Emerging, Rising, Mainstream.

### 3.3 Multi-Agent Orchestration
- **FR-12**: System shall implement a **Router Agent** for dispatching.
- **FR-13**: System shall implement a **Sentiment Agent** that performs fine-grained sentiment and emotion analysis on raw signals.
- **FR-14**: System shall implement a **Reddit Agent**, **HackerNews Agent**, and **News Agent**.
- **FR-15**: System shall implement a **Synthesis Agent** that generates not just a summary, but an **Actionable Intelligence Brief** (Investment Thesis, Product Opportunity, Risks).
- **FR-16**: System shall implement a **RAG Agent** with **Self-Correction** (verifying LLM outputs against source data).
- **FR-17**: All agents orchestrated via LangGraph with **LangSmith Observability** for tracing and evaluation.

### 3.4 Trend Summaries
- **FR-19**: Each trend card shall include: title, domain tag, TVS score, trend stage, 2–3 sentence summary, top 3 source citations with links, first-seen date, and velocity chart data
- **FR-20**: System shall generate a **Daily Brief** — a top-10 trend digest in markdown format, delivered at 7:00 AM IST
- **FR-21**: Summaries shall be generated using an LLM (Groq Llama 3.1 or OpenAI GPT-4o) with source-grounded prompting to avoid hallucination

### 3.5 User Interface (React Dashboard)
- **FR-22**: Dashboard shall display trend cards sorted by TVS score descending
- **FR-23**: Each trend card shall be expandable to show full summary, sources, and 7-day velocity sparkline
- **FR-24**: Dashboard shall support filtering by domain, trend stage, and date range
- **FR-25**: Dashboard shall include a search bar for querying specific topics
- **FR-26**: Dashboard shall display a **Trend Timeline view** — showing when topics first appeared vs when they peaked
- **FR-27**: Users shall be able to bookmark trends and export the daily brief as PDF
- **FR-28**: Dashboard shall show a "Trending Now" live ticker for the top 5 trends of the day

### 3.6 API (FastAPI Backend)
- **FR-29**: Backend shall expose `GET /trends` — returns paginated list of trend cards with filters
- **FR-30**: Backend shall expose `GET /trends/{id}` — returns full trend detail
- **FR-31**: Backend shall expose `GET /brief/today` — returns today's daily brief
- **FR-32**: Backend shall expose `POST /query` — accepts a natural language question and returns relevant trends via RAG
- **FR-33**: Backend shall expose `GET /timeline/{topic}` — returns historical velocity data for a topic
- **FR-34**: Backend shall stream LLM responses via Server-Sent Events (SSE)

### 3.7 Conversational Query
- **FR-35**: Users shall be able to type natural language questions (e.g. "What's emerging in AI infrastructure this week?") and receive RAG-grounded answers
- **FR-36**: Conversation history shall be maintained per session using LangChain memory

---

## 4. Non-Functional Requirements

- **NFR-01 Performance**: API responses shall return within 800ms for cached trend data
- **NFR-02 Scalability**: Pipeline shall handle 10,000+ raw data points per daily run
- **NFR-03 Reliability**: Pipeline failures shall be logged and retried with exponential backoff
- **NFR-04 Accuracy**: TVS algorithm shall produce consistent, reproducible scores for the same input
- **NFR-05 Security**: All API keys stored in environment variables, never hardcoded
- **NFR-06 Observability**: All agent steps shall be logged with timestamps for debugging
- **NFR-07 Portability**: Full system runnable via Docker Compose with a single command

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| Agent Orchestration | LangGraph |
| LLM | Groq (Llama 3.1 70b) / OpenAI GPT-4o |
| LLM Framework | LangChain |
| Vector Database | ChromaDB (local) |
| Backend API | FastAPI + Python 3.11 |
| Task Scheduler | APScheduler |
| Primary Database | PostgreSQL |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Charts | Recharts |
| Data Sources | Reddit API (PRAW), HackerNews API, NewsAPI |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Containerization | Docker + Docker Compose |

---

## 6. Out of Scope (v1)

- User authentication / accounts
- Email/Slack notifications
- Mobile app
- Real-time websocket streaming (SSE only)
- Twitter/X integration (API cost)
- Fine-tuning any model
