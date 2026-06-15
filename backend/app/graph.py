from langgraph.graph import StateGraph, END

from .agents.state import AgentState
from .agents import (
    supervisor_node,
    fetch_coordinator_agent,
    sentiment_agent,
    domain_analyst_agent,
    synthesis_coordinator_agent,
    rag_validation_agent,
    brief_agent_node,
)
from .logger import logger


def create_trend_graph():
    """
    Multi-agent LangGraph pipeline:

    Supervisor → Fetch Coordinator (Reddit | HN | News | RSS agents in parallel)
      → Sentiment Agent → Domain Analyst Agents (parallel per domain)
      → Synthesis Coordinator → RAG Validation Agent → Brief Agent → END
    """
    workflow = StateGraph(AgentState)

    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("fetch_coordinator", fetch_coordinator_agent)
    workflow.add_node("sentiment", sentiment_agent)
    workflow.add_node("domain_analyst", domain_analyst_agent)
    workflow.add_node("synthesis", synthesis_coordinator_agent)
    workflow.add_node("rag_validation", rag_validation_agent)
    workflow.add_node("brief", brief_agent_node)

    workflow.set_entry_point("supervisor")
    workflow.add_edge("supervisor", "fetch_coordinator")
    workflow.add_edge("fetch_coordinator", "sentiment")
    workflow.add_edge("sentiment", "domain_analyst")
    workflow.add_edge("domain_analyst", "synthesis")
    workflow.add_edge("synthesis", "rag_validation")
    workflow.add_edge("rag_validation", "brief")
    workflow.add_edge("brief", END)

    logger.info("Multi-agent trend graph compiled: 7 agents, 8 nodes")
    return workflow.compile()


trend_graph = create_trend_graph()
