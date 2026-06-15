import asyncio
import json
import re
from typing import Dict, List

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from .state import AgentState
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
    ("system", (
        "You are a domain specialist analyst. "
        "You output ONLY raw JSON. No code. No explanation. No markdown."
    )),
    ("human", """Analyze these signals from the {domain} domain and identify 1-2 emerging trends.

Signals:
{signals}

Output a single JSON object with this exact structure:
{{
  "trends": [
    {{
      "domain": "{domain}",
      "title": "Short descriptive trend title",
      "s_tvs": 85,
      "stage": "Rising",
      "summary": "2-3 sentence overview grounded in the signals.",
      "investment_thesis": "Capital allocation angle.",
      "product_opportunity": "Specific buildable product idea.",
      "risk_assessment": "Honest hype vs reality check.",
      "sources": ["https://actual-url-from-signals.com"],
      "key_signals": ["signal title 1", "signal title 2"]
    }}
  ]
}}

Rules:
- Return 1 or 2 trend objects inside "trends"
- s_tvs must be an integer between 1 and 100
- stage must be exactly one of: Emerging, Rising, Mainstream, Fading
- Use real URLs from the signals as sources, not made-up ones
"""),
])


def _extract_trends(raw) -> List[Dict]:
    """Robustly extract trend list from LLM response."""
    if isinstance(raw, dict):
        if "trends" in raw and isinstance(raw["trends"], list):
            return raw["trends"]
        if "title" in raw:
            return [raw]
        for v in raw.values():
            if isinstance(v, list) and v:
                return v
    if isinstance(raw, list):
        return raw
    if isinstance(raw, str):
        try:
            return _extract_trends(json.loads(raw))
        except Exception:
            pass
        m = re.search(r'\[.*?\]', raw, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except Exception:
                pass
    return []


class DomainAnalystAgent:
    def _signals_for_domain(self, domain: str, signals: List[Dict]) -> List[Dict]:
        domain_lower = domain.lower()
        matched = [
            s for s in signals
            if (s.get("domain_hint") or "").lower() == domain_lower
            or domain_lower in (s.get("subreddit") or "").lower()
            or domain_lower in (s.get("title") or "").lower()
        ]
        return matched[:15] if matched else signals[:10]

    async def analyze_domain(self, domain: str, signals: List[Dict]) -> Dict:
        domain_signals = self._signals_for_domain(domain, signals)
        if not domain_signals:
            return {"domain": domain, "trends": [], "signal_count": 0}

        formatted = "\n".join(
            f"- [{s.get('source', 'unknown')}] {s.get('title', '')} "
            f"(score: {s.get('score', 0)}, sentiment: {s.get('sentiment_label', 'neutral')}, url: {s.get('url', '')})"
            for s in domain_signals
        )

        try:
            llm = _get_llm()
            chain = _PROMPT | llm
            response = await chain.ainvoke({"domain": domain, "signals": formatted})
            raw = response.content if hasattr(response, "content") else response
            if isinstance(raw, str):
                try:
                    raw = json.loads(raw)
                except Exception:
                    pass
            trends = _extract_trends(raw)
            return {"domain": domain, "trends": trends, "signal_count": len(domain_signals)}
        except Exception as e:
            logger.error(f"Domain analyst error for {domain}: {e}")
            return {"domain": domain, "trends": [], "signal_count": len(domain_signals), "error": str(e)}


domain_analyst = DomainAnalystAgent()


async def domain_analyst_agent(state: AgentState) -> AgentState:
    logger.info(f"Domain analyst agents: analyzing {len(state['domains'])} domains")
    tasks = [
        domain_analyst.analyze_domain(domain, state["processed_signals"])
        for domain in state["domains"]
    ]
    analyses = await asyncio.gather(*tasks)
    total_trends = sum(len(a.get("trends", [])) for a in analyses)
    logger.info(f"Domain analyst agents: produced {total_trends} domain-level trends")
    return {"domain_analyses": list(analyses)}
