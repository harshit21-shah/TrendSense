import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .database import AsyncSessionLocal
from .graph import trend_graph
from .logger import logger
from .models import Trend, DailyBrief, PipelineRun, Notification, RawPost
from .text_utils import normalize_trend_title


_pipeline_running = False
_last_pipeline_result: Optional[Dict] = None


def is_pipeline_running() -> bool:
    return _pipeline_running


def get_last_pipeline_result() -> Optional[Dict]:
    return _last_pipeline_result


def _parse_sources(raw: Any) -> list:
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


def _append_velocity_history(existing: Optional[list], score: float) -> list:
    history = list(existing or [])
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if history and history[-1].get("date") == today:
        history[-1]["score"] = score
    else:
        history.append({"date": today, "score": score})
    return history[-90:]


async def _save_trends(session: AsyncSession, trends_data: List[Dict]) -> tuple[int, List[int]]:
    """Returns (saved_count, list of trend ids with significant delta)."""
    saved = 0
    updated_ids: List[int] = []

    for trend_data in trends_data:
        td = {k.lower(): v for k, v in trend_data.items()}
        title = normalize_trend_title(td.get("title", "Untitled"))
        domain_raw = td.get("domain", "Other").strip()
        domain = "AI" if domain_raw.lower() == "ai" else domain_raw.title()

        sources = td.get("sources", [])
        if isinstance(sources, str):
            try:
                sources = json.loads(sources)
            except Exception:
                sources = [s.strip() for s in sources.split(",") if s.strip()]

        # Use `or` fallback chain so that None values don't cause float(None) TypeError
        raw_score = td.get("s_tvs") or td.get("velocity_score") or 0.0
        velocity_score = min(100.0, max(0.0, float(raw_score)))
        # Normalize stage to title case — LLM sometimes returns "emerging" or "RISING"
        raw_stage = td.get("stage", "Emerging") or "Emerging"
        valid_stages = {"Emerging", "Rising", "Mainstream", "Fading"}
        stage = raw_stage.strip().title()
        if stage not in valid_stages:
            stage = "Emerging"

        stmt = select(Trend).where(Trend.title == title)
        existing = (await session.execute(stmt)).scalar_one_or_none()

        if existing:
            delta = velocity_score - existing.velocity_score
            existing.tvs_delta = delta
            existing.velocity_score = velocity_score
            existing.domain = domain
            existing.stage = stage
            existing.summary = td.get("summary", existing.summary)
            existing.investment_thesis = td.get("investment_thesis", existing.investment_thesis)
            existing.product_opportunity = td.get("product_opportunity", existing.product_opportunity)
            existing.risk_assessment = td.get("risk_assessment", existing.risk_assessment)
            existing.historical_accuracy = td.get("historical_accuracy", existing.historical_accuracy)
            existing.source_citations = sources
            existing.velocity_history = _append_velocity_history(existing.velocity_history, velocity_score)
            existing.last_updated_at = datetime.now(timezone.utc)
            if abs(delta) >= settings.NOTIFICATION_TVS_DELTA_THRESHOLD:
                updated_ids.append(existing.id)
        else:
            new_trend = Trend(
                title=title,
                domain=domain,
                velocity_score=velocity_score,
                tvs_delta=0.0,
                stage=stage,
                summary=td.get("summary", ""),
                investment_thesis=td.get("investment_thesis", ""),
                product_opportunity=td.get("product_opportunity", ""),
                risk_assessment=td.get("risk_assessment", ""),
                historical_accuracy=td.get("historical_accuracy", ""),
                source_citations=sources,
                velocity_history=[{"date": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "score": velocity_score}],
            )
            session.add(new_trend)
            await session.flush()
            updated_ids.append(new_trend.id)
        saved += 1
    return saved, updated_ids


async def _persist_raw_signals(session: AsyncSession, signals: List[Dict]) -> int:
    count = 0
    for s in signals[:200]:
        sid = s.get("source_id", "")
        if not sid:
            continue
        existing = await session.execute(select(RawPost).where(RawPost.source_id == sid))
        if existing.scalar_one_or_none():
            continue
        session.add(RawPost(
            source=s.get("source", "unknown"),
            source_id=sid,
            title=s.get("title", "")[:500],
            content=(s.get("content") or "")[:2000],
            score=int(s.get("score", 0) or 0),
            url=s.get("url", ""),
            subreddit=s.get("subreddit"),
        ))
        count += 1
    return count


async def _upsert_daily_brief(session: AsyncSession, content: str, trend_count: int, signal_count: int):
    today = datetime.now(timezone.utc).date()
    result = await session.execute(select(DailyBrief).order_by(DailyBrief.date.desc()).limit(1))
    latest = result.scalar_one_or_none()
    if latest and latest.date and latest.date.date() == today:
        latest.content = content
        latest.trend_count = trend_count
        latest.signal_count = signal_count
    else:
        session.add(DailyBrief(content=content, trend_count=trend_count, signal_count=signal_count))


