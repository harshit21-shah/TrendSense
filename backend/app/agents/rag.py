import json
from typing import Dict, List

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from .state import AgentState
from ..chroma_service import chroma_service
from ..config import settings
from ..logger import logger


class RAGValidationAgent:
    """RAG validation agent — fact-checks each trend against historical ChromaDB context."""

    def __init__(self):
        self.llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)
        self.parser = JsonOutputParser()
        self.prompt = ChatPromptTemplate.from_template("""
You are an AI Fact-Checker validating emerging trend intelligence.

Trend: {trend}
Historical Context: {context}

Return ONLY valid JSON:
{{
  "historical_accuracy_score": <integer 1-10>,
  "is_emerging": <boolean>,
  "correction_note": "brief note if any inaccuracy found, else empty string",
  "refined_summary": "corrected summary if needed, else repeat original"
}}
""")

    async def validate_trend(self, trend: Dict) -> Dict:
        trend = {k.lower(): v for k, v in trend.items()}
        query_text = f"{trend.get('title', '')} in {trend.get('domain', '')}"
        historical = chroma_service.query_similar(query_text, n_results=3)
        context = "\n".join(historical.get("documents", [[]])[0]) or "No historical context."

        try:
            chain = self.prompt | self.llm | self.parser
            validation = await chain.ainvoke({
                "trend": json.dumps(trend, default=str),
                "context": context,
            })

            if validation.get("refined_summary"):
                trend["summary"] = validation["refined_summary"]
            trend["historical_accuracy"] = json.dumps(validation)

            sources = trend.get("sources", [])
            chroma_service.upsert_trend(
                trend_id=f"trend_{trend.get('title', '').replace(' ', '_').lower()}",
                title=trend.get("title", ""),
                domain=trend.get("domain", ""),
                metadata={
                    "summary": trend.get("summary", ""),
                    "sources": ",".join(sources) if isinstance(sources, list) else str(sources),
                    "accuracy_score": str(validation.get("historical_accuracy_score", 0)),
                },
            )
            return trend
        except Exception as e:
            logger.error(f"RAG validation error for {trend.get('title')}: {e}")
            trend["historical_accuracy"] = json.dumps({"error": str(e)})
            return trend


rag_validator = RAGValidationAgent()


async def rag_validation_agent(state: AgentState) -> AgentState:
    """RAG validation agent — validates each scored trend in parallel."""
    import asyncio

    logger.info("RAG validation agent: validating trends...")
    trends = state.get("scored_trends", [])
    if not trends:
        return {"validated_trends": []}

    validated = await asyncio.gather(*[rag_validator.validate_trend(t) for t in trends])
    logger.info(f"RAG validation agent: validated {len(validated)} trends")
    return {"validated_trends": list(validated)}
