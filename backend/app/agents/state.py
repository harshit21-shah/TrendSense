import operator
from typing import Annotated, Dict, List, Optional, TypedDict


class AgentState(TypedDict):
    """Shared state for the multi-agent LangGraph pipeline."""
    domains: List[str]
    raw_signals: List[Dict]
    processed_signals: List[Dict]
    domain_analyses: List[Dict]
    scored_trends: List[Dict]
    validated_trends: List[Dict]
    daily_brief: Optional[str]
    pipeline_stats: Dict
    errors: Annotated[List[str], operator.add]
