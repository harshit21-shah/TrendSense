import asyncio
import json
from typing import Dict, List

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from .state import AgentState
from ..config import settings
from ..logger import logger


class DomainAnalystAgent:
    """Per-domain analyst agent — each domain gets its own LLM analysis pass."""

    def __init__(self):
        self.llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)
        self.parser = JsonOutputParser()
        self.prompt = ChatPromptTemplate.from_template("""
You are a domain specialist analyst for {domain}.
Analyze these signals and identify 1-2 emerging trends specific to {domain}.

Signals:
{signals}

Return ONLY a valid JSON array. Example format:
[
  {{
    "domain": "{domain}",
    "title": "Agentic AI Frameworks",
    "s_tvs": 85,
    "stage": "Rising",
    "summary": "2-3 sentence overview grounded in the signals.",
    "investment_thesis": "capital allocation angle",
    "product_opportunity": "buildable product idea",
    "risk_assessment": "hype vs reality",
    "sources": ["https://example.com/1"],
    "key_signals": ["signal title 1"]
  }}
]

Stage must be one of: Emerging, Rising, Mainstream, Fading.
Return 1-2 trend objects in the array. No markdown, no explanation.
""")

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
            f"(Sentiment: {s.get('sentiment_label', 'neutral')})"
            for s in domain_signals
        )

        try:
            chain = self.prompt | self.llm | self.parser
            result = await chain.ainvoke({"domain": domain, "signals": formatted})
            trends = result if isinstance(result, list) else [result]
            return {"domain": domain, "trends": trends, "signal_count": len(domain_signals)}
        except Exception as e:
            logger.error(f"Domain analyst error for {domain}: {e}")
            return {"domain": domain, "trends": [], "signal_count": len(domain_signals), "error": str(e)}


domain_analyst = DomainAnalystAgent()


async def domain_analyst_agent(state: AgentState) -> AgentState:
    """Runs domain analyst agents in parallel — one per active domain."""
    logger.info(f"Domain analyst agents: analyzing {len(state['domains'])} domains")
    tasks = [
        domain_analyst.analyze_domain(domain, state["processed_signals"])
        for domain in state["domains"]
    ]
    analyses = await asyncio.gather(*tasks)
    total_trends = sum(len(a.get("trends", [])) for a in analyses)
    logger.info(f"Domain analyst agents: produced {total_trends} domain-level trends")
    return {"domain_analyses": list(analyses)}
