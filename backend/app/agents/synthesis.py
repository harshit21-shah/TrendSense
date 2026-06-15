import json
from typing import Dict, List

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from .state import AgentState
from ..config import settings
from ..logger import logger


class SynthesisCoordinatorAgent:
    """Synthesis coordinator — merges domain analyst outputs into final ranked trends."""

    def __init__(self):
        self.llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)
        self.parser = JsonOutputParser()
        self.prompt = ChatPromptTemplate.from_template("""
You are the Chief Intelligence Officer at TrendSense.
Merge and refine these domain-level trend analyses into a unified, deduplicated intelligence report.

Domain Analyses:
{analyses}

Return ONLY a valid JSON array with 5-8 trend objects. Example:
[
  {{
    "title": "Agentic AI Frameworks",
    "domain": "AI",
    "s_tvs": 91,
    "stage": "Rising",
    "summary": "2-3 sentence technical overview",
    "investment_thesis": "why this matters for capital allocation",
    "product_opportunity": "what specific product could be built",
    "risk_assessment": "hype vs reality check",
    "sources": ["https://example.com/1"]
  }}
]

Rules:
- Output MUST be a JSON array, not a single object
- Deduplicate overlapping trends across domains
- s_tvs MUST be between 1 and 100
- stage: Emerging, Rising, Mainstream, or Fading
- Prioritize trends with strongest cross-source evidence
""")


synthesis_coordinator = SynthesisCoordinatorAgent()


async def synthesis_coordinator_agent(state: AgentState) -> AgentState:
    """Synthesis coordinator agent — final trend ranking from domain analyses."""
    logger.info("Synthesis coordinator: merging domain analyses...")

    analyses_text = json.dumps(state.get("domain_analyses", []), indent=2, default=str)

    try:
        chain = synthesis_coordinator.prompt | synthesis_coordinator.llm | synthesis_coordinator.parser
        response = await chain.ainvoke({"analyses": analyses_text})
        trends = response if isinstance(response, list) else []
        logger.info(f"Synthesis coordinator: produced {len(trends)} final trends")
        return {"scored_trends": trends}
    except Exception as e:
        logger.error(f"Synthesis coordinator error: {e}")
        return {"scored_trends": [], "errors": [f"Synthesis: {e}"]}
