import chromadb
from chromadb.utils import embedding_functions
from typing import List
from .config import settings


class ChromaService:
    def __init__(self):
        # Use ChromaDB's built-in lightweight embedding function
        self.ef = embedding_functions.DefaultEmbeddingFunction()

        if settings.CHROMA_HOST:
            self.client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=int(settings.CHROMA_PORT),
            )
        else:
            self.client = chromadb.PersistentClient(path="./chroma_db")

        self.collection = self.client.get_or_create_collection(
            name="historical_trends",
            embedding_function=self.ef
        )

    def upsert_trend(self, trend_id: str, title: str, domain: str, metadata: dict):
        self.collection.upsert(
            ids=[trend_id],
            metadatas=[{k: str(v) for k, v in metadata.items()}],
            documents=[f"{title} ({domain})"],
        )

    def query_similar(self, text: str, n_results: int = 5) -> dict:
        try:
            results = self.collection.query(
                query_texts=[text],
                n_results=n_results,
            )
        except Exception:
            results = {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        return results


chroma_service = ChromaService()
