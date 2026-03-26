from typing import TypedDict, List, Dict, Annotated
import asyncio
from langgraph.graph import StateGraph, END
from .reddit_service import reddit_service
from .hn_service import hn_service
from .news_service import news_service
from .sentiment_agent import sentiment_agent_node
from .synthesis_agent import synthesis_agent
from .rag_agent import rag_agent
from .logger import logger

class AgentState(TypedDict):
    domains: List[str]
    raw_signals: List[Dict]
    processed_signals: List[Dict]
    scored_trends: List[Dict]
    validated_trends: List[Dict]
    errors: List[str]

async def fetch_signals_node(state: AgentState) -> AgentState:
    """Node to fetch raw signals from Reddit and HackerNews."""
    logger.info(f"Fetching signals for domains: {state['domains']}")
    
    # Map domains to subreddits (simplified)
    subreddit_map = {
        "AI": ["MachineLearning", "artificial", "LocalLLaMA", "singularity"],
        "Fintech": ["fintech", "CryptoCurrency", "investing"],
        "Health": ["Futurology", "science"]
    }
    
    selected_subs = []
    for domain in state["domains"]:
        selected_subs.extend(subreddit_map.get(domain, ["technology"]))

    # Fetch all sources in parallel
    reddit_tasks = [reddit_service.fetch_subreddit_rss(sub) for sub in selected_subs]
    reddit_results, hn_stories, news_articles = await asyncio.gather(
        asyncio.gather(*reddit_tasks),
        hn_service.fetch_top_stories(),
        news_service.fetch_all_categories(),
    )
    reddit_posts = [item for sublist in reddit_results for item in sublist]

    # Deduplicate all signals by URL
    all_signals = reddit_posts + hn_stories + news_articles
    unique_signals = []
    seen_urls = set()
    
    for s in all_signals:
        url = s.get("url")
        if url and url not in seen_urls:
            unique_signals.append(s)
            seen_urls.add(url)
        elif not url:
            # If no URL, use title as fallback for deduplication
            title = s.get("title")
            if title and title not in seen_urls:
                unique_signals.append(s)
                seen_urls.add(title)

    state["raw_signals"] = unique_signals
    logger.info(f"Fetched {len(reddit_posts)} Reddit, {len(hn_stories)} HN, {len(news_articles)} News signals. Unique: {len(unique_signals)}")
    return state

def create_trend_graph():
    """Creates the LangGraph state machine for TrendSense."""
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("fetcher", fetch_signals_node)
    workflow.add_node("sentiment", sentiment_agent_node)
    workflow.add_node("synthesis", synthesis_agent.synthesize)
    workflow.add_node("rag_validation", rag_agent.self_correct)

    # Define edges
    workflow.set_entry_point("fetcher")
    workflow.add_edge("fetcher", "sentiment")
    workflow.add_edge("sentiment", "synthesis")
    workflow.add_edge("synthesis", "rag_validation")
    workflow.add_edge("rag_validation", END)

    return workflow.compile()

trend_graph = create_trend_graph()
