import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import FastAPI, BackgroundTasks, Depends, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, or_, func
import uvicorn
import asyncio

from app.database import engine, Base, get_db
from app.models import Trend, DailyBrief, Notification, PipelineRun
from app.config import settings
from app.logger import logger
from app.pipeline_service import (
    run_intelligence_pipeline,
    is_pipeline_running,
    get_last_pipeline_result,
    trend_to_dict,
)
from app.scheduler import start_scheduler, stop_scheduler
from app.deduplication import deduplicator
from app.domains import get_active_domains, get_source_catalog, DOMAIN_STAGES

app = FastAPI(title="TrendSense API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list if settings.ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _verify_pipeline_key(x_api_key: Optional[str] = Header(None)):
    if settings.PIPELINE_API_KEY and x_api_key != settings.PIPELINE_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid pipeline API key")


async def _migrate_schema(conn):
    """Apply lightweight additive migrations for SQLite schema drift."""
    migrations = [
        "ALTER TABLE daily_briefs ADD COLUMN trend_count INTEGER DEFAULT 0",
        "ALTER TABLE daily_briefs ADD COLUMN signal_count INTEGER DEFAULT 0",
        "ALTER TABLE pipeline_runs ADD COLUMN signals_fetched INTEGER DEFAULT 0",
        "ALTER TABLE pipeline_runs ADD COLUMN trends_saved INTEGER DEFAULT 0",
        "ALTER TABLE pipeline_runs ADD COLUMN errors JSON",
        "ALTER TABLE pipeline_runs ADD COLUMN stats JSON",
        "ALTER TABLE trends ADD COLUMN tvs_delta REAL DEFAULT 0.0",
        "ALTER TABLE trends ADD COLUMN velocity_history JSON",
        "ALTER TABLE trends ADD COLUMN last_updated_at DATETIME",
    ]
    for stmt in migrations:
        try:
            await conn.execute(text(stmt))
        except Exception:
            pass  # Column already exists — ignore


@app.on_event("startup")
async def startup():
    for attempt in range(10):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                await _migrate_schema(conn)
            logger.info("Database tables ready.")
            break
        except Exception as e:
            logger.warning(f"DB not ready (attempt {attempt + 1}/10): {e}")
            await asyncio.sleep(3)
    else:
        logger.error("Could not connect to database after 10 attempts.")

    start_scheduler()


@app.on_event("shutdown")
async def shutdown():
    stop_scheduler()


@app.get("/")
async def root():
    return {
        "message": "TrendSense Multi-Agent Intelligence API",
        "version": "2.0.0",
        "agents": ["supervisor", "fetch_coordinator", "sentiment", "domain_analyst", "synthesis", "rag_validation", "brief"],
    }


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "ok"
    chroma_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"
    try:
        from app.chroma_service import chroma_service
        chroma_service.collection.count()
    except Exception:
        chroma_status = "error"
    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "db": db_status,
        "chroma": chroma_status,
        "groq_configured": bool(settings.GROQ_API_KEY),
        "newsapi_configured": bool(settings.NEWS_API_KEY),
        "pipeline_running": is_pipeline_running(),
        "scheduler_minutes": settings.PIPELINE_SCHEDULE_MINUTES,
        "domains": get_active_domains(),
    }


@app.get("/sources")
async def get_sources(db: AsyncSession = Depends(get_db)):
    catalog = get_source_catalog()
    last_run = await db.execute(select(PipelineRun).order_by(PipelineRun.started_at.desc()).limit(1))
    run = last_run.scalar_one_or_none()
    source_counts = (run.stats or {}).get("source_counts", {}) if run and run.stats else {}
    for src in catalog:
        src["last_count"] = source_counts.get(src["id"], 0)
    return {
        "sources": catalog,
        "total_feeds": sum(s.get("feed_count", 0) for s in catalog),
        "last_pipeline": {
            "signals_fetched": run.signals_fetched if run else 0,
            "completed_at": run.completed_at.isoformat() if run and run.completed_at else None,
        } if run else None,
    }


@app.post("/run-pipeline")
async def trigger_pipeline(
    background_tasks: BackgroundTasks,
    domains: Optional[str] = None,
    _: None = Depends(_verify_pipeline_key),
):
    if is_pipeline_running():
        return {"message": "Pipeline already running.", "status": "running"}

    domain_list = [d.strip() for d in domains.split(",")] if domains else None
    background_tasks.add_task(run_intelligence_pipeline, domain_list)
    return {"message": "Multi-agent pipeline triggered.", "status": "started"}


