from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from typing import List, Dict, TypedDict
from .config import settings
from .logger import logger

class ScoredTrend(TypedDict):
    title: str
    domain: str
    s_tvs: float
    stage: str
    summary: str
    investment_thesis: str
    product_opportunity: str
    risk_assessment: str
    sources: List[str]

class SynthesisState(TypedDict):
    processed_signals: List[Dict]
    scored_trends: List[ScoredTrend]
    errors: List[str]

class SynthesisAgent:
    def __init__(self):
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant"
        )
        self.parser = JsonOutputParser()
        
        self.prompt = ChatPromptTemplate.from_template("""
You are a Senior Venture Capital Analyst and Product Strategist.
Analyze the following emerging signals from Reddit and HackerNews and synthesize them into high-value trend intelligence.

Signals:
{signals}

Return ONLY a valid JSON array (no markdown, no explanation) with 5-8 trend objects.
Each object MUST use exactly these lowercase keys:
{{
  "title": "concise trend title",
  "domain": "AI | Fintech | Biotech | Health | Crypto | Climate | Other",
  "s_tvs": <number 1-100>,
  "stage": "Emerging | Rising | Mainstream",
  "summary": "2-3 sentence technical overview",
  "investment_thesis": "why this matters for capital allocation",
  "product_opportunity": "what specific product could be built",
  "risk_assessment": "hype vs reality check",
  "sources": ["url1", "url2"]
}}
""")

    async def synthesize(self, state: SynthesisState) -> SynthesisState:
        """
        LangGraph node that synthesizes processed signals into high-value trends.
        """
        logger.info("Running Synthesis Agent...")
        
        try:
            # Format signals for LLM - limit to top 15 to reduce token usage
            formatted_signals = "\n".join([
                f"- [{s['source']}] {s['title']} (Sentiment: {s['sentiment_label']}, Score: {s['score']})"
                for s in state["processed_signals"][:15]
            ])
            
            chain = self.prompt | self.llm | self.parser
            response = await chain.ainvoke({"signals": formatted_signals})
            
            state["scored_trends"] = response
            
        except Exception as e:
            logger.error(f"Synthesis Agent error: {str(e)}")
            state["errors"] = state.get("errors", []) + [str(e)]
            
        return state

synthesis_agent = SynthesisAgent()
