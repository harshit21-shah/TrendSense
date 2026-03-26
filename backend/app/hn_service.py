import httpx
from typing import List, Dict
from .logger import logger
from .text_utils import normalize_trend_title

class HackerNewsService:
    BASE_URL = "https://hn.algolia.com/api/v1/search"

    async def fetch_top_stories(self, limit: int = 100) -> List[Dict]:
        """
        Fetches top stories from HackerNews via Algolia API.
        Filters for stories with high points and comments.
        """
        params = {
            "tags": "front_page",
            "hitsPerPage": limit
        }
        
        all_stories = []
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                for hit in data.get("hits", []):
                    # Filter for higher signal
                    if hit.get("points", 0) > 50 or hit.get("num_comments", 0) > 10:
                        all_stories.append({
                            "source": "hn",
                            "source_id": f"hn_{hit['objectID']}",
                            "title": normalize_trend_title(hit.get("title", "")),
                            "content": hit.get("story_text", "") or hit.get("comment_text", ""),
                            "score": hit.get("points", 0),
                            "url": hit.get("url", f"https://news.ycombinator.com/item?id={hit['objectID']}"),
                            "subreddit": "HN",
                            "created_at": hit.get("created_at_i", 0)
                        })
            except Exception as e:
                logger.error(f"Error fetching from HN: {str(e)}")
        
        return all_stories

hn_service = HackerNewsService()
