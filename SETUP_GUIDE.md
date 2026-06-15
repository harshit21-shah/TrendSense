# 🚀 TrendSense Setup Guide

Complete step-by-step guide to get TrendSense running locally.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** and npm ([Download](https://nodejs.org/))
- ✅ **Python 3.11+** ([Download](https://www.python.org/))
- ✅ **PostgreSQL 15+** ([Download](https://www.postgresql.org/))
- ✅ **Git** ([Download](https://git-scm.com/))
- ✅ **Docker & Docker Compose** (Optional, [Download](https://www.docker.com/))

## 🔑 API Keys Required

You'll need to sign up for these free services:

1. **Groq API** (Required)
   - Sign up: https://console.groq.com/
   - Create API key
   - Free tier: 30 requests/minute

2. **Reddit API** (Required)
   - Go to: https://www.reddit.com/prefs/apps
   - Click "Create App" or "Create Another App"
   - Select "script" type
   - Note your client ID and secret

3. **NewsAPI** (Required)
   - Sign up: https://newsapi.org/register
   - Free tier: 100 requests/day
   - Copy your API key

## 🐳 Option 1: Docker Setup (Recommended)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/trendsense.git
cd trendsense
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your favorite editor
nano .env  # or vim, code, etc.
```

Fill in your API keys:
```env
GROQ_API_KEY=gsk_your_actual_key_here
REDDIT_CLIENT_ID=your_actual_client_id
REDDIT_CLIENT_SECRET=your_actual_secret
NEWS_API_KEY=your_actual_newsapi_key
```

### Step 3: Start Services

```bash
# Start all services (backend, frontend, postgres, chromadb)
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 4: Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **ChromaDB:** http://localhost:8001

### Step 5: Initialize Database

```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# (Optional) Seed with sample data
docker-compose exec backend python -m app.seed_data
```

### Step 6: Trigger First Sync

```bash
# Manually trigger the pipeline
curl -X POST http://localhost:8000/api/sync

# Or wait for automatic sync (every 30 minutes)
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 💻 Option 2: Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/trendsense.git
cd trendsense
```

### Step 2: Setup PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE trendsense_db;
CREATE USER trendsense WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trendsense_db TO trendsense;
\q
```

### Step 3: Setup ChromaDB

```bash
# Install ChromaDB
pip install chromadb

# Run ChromaDB server
chroma run --path ./chroma_db --port 8001
```

Keep this terminal open or run in background.

### Step 4: Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env
```

Configure backend `.env`:
```env
DATABASE_URL=postgresql+asyncpg://trendsense:your_password@localhost:5432/trendsense_db
CHROMA_URL=http://localhost:8001
GROQ_API_KEY=gsk_your_actual_key
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_secret
NEWS_API_KEY=your_newsapi_key
```

```bash
# Run migrations
alembic upgrade head

# Start backend server
uvicorn main:app --reload --port 8000
```

Keep this terminal open.

### Step 5: Setup Frontend

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
nano .env
```

Configure frontend `.env`:
```env
VITE_API_URL=http://localhost:8000
```

```bash
# Start development server
npm run dev
```

### Step 6: Access Application

- **Frontend:** http://localhost:5173 (Vite default)
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Step 7: Trigger First Sync

Open a new terminal:

```bash
# Manually trigger pipeline
curl -X POST http://localhost:8000/api/sync

# Or use the UI: Click "SYNC" button in dashboard
```

---

## 🔧 Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Error:** `Connection refused to PostgreSQL`
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Check connection string in .env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/trendsense_db
```

**Error:** `GROQ_API_KEY not found`
```bash
# Make sure .env file exists in backend/
ls -la backend/.env

# Check .env is loaded
cat backend/.env | grep GROQ_API_KEY
```

### Frontend won't start

**Error:** `Cannot find module 'react'`
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error:** `Failed to fetch from backend`
```bash
# Check VITE_API_URL in frontend/.env
cat frontend/.env

# Make sure backend is running
curl http://localhost:8000/health
```

### ChromaDB issues

**Error:** `Connection refused to ChromaDB`
```bash
# Start ChromaDB server
chroma run --path ./chroma_db --port 8001

# Or use Docker
docker run -p 8001:8001 chromadb/chroma
```

### Database migration issues

**Error:** `alembic: command not found`
```bash
# Install alembic
pip install alembic

# Or reinstall all dependencies
pip install -r requirements.txt
```

**Error:** `Target database is not up to date`
```bash
# Run migrations
cd backend
alembic upgrade head

# If issues persist, reset database
alembic downgrade base
alembic upgrade head
```

### Docker issues

**Error:** `port is already allocated`
```bash
# Check what's using the port
lsof -i :8000  # or :3000, :5432, etc.

# Stop conflicting service or change port in docker-compose.yml
```

**Error:** `Cannot connect to Docker daemon`
```bash
# Start Docker Desktop (Windows/macOS)
# Or start Docker service (Linux)
sudo systemctl start docker
```

---

## 🧪 Verify Installation

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### 2. Check Database Connection

```bash
curl http://localhost:8000/api/domains
# Expected: List of domains
```

### 3. Check Frontend

Open http://localhost:3000 (or :5173) in browser
- Should see TrendSense dashboard
- No console errors

### 4. Test Pipeline

```bash
# Trigger manual sync
curl -X POST http://localhost:8000/api/sync

# Check logs
docker-compose logs -f backend  # Docker
# or check terminal where uvicorn is running
```

### 5. Test Chat

- Go to Chat page
- Type: "What are the top AI trends?"
- Should get streaming response

---

## 📚 Next Steps

1. **Explore the Dashboard**
   - Browse signals by domain
   - Filter by stage (Emerging, Rising, Mainstream)
   - Click signals to see details

2. **Try the Chat**
   - Ask about specific trends
   - Query historical data
   - Get investment insights

3. **Check the Brief**
   - View daily intelligence summary
   - Export to PDF
   - Share with team

4. **Customize Configuration**
   - Edit `backend/app/config.py` for domains
   - Adjust sync schedule in `.env`
   - Configure rate limits

5. **Read Documentation**
   - [API Documentation](http://localhost:8000/docs)
   - [Architecture Guide](README.md#architecture)
   - [Contributing Guide](CONTRIBUTING.md)

---

## 🆘 Getting Help

- **GitHub Issues:** [Report a bug](https://github.com/yourusername/trendsense/issues)
- **Discussions:** [Ask questions](https://github.com/yourusername/trendsense/discussions)
- **Discord:** [Join community](https://discord.gg/trendsense)
- **Email:** support@trendsense.dev

---

## 🎉 Success!

If you see the TrendSense dashboard with signals, you're all set! 

**Pro Tips:**
- First sync takes 5-10 minutes to collect data
- Bookmark interesting signals for later
- Use keyboard shortcuts (press `?` to see them)
- Enable notifications for new high-TVS signals

Happy trend hunting! 🚀
