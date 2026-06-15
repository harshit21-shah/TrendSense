import json
import re
from typing import Dict, List

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from .state import AgentState
from ..config import settings
from ..logger import logger

# JSON mode forces the LLM to output raw JSON — no code, no prose, no markdown
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
    ("system", (
        "You are a trend intelligence analyst. "
        "You output ONLY raw JSON. No code. No explanation. No markdown. "
        "Just the JSON object I ask for, nothing else."
    )),
    ("human", """Merge these domain trend analyses into a unified intelligence report.

Domain Analyses:
{analyses}

Output a single JSON object with this exact structure:
{{
  "trends": [
    {{
      "title": "Short descriptive trend title",
      "domain": "AI",
      "s_tvs": 85,
      "stage": "Rising",
      "summary": "2-3 sentence technical overview of why this trend is gaining momentum.",
      "investment_thesis": "Why this matters for capital allocation.",
      "product_opportunity": "What specific product could be built on this trend.",
      "risk_assessment": "Honest hype vs reality assessment.",
      "sources": ["https://example.com/article-1"]
    }}
  ]
}}

Rules:
- Return 5 to 8 trends total
- Deduplicate overlapping trends across domains
- s_tvs must be an integer between 1 and 100
- stage must be exactly one of: Emerging, Rising, Mainstream, Fading
- Prioritize trends with strongest cross-source evidence
- sources must be real URLs from the analyses, not made-up ones
"""),
])


def _extract_trends_from_response(raw) -> List[Dict]:
    """Parse LLM response robustly — handles dict, list, or raw string."""
    # Already a dict with "trends" key
    if isinstance(raw, dict):
        if "trends" in raw and isinstance(raw["trends"], list):
            return raw["trends"]
        # Sometimes model returns the trend directly as a dict
        if "title" in raw:
            return [raw]
        # Return all values that are lists (fallback)
        for v in raw.values():
            if isinstance(v, list) and v:
                return v

    # Already a list of trends
    if isinstance(raw, list):
        return raw

    # String — try to extract JSON
    if isinstance(raw, str):
        # Try full parse first
        try:
            parsed = json.loads(raw)
            return _extract_trends_from_response(parsed)
        except Exception:
            pass
        # Try to find a JSON array in the string
        match = re.search(r'\[.*?\]', raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
        # Try to find a JSON object
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            try:
                return _extract_trends_from_response(json.loads(match.group()))
            except Exception:
                pass

    return []


async def synthesis_coordinator_agent(state: AgentState) -> AgentState:
    """Synthesis coordinator agent — final trend ranking from domain analyses."""
    logger.info("Synthesis coordinator: merging domain analyses...")

    analyses_text = json.dumps(state.get("domain_analyses", []), indent=2, default=str)

    try:
        llm = _get_llm()
        chain = _PROMPT | llm
        response = await chain.ainvoke({"analyses": analyses_text})

        # response.content is a string when JSON mode is on
        raw = response.content if hasattr(response, "content") else response
        if isinstance(raw, str):
            try:
                raw = json.loads(raw)
            except Exception:
                pass

        trends = _extract_trends_from_response(raw)
        logger.info(f"Synthesis coordinator: produced {len(trends)} final trends")
        return {"scored_trends": trends}

    except Exception as e:
        logger.error(f"Synthesis coordinator error: {e}")
        return {"scored_trends": [], "errors": [f"Synthesis: {e}"]}