@app.get("/pipeline-status")
async def pipeline_status(db: AsyncSession = Depends(get_db)):
    last_run = await db.execute(
        select(PipelineRun).order_by(PipelineRun.started_at.desc()).limit(1)
    )
    run = last_run.scalar_one_or_none()
    return {
        "running": is_pipeline_running(),
        "last_result": get_last_pipeline_result(),
        "last_run": {
            "id": run.id,
            "status": run.status,
            "started_at": run.started_at.isoformat() if run and run.started_at else None,
            "completed_at": run.completed_at.isoformat() if run and run.completed_at else None,
            "signals_fetched": run.signals_fetched if run else 0,
            "trends_saved": run.trends_saved if run else 0,
        } if run else None,
    }


def _apply_trend_filters(query, **filters):
    if filters.get("domains"):
        # Case-insensitive prefix match so "AI" also catches "ai", "AI | Cloud", etc.
        domain_conditions = [
            func.lower(Trend.domain).like(f"{d.lower().rstrip()}%")
            for d in filters["domains"]
        ]
        query = query.where(or_(*domain_conditions))
    if filters.get("stages"):
        # Case-insensitive exact match for stages
        stage_lower = [s.lower() for s in filters["stages"]]
        query = query.where(func.lower(Trend.stage).in_(stage_lower))
    if filters.get("tvs_min") is not None:
        query = query.where(Trend.velocity_score >= filters["tvs_min"])
    if filters.get("tvs_max") is not None:
        query = query.where(Trend.velocity_score <= filters["tvs_max"])
    if filters.get("momentum_min") is not None:
        query = query.where(Trend.tvs_delta >= filters["momentum_min"])
    if filters.get("momentum_max") is not None:
        query = query.where(Trend.tvs_delta <= filters["momentum_max"])
    if filters.get("since"):
        since_dt = datetime.now(timezone.utc) - timedelta(days=filters["since"])
        query = query.where(Trend.first_seen_at >= since_dt)
    return query


@app.get("/trends")
async def get_trends(
    domains: Optional[str] = None,
    stages: Optional[str] = None,
    tvs_min: Optional[float] = None,
    tvs_max: Optional[float] = None,
    momentum_min: Optional[float] = None,
    momentum_max: Optional[float] = None,
    time_range: Optional[str] = None,
    deduplicate: bool = True,
    db: AsyncSession = Depends(get_db),
):
    since_days = {"7d": 7, "30d": 30, "90d": 90}.get(time_range or "")

    query = select(Trend).order_by(Trend.velocity_score.desc())
    query = _apply_trend_filters(
        query,
        domains=domains.split(",") if domains else None,
        stages=stages.split(",") if stages else None,
        tvs_min=tvs_min,
        tvs_max=tvs_max,
        momentum_min=momentum_min,
        momentum_max=momentum_max,
        since=since_days,
    )

    result = await db.execute(query)
    trends = [trend_to_dict(t) for t in result.scalars().all()]

    if deduplicate:
        trends = deduplicator.deduplicate(trends)

    return trends


@app.get("/trends/{trend_id}")
async def get_trend(trend_id: int, db: AsyncSession = Depends(get_db)):
    trend = await db.get(Trend, trend_id)
    if not trend:
        raise HTTPException(status_code=404, detail="Trend not found")
    return trend_to_dict(trend)


@app.get("/domains")
async def get_domains(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trend.domain, func.count(Trend.id))
        .where(Trend.domain.isnot(None))
        .group_by(Trend.domain)
        .order_by(func.count(Trend.id).desc())
    )
    rows = [{"name": row[0], "count": row[1]} for row in result.all()]
    for domain in get_active_domains():
        if not any(r["name"] == domain for r in rows):
            rows.append({"name": domain, "count": 0})
    return rows


@app.get("/stages")
async def get_stages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trend.stage, func.count(Trend.id))
        .where(Trend.stage.isnot(None))
        .group_by(Trend.stage)
    )
    return [{"name": row[0], "count": row[1]} for row in result.all()]


@app.get("/search")
async def search_trends(q: str, db: AsyncSession = Depends(get_db)):
    query = select(Trend).where(
        or_(
            Trend.title.ilike(f"%{q}%"),
            Trend.summary.ilike(f"%{q}%"),
            Trend.domain.ilike(f"%{q}%"),
        )
    ).order_by(Trend.velocity_score.desc())
    result = await db.execute(query)
    return [trend_to_dict(t, full=False) for t in result.scalars().all()]


