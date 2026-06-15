from .state import AgentState
from ..domains import get_active_domains
from ..logger import logger


async def supervisor_node(state: AgentState) -> AgentState:
    """Supervisor agent — loads config-driven domains and initializes pipeline state."""
    domains = state.get("domains") or get_active_domains()
    logger.info(f"Supervisor: orchestrating {len(domains)} domains — {domains}")

    return {
        "domains": domains,
        "raw_signals": [],
        "processed_signals": [],
        "domain_analyses": [],
        "scored_trends": [],
        "validated_trends": [],
        "daily_brief": None,
        "pipeline_stats": {"domains_active": len(domains)},
        "errors": [],
    }
