import json
import re
import time
from typing import Dict, List

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from .state import AgentState
from ..chroma_service import chroma_service
from ..config import settings
from ..logger import logger

_JSON_LLM = None


def _get_llm() -> ChatGroq:
    global _JSON_LLM
    if _JSON_LLM is None:
        _JSON_LLM = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_MODEL,
            model_kwargs={"response_format": {"type": "json_object"}},
        )
    return _JSON_LLM


_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a fact-checker. Output ONLY raw JSON. No code. No explanation. No markdown."),
    ("human", """Validate this emerging trend against the historical context.

Trend: {trend}
Historical Context: {context}

Output a single JSON object with this exact structure:
{{
  "historical_accuracy_score": 7,
  "is_emerging": true,
  "correction_note": "brief note if inaccuracy found, else empty string",
  "refined_summary": "corrected 2-sentence summary if needed, else repeat the original summary"
}}

Rules:
- historical_accuracy_score must be an integer from 1 to 10
- is_emerging must be true or false
- refined_summary must be a plain text string, never empty
"""),
])


def _parse_validation(raw) -> dict:
    """Robustly extract validation dict from LLM response."""
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except Exception:
            pass
        m = re.search(r'\{.*\}', raw, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except Exception:
                pass
    return {}


class RAGValidationAgent:
    async def validate_trend(self, trend: Dict) -> Dict:
        trend = {k.lower(): v for k, v in trend.items()}
        query_text = f"{trend.get('title', '')} in {trend.get('domain', '')}"
        historical = chroma_service.query_similar(query_text, n_results=3)
        context = "\n".join(historical.get("documents", [[]])[0]) or "No historical context."

        try:
            llm = _get_llm()
            chain = _PROMPT | llm
            response = await chain.ainvoke({
                "trend": json.dumps(trend, default=str),
                "context": context,
            })
            raw = response.content if hasattr(response, "content") else response
            
            if isinstance(raw, str):
                try:
                    raw = json.loads(raw)
                except Exception:
                    pass

            validation = _parse_validation(raw)

            # Store only the human-readable refined summary — NOT the raw JSON
            refined = validation.get("refined_summary") or trend.get("summary", "")
            if refined:
                trend["summary"] = refined
            # historical_accuracy is now plain text, not a JSON dump
            correction = validation.get("correction_note", "").strip()
            score = validation.get("historical_accuracy_score", 0)
            trend["historical_accuracy"] = (
                f"Accuracy score: {score}/10. {correction}" if correction
                else f"Accuracy score: {score}/10." if score else ""
            )

            sources = trend.get("sources", [])
            chroma_service.upsert_trend(
                trend_id=f"trend_{trend.get('title', '').replace(' ', '_').lower()}",
                title=trend.get("title", ""),
                domain=trend.get("domain", ""),
                metadata={
                    "summary": trend.get("summary", ""),
                    "sources": ",".join(sources) if isinstance(sources, list) else str(sources),
                    "accuracy_score": str(score),
                },
            )
            return trend
        except Exception as e:
            logger.error(f"RAG validation error for {trend.get('title')}: {e}")
            trend["historical_accuracy"] = ""  # empty on error, not a JSON dump
            return trend


rag_validator = RAGValidationAgent()


async def rag_validation_agent(state: AgentState) -> AgentState:
    import asyncio
    logger.info("RAG validation agent: validating trends...")
    trends = state.get("scored_trends", [])
    if not trends:
        return {"validated_trends": []}
    validated = await asyncio.gather(*[rag_validator.validate_trend(t) for t in trends])
    logger.info(f"RAG validation agent: validated {len(validated)} trends")
    return {"validated_trends": list(validated)}
