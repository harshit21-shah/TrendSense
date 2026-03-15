from typing import List, Dict, TypedDict
from .sentiment_service import sentiment_service
from .logger import logger

class RawPost(TypedDict):
    source: str
    source_id: str
    title: str
    content: str
    score: int
    url: str
    subreddit: str
    created_at: float

class TrendSenseState(TypedDict):
    raw_signals: List[RawPost]
    processed_signals: List[Dict]
    errors: List[str]

def sentiment_agent_node(state: TrendSenseState) -> TrendSenseState:
    """
    LangGraph node that processes raw signals and adds sentiment/emotion metrics.
    """
    logger.info("Running Sentiment Agent...")
    processed = []
    
    for signal in state.get("raw_signals", []):
        try:
            # Analyze title and content
            text_to_analyze = f"{signal['title']} {signal['content']}"
            sentiment = sentiment_service.analyze(text_to_analyze)
            
            # Enrich signal with sentiment data
            enriched_signal = {
                **signal,
                "sentiment_metrics": sentiment,
                "sentiment_label": sentiment_service.get_sentiment_label(sentiment['compound'])
            }
            processed.append(enriched_signal)
            
        except Exception as e:
            logger.error(f"Sentiment Agent error for signal {signal['source_id']}: {str(e)}")
            state["errors"] = state.get("errors", []) + [str(e)]

    state["processed_signals"] = processed
    return state
