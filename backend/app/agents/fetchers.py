import asyncio
from typing import Dict, List

from .state import AgentState
from ..reddit_service import reddit_service
from ..hn_service import hn_service
from ..news_service import news_service
from ..rss_service import rss_service
from ..github_service import github_service
from ..logger import logger


async def reddit_agent(state: AgentState) -> Dict:
    try:
        posts = await reddit_service.fetch_for_domains(state["domains"])
        logger.info(f"Reddit agent: {len(posts)} posts")
        return {"signals": posts, "agent": "reddit", "count": len(posts)}
    except Exception as e:
        logger.error(f"Reddit agent error: {e}")
        return {"signals": [], "agent": "reddit", "count": 0, "error": str(e)}


async def hn_agent(state: AgentState) -> Dict:
    try:
        stories = await hn_service.fetch_top_stories()
        logger.info(f"HN agent: {len(stories)} stories")
        return {"signals": stories, "agent": "hackernews", "count": len(stories)}
    except Exception as e:
        logger.error(f"HN agent error: {e}")
        return {"signals": [], "agent": "hackernews", "count": 0, "error": str(e)}


async def news_agent(state: AgentState) -> Dict:
    try:
        articles = await news_service.fetch_all_categories(state["domains"])
        logger.info(f"News agent: {len(articles)} articles")
        return {"signals": articles, "agent": "newsapi", "count": len(articles)}
    except Exception as e:
        logger.error(f"News agent error: {e}")
        return {"signals": [], "agent": "newsapi", "count": 0, "error": str(e)}


async def rss_agent(state: AgentState) -> Dict:
    try:
        articles = await rss_service.fetch_all(state["domains"])
        logger.info(f"RSS agent: {len(articles)} articles")
        return {"signals": articles, "agent": "rss", "count": len(articles)}
    except Exception as e:
        logger.error(f"RSS agent error: {e}")
        return {"signals": [], "agent": "rss", "count": 0, "error": str(e)}


async def github_agent(state: AgentState) -> Dict:
    try:
        repos = await github_service.fetch_trending()
        logger.info(f"GitHub agent: {len(repos)} repos")
        return {"signals": repos, "agent": "github", "count": len(repos)}
    except Exception as e:
        logger.error(f"GitHub agent error: {e}")
        return {"signals": [], "agent": "github", "count": 0, "error": str(e)}


async def fetch_coordinator_agent(state: AgentState) -> AgentState:
    """Fetch coordinator — 5 source agents in parallel, dedupe by URL/title."""
    logger.info("Fetch coordinator: dispatching 5 source agents...")

    results = await asyncio.gather(
        reddit_agent(state),
        hn_agent(state),
        news_agent(state),
        rss_agent(state),
        github_agent(state),
    )

    all_signals: List[Dict] = []
    agent_stats: Dict = {}
    errors: List[str] = []

    for result in results:
        all_signals.extend(result.get("signals", []))
        agent_stats[result.get("agent", "unknown")] = result.get("count", 0)
        if result.get("error"):
            errors.append(f"{result['agent']}: {result['error']}")

    unique_signals: List[Dict] = []
    seen: set = set()
    for signal in all_signals:
        key = signal.get("url") or signal.get("title", "")
        if key and key not in seen:
            unique_signals.append(signal)
            seen.add(key)

    stats = dict(state.get("pipeline_stats", {}))
    stats["source_counts"] = agent_stats
    stats["signals_fetched"] = len(unique_signals)

    logger.info(f"Fetch coordinator: {len(unique_signals)} unique from {sum(agent_stats.values())} raw")

    return {
        "raw_signals": unique_signals,
        "pipeline_stats": stats,
        "errors": errors,
    }