async def _create_notifications(session: AsyncSession, updated_trend_ids: List[int], stats: Dict) -> int:
    if not updated_trend_ids:
        session.add(Notification(
            type="system",
            title="Pipeline Complete",
            message=f"Processed {stats.get('signals_fetched', 0)} signals across {len(stats.get('source_counts', {}))} sources.",
        ))
        return 1

    result = await session.execute(select(Trend).where(Trend.id.in_(updated_trend_ids)))
    created = 0
    for trend in result.scalars().all():
        delta = trend.tvs_delta or 0.0
        session.add(Notification(
            type="trend" if delta > 0 else "alert",
            title=f"{'Rising' if delta > 0 else 'Fading'}: {trend.title}",
            message=f"TVS {'+' if delta > 0 else ''}{delta:.1f} -> {trend.velocity_score:.0f} ({trend.domain})",
            trend_id=trend.id,
        ))
        created += 1
    return created


async def run_intelligence_pipeline(domains: Optional[List[str]] = None) -> Dict:
    """Run the full multi-agent pipeline and persist results."""
    global _pipeline_running, _last_pipeline_result

    if _pipeline_running:
        return {"status": "running", "message": "Pipeline already running."}

    if not settings.GROQ_API_KEY:
        return {"status": "error", "message": "GROQ_API_KEY is not set."}

    _pipeline_running = True
    active_domains = domains or settings.pipeline_domains_list

    async with AsyncSessionLocal() as session:
        run = PipelineRun(status="running")
        session.add(run)
        await session.commit()
        await session.refresh(run)
        run_id = run.id

    logger.info(f"Starting multi-agent pipeline (run #{run_id}) for domains: {active_domains}")

    try:
        initial_state = {
            "domains": active_domains,
            "raw_signals": [],
            "processed_signals": [],
            "domain_analyses": [],
            "scored_trends": [],
            "validated_trends": [],
            "daily_brief": None,
            "pipeline_stats": {},
            "errors": [],
        }

        final_state = await trend_graph.ainvoke(initial_state)
        validated = final_state.get("validated_trends", [])
        stats = final_state.get("pipeline_stats", {})
        errors = final_state.get("errors", [])

        async with AsyncSessionLocal() as session:
            await _persist_raw_signals(session, final_state.get("raw_signals", []))
            trends_saved, updated_ids = await _save_trends(session, validated)

            if final_state.get("daily_brief"):
                await _upsert_daily_brief(
                    session,
                    final_state["daily_brief"],
                    len(validated),
                    stats.get("signals_fetched", 0),
                )

            await _create_notifications(session, updated_ids, stats)
            await session.commit()

            run_result = await session.get(PipelineRun, run_id)
            if run_result:
                run_result.status = "completed"
                run_result.completed_at = datetime.now(timezone.utc)
                run_result.signals_fetched = stats.get("signals_fetched", 0)
                run_result.trends_saved = trends_saved
                run_result.errors = errors
                run_result.stats = stats
                await session.commit()

        result = {
            "status": "completed",
            "run_id": run_id,
            "trends_saved": trends_saved,
            "signals_fetched": stats.get("signals_fetched", 0),
            "errors": errors,
            "stats": stats,
        }
        _last_pipeline_result = result
        logger.info(f"Pipeline run #{run_id} complete: {trends_saved} trends saved")
        return result

    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        async with AsyncSessionLocal() as session:
            run_result = await session.get(PipelineRun, run_id)
            if run_result:
                run_result.status = "failed"
                run_result.completed_at = datetime.now(timezone.utc)
                run_result.errors = [str(e)]
                await session.commit()
        return {"status": "failed", "message": str(e), "run_id": run_id}
    finally:
        _pipeline_running = False


def trend_to_dict(t: Trend, full: bool = True) -> dict:
    base = {
        "id": t.id,
        "title": t.title,
        "domain": t.domain,
        "velocity_score": t.velocity_score,
        "tvs_delta": t.tvs_delta or 0.0,
        "stage": t.stage,
        "summary": t.summary,
        "source_citations": _parse_sources(t.source_citations),
        "first_seen_at": t.first_seen_at.isoformat() if t.first_seen_at else None,
        "velocity_history": t.velocity_history or [],
        "last_updated_at": t.last_updated_at.isoformat() if t.last_updated_at else None,
    }
    if full:
        base.update({
            "investment_thesis": t.investment_thesis,
            "product_opportunity": t.product_opportunity,
            "risk_assessment": t.risk_assessment,
            "historical_accuracy": t.historical_accuracy,
        })
    return base
