from sentence_transformers import SentenceTransformer
from typing import List

# Load model globally to avoid repeated loading
model = SentenceTransformer('all-MiniLM-L6-v2')

def encode(text: str) -> List[float]:
    """Encodes text into a vector."""
    embeddings = model.encode(text)
    return embeddings.tolist()
