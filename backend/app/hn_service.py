import httpx
from typing import List, Dict
from .domains import infer_domain_hint
from .logger import logger
from .text_utils import normalize_trend_title

TIMEOUT = 20.0


class HackerNewsService:
    BASE_URL = "https://hn.algolia.com/api/v1/search"

    async def fetch_top_stories(self, limit: int = 80) -> List[Dict]:
        params = {"tags": "story", "hitsPerPage": limit}
        stories: List[Dict] = []

        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                for hit in response.json().get("hits", []):
                    points = hit.get("points", 0) or 0
                    comments = hit.get("num_comments", 0) or 0
                    if points < 20 and comments < 5:
                        continue
                    title = hit.get("title", "")
                    content = hit.get("story_text", "") or ""
                    stories.append({
                        "source": "hackernews",
                        "source_id": f"hn_{hit['objectID']}",
                        "title": normalize_trend_title(title),
                        "content": content[:600],
                        "score": points,
                        "url": hit.get("url") or f"https://news.ycombinator.com/item?id={hit['objectID']}",
                        "subreddit": "hackernews",
                        "domain_hint": infer_domain_hint(title, content),
                        "created_at": hit.get("created_at_i", 0),
                    })
            except Exception as e:
                logger.error(f"HN fetch error: {e}")
        return stories


hn_service = HackerNewsService()