@app.get("/daily-brief")
async def get_daily_brief(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DailyBrief).order_by(DailyBrief.date.desc()).limit(1)
    )
    brief = result.scalar_one_or_none()
    if not brief:
        top = await db.execute(select(Trend).order_by(Trend.velocity_score.desc()).limit(5))
        trends = top.scalars().all()
        if not trends:
            raise HTTPException(
                status_code=404,
                detail="No daily brief available. Run the pipeline first.",
            )
        lines = ["# Intelligence Brief\n", "*Generated from latest trend data — run pipeline for full brief.*\n"]
        for t in trends:
            lines.append(f"## {t.title} (TVS: {t.velocity_score:.0f})\n{t.summary}\n")
        return {
            "content": "\n".join(lines),
            "date": datetime.now(timezone.utc).isoformat(),
            "trend_count": len(trends),
            "signal_count": 0,
            "generated": False,
        }
    return {
        "content": brief.content,
        "date": brief.date.isoformat() if brief.date else None,
        "trend_count": brief.trend_count,
        "signal_count": brief.signal_count,
        "generated": True,
    }


@app.patch("/notifications/read-all")
async def mark_all_notifications_read(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.read == False))  # noqa: E712
    for notif in result.scalars().all():
        notif.read = True
    await db.commit()
    return {"status": "ok"}


@app.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int, db: AsyncSession = Depends(get_db)):
    notif = await db.get(Notification, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    await db.commit()
    return {"status": "ok"}


@app.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    query = select(Notification).order_by(Notification.created_at.desc()).limit(limit)
    if unread_only:
        query = query.where(Notification.read == False)  # noqa: E712
    result = await db.execute(query)
    notifs = result.scalars().all()
    return [
        {
            "id": str(n.id),
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "trend_id": n.trend_id,
            "read": n.read,
            "timestamp": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifs
    ]


@app.get("/chat/suggestions")
async def chat_suggestions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trend).order_by(Trend.velocity_score.desc()).limit(6))
    trends = result.scalars().all()
    if not trends:
        return {"suggestions": [
            "What emerging trends should I watch?",
            "Run the pipeline and ask me again for live intelligence.",
        ]}
    suggestions = []
    domains_seen = set()
    for t in trends:
        if t.domain not in domains_seen:
            suggestions.append(f"What are the high-velocity signals in {t.domain}?")
            domains_seen.add(t.domain)
        if len(suggestions) < 3:
            suggestions.append(f"Analyze the investment thesis for {t.title}")
    return {"suggestions": suggestions[:6]}


@app.get("/deduplication-report")
async def get_deduplication_report(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trend).order_by(Trend.velocity_score.desc()))
    trends_data = [
        {"id": t.id, "title": t.title, "domain": t.domain, "velocity_score": t.velocity_score,
         "first_seen_at": t.first_seen_at}
        for t in result.scalars().all()
    ]
    return deduplicator.get_deduplication_report(trends_data)


@app.post("/query")
async def query_trends(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    question: str = body.get("question", "")

    async def event_stream():
        try:
            from app.chroma_service import chroma_service
            from langchain_groq import ChatGroq
            from langchain_core.messages import SystemMessage, HumanMessage

            results = chroma_service.query_similar(question, n_results=5)
            docs = results.get("documents", [[]])[0] if results else []
            context = "\n\n".join(docs) if docs else "No stored trend context available yet."

            result = await db.execute(select(Trend).order_by(Trend.velocity_score.desc()).limit(8))
            top_trends = result.scalars().all()

            if not top_trends:
                yield f"data: {json.dumps({'content': 'No trend data available yet. Please run the intelligence pipeline first, then ask again.'})}\n\n"
                yield "data: [DONE]\n\n"
                return

            db_context = "\n".join(
                f"- {t.title} (Domain: {t.domain}, TVS: {t.velocity_score}, "
                f"Delta: {t.tvs_delta or 0:+.1f}, Stage: {t.stage}): {t.summary}"
                for t in top_trends
            )

            llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)
            messages = [
                SystemMessage(content=(
                    "You are Shru, an AI analyst specializing in emerging technology and market trends. "
                    "Answer questions using ONLY the provided trend data. Be concise, insightful, and actionable. "
                    "Use markdown formatting. Cite specific trends and TVS scores when relevant.\n\n"
                    f"## Current Top Trends:\n{db_context}\n\n"
                    f"## Vector Context:\n{context}"
                )),
                HumanMessage(content=question),
            ]

            async for chunk in llm.astream(messages):
                if chunk.content:
                    yield f"data: {json.dumps({'content': chunk.content})}\n\n"

        except Exception as e:
            logger.warning(f"Query endpoint error: {e}")
            yield f"data: {json.dumps({'content': f'Unable to process query: {str(e)}. Ensure GROQ_API_KEY is set and pipeline has been run.'})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
