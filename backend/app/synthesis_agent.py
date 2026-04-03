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
Analyze the following emerging signals from Reddit, HackerNews, and tech news publications and synthesize them into high-value trend intelligence.

Signals:
{signals}

Return ONLY a valid JSON array (no markdown, no explanation) with 5-8 trend objects.
Each object MUST use exactly these lowercase keys:
{{
  "title": "concise trend title (Title Case, 3-7 words)",
  "domain": "AI | Fintech | Biotech | Health | Crypto | Climate | Other",
  "s_tvs": <integer 1-100>,
  "stage": "Emerging | Rising | Mainstream",
  "summary": "2-3 sentence technical overview",
  "investment_thesis": "why this matters for capital allocation",
  "product_opportunity": "what specific product could be built",
  "risk_assessment": "hype vs reality check",
  "sources": ["url1", "url2"]
}}

Rules:
- s_tvs MUST be between 1 and 100, never exceed 100
- title MUST be in Title Case (e.g. "Agentic AI Frameworks", not "agentic ai frameworks")
- domain MUST be exactly one of the listed values, properly capitalized
""")

    async def synthesize(self, state: SynthesisState) -> SynthesisState:
        """
        LangGraph node that synthesizes processed signals into high-value trends.
        """
        logger.info("Running Synthesis Agent...")
        
        try:
            # Format signals for LLM - limit to top 25 to cover more sources
            formatted_signals = "\n".join([
                f"- [{s['source']}] {s['title']} (Sentiment: {s['sentiment_label']}, Score: {s['score']})"
                + (f" [domain_hint: {s.get('domain_hint', '')}]" if s.get('domain_hint') else "")
                for s in state["processed_signals"][:25]
            ])
            
            chain = self.prompt | self.llm | self.parser
            response = await chain.ainvoke({"signals": formatted_signals})
            
            state["scored_trends"] = response
            
        except Exception as e:
            logger.error(f"Synthesis Agent error: {str(e)}")
            state["errors"] = state.get("errors", []) + [str(e)]
            
        return state

synthesis_agent = SynthesisAgent()
