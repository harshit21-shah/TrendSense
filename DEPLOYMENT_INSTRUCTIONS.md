# TrendSense Full-Stack Deployment Guide

## Overview
This guide covers deploying both frontend (Vercel) and backend (Railway/Render) for TrendSense.

---

## Backend Deployment (Choose One)

### Option 1: Railway (Recommended - Easiest)

1. **Sign up at [Railway.app](https://railway.app)**
   - Connect your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `TrendSense` repository
   - Select `v1` branch

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create and connect it

4. **Configure Backend Service**
   - Click "New" → "GitHub Repo"
   - Select your TrendSense repo
   - Root Directory: `backend`
   - Build Command: (leave default)
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables**
   Go to your backend service → Variables tab:
   ```
   GROQ_API_KEY=your_groq_key
   OPENAI_API_KEY=your_openai_key (optional)
   REDDIT_CLIENT_ID=your_reddit_id (optional)
   REDDIT_CLIENT_SECRET=your_reddit_secret (optional)
   NEWS_API_KEY=your_news_api_key (optional)
   ENVIRONMENT=production
   LOG_LEVEL=INFO
   ```
   
   Note: `DATABASE_URL` is automatically set by Railway when you add PostgreSQL

6. **Deploy**
   - Railway will automatically deploy
   - Copy your backend URL (e.g., `https://trendsense-backend.up.railway.app`)

---

### Option 2: Render

1. **Sign up at [Render.com](https://render.com)**

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Select `TrendSense` repository, `v1` branch

3. **Configure Service**
   - Name: `trendsense-backend`
   - Environment: `Docker`
   - Dockerfile Path: `./backend/Dockerfile.prod`
   - Docker Context: `./backend`

4. **Add PostgreSQL Database**
   - In dashboard, click "New" → "PostgreSQL"
   - Name it `trendsense-db`
   - Copy the Internal Database URL

5. **Add Environment Variables**
   In your web service settings:
   ```
   DATABASE_URL=<paste_internal_database_url>
   GROQ_API_KEY=your_groq_key
   OPENAI_API_KEY=your_openai_key
   REDDIT_CLIENT_ID=your_reddit_id
   REDDIT_CLIENT_SECRET=your_reddit_secret
   NEWS_API_KEY=your_news_api_key
   ENVIRONMENT=production
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Copy your backend URL

---

## Frontend Deployment (Vercel)

1. **Sign up at [Vercel.com](https://vercel.com)**
   - Connect your GitHub account

2. **Import Project**
   - Click "Add New" → "Project"
   - Select `TrendSense` repository
   - Choose `v1` branch

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Root Directory: `.` (leave as root)
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm install`

4. **Add Environment Variable**
   - Key: `VITE_API_URL`
   - Value: Your backend URL from Railway/Render (e.g., `https://trendsense-backend.up.railway.app`)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

---

## Post-Deployment Steps

### 1. Test Backend Health
Visit: `https://your-backend-url.com/health`

Should return:
```json
{
  "status": "ok",
  "db": "ok",
  "chroma": "ok"
}
```

### 2. Initialize Data
Trigger the pipeline to populate initial trends:
```bash
curl -X POST https://your-backend-url.com/run-pipeline
```

### 3. Test Frontend
- Visit your Vercel URL
- Check if trends load
- Test the chat feature
- Verify all pages work

---

## Required API Keys

### Essential (Required for core functionality):
- **GROQ_API_KEY**: Get from [console.groq.com](https://console.groq.com)
  - Used for AI chat and trend analysis
  - Free tier available

### Optional (For data collection):
- **REDDIT_CLIENT_ID & SECRET**: Get from [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
  - Used for Reddit trend signals
  
- **NEWS_API_KEY**: Get from [newsapi.org](https://newsapi.org)
  - Used for news trend signals

- **OPENAI_API_KEY**: Get from [platform.openai.com](https://platform.openai.com)
  - Alternative to Groq (optional)

---

## Troubleshooting

### Backend Issues

**Database Connection Error:**
- Check `DATABASE_URL` is set correctly
- Ensure PostgreSQL service is running
- Verify database credentials

**Pipeline Fails:**
- Check API keys are valid
- Review logs in Railway/Render dashboard
- Ensure all required environment variables are set

**CORS Errors:**
- Verify `VITE_API_URL` in Vercel matches your backend URL
- Check backend CORS middleware allows your frontend domain

### Frontend Issues

**API Calls Fail:**
- Verify `VITE_API_URL` environment variable in Vercel
- Check backend is running and accessible
- Test backend `/health` endpoint

**Build Fails:**
- Check all dependencies are in `package.json`
- Verify Node version compatibility
- Review build logs in Vercel

---

## Monitoring & Maintenance

### Railway
- View logs: Project → Service → Logs tab
- Monitor usage: Project → Usage tab
- Restart service: Service → Settings → Restart

### Render
- View logs: Service → Logs tab
- Monitor metrics: Service → Metrics tab
- Manual deploy: Service → Manual Deploy

### Vercel
- View deployments: Project → Deployments
- Check analytics: Project → Analytics
- Redeploy: Deployments → Click "..." → Redeploy

---

## Cost Estimates

### Free Tier Limits:
- **Railway**: $5 free credit/month, then $0.000231/GB-hour
- **Render**: Free tier available (spins down after inactivity)
- **Vercel**: 100GB bandwidth/month free
- **PostgreSQL**: Included in Railway/Render free tier

### Recommended for Production:
- Railway Hobby: $5/month
- Render Starter: $7/month
- Vercel Pro: $20/month (if needed)

---

## Support

For issues:
1. Check logs in respective platforms
2. Review environment variables
3. Test backend `/health` endpoint
4. Verify API keys are valid

---

## Quick Links

- Railway Dashboard: https://railway.app/dashboard
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: https://github.com/harshit21-shah/TrendSense
