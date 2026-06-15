# TrendSense Deployment Guide

## Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- Environment variables configured in `.env` file

### Quick Start

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API keys:
   - GROQ_API_KEY
   - OPENAI_API_KEY
   - REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT
   - NEWS_API_KEY

3. Build and start production containers:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Health Check
```bash
curl http://localhost:8000/health
```

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Production Checklist

- [ ] All API keys configured in `.env`
- [ ] Database credentials updated (change default password)
- [ ] CORS origins restricted in `backend/main.py` if needed
- [ ] SSL/TLS certificate configured for HTTPS
- [ ] Firewall rules configured
- [ ] Backup strategy for PostgreSQL database
- [ ] Monitoring and logging configured
- [ ] Resource limits set in docker-compose

### Security Notes

1. Change default database password in production
2. Use environment-specific secrets management
3. Enable HTTPS with reverse proxy (nginx/traefik)
4. Restrict CORS origins to your domain
5. Set up rate limiting on API endpoints

### Scaling

To scale backend workers:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Troubleshooting

If database connection fails:
- Check that PostgreSQL is healthy: `docker-compose -f docker-compose.prod.yml ps`
- View backend logs: `docker-compose -f docker-compose.prod.yml logs backend`

If frontend shows API errors:
- Verify backend is running: `curl http://localhost:8000/health`
- Check nginx proxy configuration in `frontend/nginx.conf`
