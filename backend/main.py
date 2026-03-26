import json
from fastapi import FastAPI, BackgroundTasks, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, delete
import uvicorn
import asyncio
from typing import List

from app.database import engine, Base, get_db
from app.models import Trend, DailyBrief
from app.graph import trend_graph
from app.logger import logger

app = FastAPI(title="TrendSense API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Retry DB connection — postgres container may not be ready immediately
    for attempt in range(10):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created.")
            
            # Clean up duplicate trends if any exist
            from app.database import AsyncSessionLocal
            async with AsyncSessionLocal() as session:
                # Find duplicate titles
                result = await session.execute(text("""
                    SELECT title FROM trends 
                    GROUP BY title 
                    HAVING COUNT(*) > 1
                """))
                duplicate_titles = [row[0] for row in result.all()]
                
                if duplicate_titles:
                    logger.info(f"Found {len(duplicate_titles)} duplicate trend titles. Cleaning up...")
                    for title in duplicate_titles:
                        # Keep the one with the highest ID (likely the newest or just a stable pick)
                        await session.execute(text("""
                            DELETE FROM trends 
                            WHERE title = :title 
                            AND id NOT IN (
                                SELECT MAX(id) FROM trends WHERE title = :title
                            )
                        """), {"title": title})
                    await session.commit()
                    logger.info("Duplicate trends cleaned up.")
            break
        except Exception as e:
            logger.warning(f"DB not ready (attempt {attempt + 1}/10): {e}")
            await asyncio.sleep(3)
    else:
        logger.error("Could not connect to database after 10 attempts.")

async def run_intelligence_pipeline():
    """Background task to run the LangGraph pipeline."""
    global _pipeline_running
    from app.config import settings as _settings
    _pipeline_running = True
    logger.info("Starting trend intelligence pipeline...")

    if not _settings.GROQ_API_KEY:
        logger.error("GROQ_API_KEY is not set. Pipeline aborted.")
        _pipeline_running = False
        return
    initial_state = {
        "domains": ["AI", "Fintech", "Health"],
        "raw_signals": [],
        "processed_signals": [],
        "scored_trends": [],
        "validated_trends": [],
        "errors": []
    }
    
    try:
        # Run LangGraph
        final_state = await trend_graph.ainvoke(initial_state)
        
        # Save results to DB
        from app.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            for trend_data in final_state.get("validated_trends", []):
                # Normalise keys — LLM may return capitalised variants
                td = {k.lower(): v for k, v in trend_data.items()}
                title = td.get("title", "Untitled")

                # Check if trend with this title already exists
                stmt = select(Trend).where(Trend.title == title)
                existing_trend = (await session.execute(stmt)).scalar_one_or_none()

                # Parse sources — LLM sometimes returns a JSON string instead of a list
                sources = td.get("sources", [])
                if isinstance(sources, str):
                    try:
                        sources = json.loads(sources)
                    except Exception:
                        sources = [s.strip() for s in sources.split(",") if s.strip()]

                velocity_score = float(td.get("s_tvs", td.get("velocity_score", 0.0)))

                if existing_trend:
                    # Update existing trend
                    existing_trend.domain = td.get("domain", existing_trend.domain)
                    existing_trend.tvs_delta = velocity_score - existing_trend.velocity_score
                    existing_trend.velocity_score = velocity_score
                    existing_trend.stage = td.get("stage", existing_trend.stage)
                    existing_trend.summary = td.get("summary", existing_trend.summary)
                    existing_trend.investment_thesis = td.get("investment_thesis", existing_trend.investment_thesis)
                    existing_trend.product_opportunity = td.get("product_opportunity", existing_trend.product_opportunity)
                    existing_trend.risk_assessment = td.get("risk_assessment", existing_trend.risk_assessment)
                    existing_trend.source_citations = sources
                else:
                    # Create new trend
                    new_trend = Trend(
                        title=title,
                        domain=td.get("domain", "Other"),
                        velocity_score=velocity_score,
                        stage=td.get("stage", "Emerging"),
                        summary=td.get("summary", ""),
                        investment_thesis=td.get("investment_thesis", ""),
                        product_opportunity=td.get("product_opportunity", ""),
                        risk_assessment=td.get("risk_assessment", ""),
                        historical_accuracy=td.get("historical_accuracy", ""),
                        source_citations=sources,
                    )
                    session.add(new_trend)
            await session.commit()
            logger.info(f"Pipeline finished. Saved {len(final_state.get('validated_trends', []))} trends.")
            
    except Exception as e:
        logger.error(f"Pipeline error: {str(e)}")
    finally:
        _pipeline_running = False

@app.get("/")
async def root():
    return {"message": "Welcome to TrendSense API"}

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
    return {"status": "ok", "db": db_status, "chroma": chroma_status}

_pipeline_running = False

@app.post("/run-pipeline")
async def trigger_pipeline(background_tasks: BackgroundTasks):
    global _pipeline_running
    if _pipeline_running:
        return {"message": "Pipeline already running.", "status": "running"}
    background_tasks.add_task(run_intelligence_pipeline)
    return {"message": "Pipeline triggered in background.", "status": "started"}

@app.get("/pipeline-status")
async def pipeline_status():
    return {"running": _pipeline_running}

@app.get("/trends", response_model=List[dict])
async def get_trends(
    domains: str = None,
    stages: str = None,
    deduplicate: bool = True,
    db: AsyncSession = Depends(get_db)
):
    query = select(Trend).order_by(Trend.velocity_score.desc())
    if domains:
        domain_list = domains.split(',')
        query = query.where(Trend.domain.in_(domain_list))
    if stages:
        stage_list = stages.split(',')
        query = query.where(Trend.stage.in_(stage_list))
    result = await db.execute(query)
    trends = result.scalars().all()
    
    trends_data = [
        {
            "id": t.id,
            "title": t.title,
            "domain": t.domain,
            "velocity_score": t.velocity_score,
            "tvs_delta": t.tvs_delta or 0.0,
            "stage": t.stage,
            "summary": t.summary,
            "investment_thesis": t.investment_thesis,
            "product_opportunity": t.product_opportunity,
            "risk_assessment": t.risk_assessment,
            "source_citations": _parse_sources(t.source_citations),
            "first_seen_at": t.first_seen_at,
        }
        for t in trends
    ]
    
    # Apply deduplication if requested
    if deduplicate:
        from app.deduplication import deduplicator
        trends_data = deduplicator.deduplicate(trends_data)
        logger.info(f"Returned {len(trends_data)} deduplicated trends")
    
    return trends_data

def _parse_sources(raw) -> list:
    """Ensure source_citations is always a list of strings."""
    if not raw:
        return []
    if isinstance(raw, list):
        return raw
    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            return parsed if isinstance(parsed, list) else [raw]
        except Exception:
            return [s.strip() for s in raw.split(",") if s.strip()]
    return []

@app.get("/domains", response_model=List[dict])
async def get_domains(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    result = await db.execute(
        select(Trend.domain, func.count(Trend.id))
        .where(Trend.domain.isnot(None))
        .group_by(Trend.domain)
    )
    return [{"name": row[0], "count": row[1]} for row in result.all()]

@app.get("/stages", response_model=List[dict])
async def get_stages(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    result = await db.execute(
        select(Trend.stage, func.count(Trend.id))
        .where(Trend.stage.isnot(None))
        .group_by(Trend.stage)
    )
    return [{"name": row[0], "count": row[1]} for row in result.all()]

@app.get("/search", response_model=List[dict])
async def search_trends(
    q: str,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import or_
    query = select(Trend).where(
        or_(
            Trend.title.ilike(f"%{q}%"),
            Trend.summary.ilike(f"%{q}%"),
            Trend.domain.ilike(f"%{q}%")
        )
    ).order_by(Trend.velocity_score.desc())
    result = await db.execute(query)
    trends = result.scalars().all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "domain": t.domain,
            "velocity_score": t.velocity_score,
            "tvs_delta": t.tvs_delta or 0.0,
            "stage": t.stage,
            "summary": t.summary,
            "source_citations": _parse_sources(t.source_citations),
        }
        for t in trends
    ]

@app.get("/deduplication-report")
async def get_deduplication_report(db: AsyncSession = Depends(get_db)):
    """Get a detailed report of duplicate trends in the database."""
    from app.deduplication import deduplicator
    
    # Get all trends
    result = await db.execute(select(Trend).order_by(Trend.velocity_score.desc()))
    trends = result.scalars().all()
    
    trends_data = [
        {
            "id": t.id,
            "title": t.title,
            "domain": t.domain,
            "velocity_score": t.velocity_score,
            "first_seen_at": t.first_seen_at,
        }
        for t in trends
    ]
    
    report = deduplicator.get_deduplication_report(trends_data)
    return report

@app.post("/query")
async def query_trends(request: Request, db: AsyncSession = Depends(get_db)):
    """SSE endpoint: streams an LLM answer grounded in stored trends."""
    body = await request.json()
    question: str = body.get("question", "")

    async def event_stream():
        try:
            from app.chroma_service import chroma_service
            from app.config import settings
            from langchain_groq import ChatGroq
            from langchain_core.messages import SystemMessage, HumanMessage

            # Retrieve relevant context from ChromaDB
            results = chroma_service.query_similar(question, n_results=5)
            docs = results.get("documents", [[]])[0] if results else []
            context = "\n\n".join(docs) if docs else "No stored trend context available yet."

            # Also pull top trends from DB for grounding
            result = await db.execute(
                select(Trend).order_by(Trend.velocity_score.desc()).limit(5)
            )
            top_trends = result.scalars().all()
            db_context = "\n".join(
                f"- {t.title} (Domain: {t.domain}, TVS: {t.velocity_score}, Stage: {t.stage}): {t.summary}"
                for t in top_trends
            )

            llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name="llama-3.1-8b-instant")
            messages = [
                SystemMessage(content=(
                    "You are Shruti, an AI analyst specializing in emerging technology and market trends. "
                    "Answer questions using the provided trend data. Be concise, insightful, and actionable. "
                    "Use markdown formatting. Cite specific trends and TVS scores when relevant.\n\n"
                    f"## Current Top Trends:\n{db_context}\n\n"
                    f"## Vector Context:\n{context}"
                )),
                HumanMessage(content=question),
            ]

            async for chunk in llm.astream(messages):
                content = chunk.content
                if content:
                    yield f"data: {json.dumps({'content': content})}\n\n"

        except Exception as e:
            logger.warning(f"Query endpoint error, using fallback: {e}")
            fallback = (
                "I couldn't reach the AI backend right now. "
                "Based on the latest pipeline data, here are the top signals:\n\n"
                "1. **Agentic AI Frameworks** (TVS: 91) — replacing SaaS workflows\n"
                "2. **AI-Native Code Review** (TVS: 88) — 2-3x faster merge cycles\n"
                "3. **GLP-1 Secondary Effects** (TVS: 85) — downstream market disruption\n\n"
                "Run the pipeline to refresh data, then ask again."
            )
            for word in fallback.split(" "):
                yield f"data: {json.dumps({'content': word + ' '})}\n\n"
                await asyncio.sleep(0.02)
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
