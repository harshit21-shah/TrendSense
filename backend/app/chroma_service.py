import chromadb
from typing import List
from .config import settings
from .embeddings import encode


class ChromaService:
    def __init__(self):
        if settings.CHROMA_HOST:
            self.client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=int(settings.CHROMA_PORT),
            )
        else:
            self.client = chromadb.PersistentClient(path="./chroma_db")

        self.collection = self.client.get_or_create_collection(name="historical_trends")

    def upsert_trend(self, trend_id: str, title: str, domain: str, metadata: dict):
        embedding = encode(f"{title} - {domain}")
        self.collection.upsert(
            ids=[trend_id],
            embeddings=[embedding],
            metadatas=[{k: str(v) for k, v in metadata.items()}],  # chroma requires str values
            documents=[f"{title} ({domain})"],
        )

    def query_similar(self, text: str, n_results: int = 5) -> dict:
        embedding = encode(text)
        try:
            results = self.collection.query(
                query_embeddings=[embedding],
                n_results=n_results,
            )
        except Exception:
            results = {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        return results


chroma_service = ChromaService()
