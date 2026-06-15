from typing import Dict, List

from .state import AgentState
from ..sentiment_service import sentiment_service
from ..logger import logger


async def sentiment_agent(state: AgentState) -> AgentState:
    """Sentiment analysis agent — enriches each signal with VADER + TextBlob metrics."""
    logger.info("Sentiment agent: analyzing signals...")
    processed: List[Dict] = []

    for signal in state.get("raw_signals", []):
        try:
            text = f"{signal.get('title', '')} {signal.get('content', '')}"
            sentiment = sentiment_service.analyze(text)
            processed.append({
                **signal,
                "sentiment_metrics": sentiment,
                "sentiment_label": sentiment_service.get_sentiment_label(sentiment["compound"]),
            })
        except Exception as e:
            logger.error(f"Sentiment agent error for {signal.get('source_id')}: {e}")
            processed.append(signal)

    logger.info(f"Sentiment agent: processed {len(processed)} signals")
    return {"processed_signals": processed}
