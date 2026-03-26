from typing import List, Dict, TypedDict
from .chroma_service import chroma_service
from .logger import logger
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from .config import settings

class ScoredTrend(TypedDict):
    title: str
    domain: str
    summary: str
    sources: List[str]

class RAGState(TypedDict):
    scored_trends: List[ScoredTrend]
    validated_trends: List[ScoredTrend]
    errors: List[str]

class RAGAgent:
    def __init__(self):
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant"
        )
        
        self.validator_prompt = ChatPromptTemplate.from_template("""
        You are an AI Fact-Checker and Research Assistant.
        Compare the current synthesized trend with the historical context retrieved from the vector database.
        
        Synthesized Trend: {trend}
        Historical Context: {context}
        
        Determine if this trend is truly "emerging" or if it has been "mainstream" for a long time.
        Verify if the summary is consistent with historical patterns.
        
        Return a refined version of the trend with an added "Historical Accuracy" score (1-10) and a "Self-Correction" note if any inaccuracies were found.
        """)

    async def self_correct(self, state: RAGState) -> RAGState:
        """
        LangGraph node that performs self-correction by querying historical context in ChromaDB.
        """
        logger.info("Running RAG Self-Correction Agent...")
        validated = []
        
        for trend in state.get("scored_trends", []):
            try:
                # Normalise keys
                trend = {k.lower(): v for k, v in trend.items()}

                # 1. Retrieve historical context
                query_text = f"{trend.get('title', '')} in {trend.get('domain', '')}"
                historical_results = chroma_service.query_similar(query_text, n_results=3)
                
                # Format historical context for the LLM
                context = "\n".join(historical_results.get("documents", [[]])[0])
                
                # 2. Self-Correct using LLM
                chain = self.validator_prompt | self.llm
                response = await chain.ainvoke({
                    "trend": f"Title: {trend['title']}, Summary: {trend['summary']}",
                    "context": context if context else "No historical context found."
                })
                
                # 3. Add validation metadata
                trend["historical_accuracy"] = response.content
                validated.append(trend)
                
                # 4. Upsert to ChromaDB for future context
                sources = trend.get("sources", [])
                chroma_service.upsert_trend(
                    trend_id=f"trend_{trend.get('title','').replace(' ', '_').lower()}",
                    title=trend.get('title', ''),
                    domain=trend.get('domain', ''),
                    metadata={"summary": trend.get('summary', ''), "sources": ",".join(sources) if isinstance(sources, list) else str(sources)}
                )
                
            except Exception as e:
                logger.error(f"RAG Agent error for trend {trend['title']}: {str(e)}")
                state["errors"] = state.get("errors", []) + [str(e)]
                validated.append(trend) # Still include trend if validation fails

        state["validated_trends"] = validated
        return state

rag_agent = RAGAgent()
