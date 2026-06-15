from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .config import settings
from .logger import logger
from .pipeline_service import run_intelligence_pipeline, is_pipeline_running

scheduler = AsyncIOScheduler()


async def _scheduled_pipeline():
    if is_pipeline_running():
        logger.info("Scheduled pipeline skipped — already running")
        return
    logger.info("Scheduled pipeline triggered")
    await run_intelligence_pipeline()


def start_scheduler():
    if scheduler.running:
        return
    interval = settings.PIPELINE_SCHEDULE_MINUTES
    scheduler.add_job(
        _scheduled_pipeline,
        "interval",
        minutes=interval,
        id="trend_pipeline",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(f"Pipeline scheduler started: every {interval} minutes")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Pipeline scheduler stopped")
