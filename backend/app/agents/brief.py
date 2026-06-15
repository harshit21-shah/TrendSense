import json
from datetime import datetime, timezone

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from .state import AgentState
from ..config import settings
from ..logger import logger


class BriefAgent:
    def __init__(self):
        self.llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are the Chief Intelligence Officer at TrendSense. "
                "Write a professional intelligence brief in clean markdown. "
                "Output ONLY the markdown report — no preamble, no 'Here is the brief', "
                "no explanation. Start directly with '## Executive Summary'."
            )),
            ("human", """Generate today's TrendSense Daily Brief from these validated trends.

Date: {date}
Trends:
{trends}

Structure the report with these exact sections:
## Executive Summary
2-3 paragraphs on today's macro intelligence picture.

## Key Trends
For each top trend (up to 6): bold title, TVS score, 1-sentence insight.

## Market Insights
3 bullet points with quantitative observations from the trend data.

## Recommended Actions
3 actionable recommendations for founders and investors.

Use real data from the trends. Be specific with TVS scores and domain names.
"""),
        ])


brief_agent = BriefAgent()


async def brief_agent_node(state: AgentState) -> AgentState:
    trends = state.get("validated_trends", [])
    if not trends:
        logger.warning("Brief agent: no trends to brief on")
        return {"daily_brief": None}

    logger.info("Brief agent: generating daily intelligence brief...")
    trends_text = json.dumps(trends, indent=2, default=str)
    date_str = datetime.now(timezone.utc).strftime("%A, %B %d, %Y")

    try:
        chain = brief_agent.prompt | brief_agent.llm
        response = await chain.ainvoke({"date": date_str, "trends": trends_text})
        content = response.content if hasattr(response, "content") else str(response)

        # Strip any preamble before the first markdown heading
        if content and not content.lstrip().startswith("#"):
            match = content.find("## ")
            if match != -1:
                content = content[match:]

        logger.info(f"Brief agent: generated {len(content)} char brief")
        return {"daily_brief": content}
    except Exception as e:
        logger.error(f"Brief agent error: {e}")
        return {"daily_brief": None, "errors": [f"Brief agent: {e}"]}
