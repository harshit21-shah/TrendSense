import httpx
from typing import List, Dict
from datetime import datetime, timezone, timedelta
from .config import settings
from .domains import NEWS_CATEGORY_MAP, infer_domain_hint
from .logger import logger
from .text_utils import normalize_trend_title

TIMEOUT = 20.0


class NewsAPIService:
    BASE_URL = "https://newsapi.org/v2/top-headlines"

    def _categories_for_domains(self, domains: List[str]) -> List[str]:
        return list(dict.fromkeys(NEWS_CATEGORY_MAP.get(d, "technology") for d in domains))

    async def fetch_category(self, category: str, page_size: int = 40) -> List[Dict]:
        if not settings.NEWS_API_KEY:
            return []

        params = {
            "category": category,
            "pageSize": page_size,
            "language": "en",
            "apiKey": settings.NEWS_API_KEY,
        }
        cutoff = datetime.now(timezone.utc) - timedelta(hours=48)
        articles: List[Dict] = []

        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                for article in response.json().get("articles", []):
                    published = article.get("publishedAt", "")
                    try:
                        pub_dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
                        if pub_dt < cutoff:
                            continue
                    except (ValueError, AttributeError):
                        pass
                    title = article.get("title", "") or ""
                    desc = article.get("description", "") or ""
                    articles.append({
                        "source": "newsapi",
                        "source_id": f"news_{abs(hash(article.get('url', '')))}",
                        "title": normalize_trend_title(title),
                        "content": desc[:600],
                        "score": 90,
                        "url": article.get("url", ""),
                        "subreddit": category,
                        "domain_hint": infer_domain_hint(title, desc),
                        "created_at": published,
                    })
            except Exception as e:
                logger.error(f"NewsAPI error ({category}): {e}")
        return articles

    async def fetch_all_categories(self, domains: List[str] | None = None) -> List[Dict]:
        if not settings.NEWS_API_KEY:
            logger.warning("NEWS_API_KEY not set — skipping NewsAPI")
            return []
        active = domains or []
        categories = self._categories_for_domains(active) if active else ["technology", "science", "business", "health"]
        all_articles: List[Dict] = []
        seen: set = set()
        for cat in categories:
            for article in await self.fetch_category(cat):
                url = article.get("url", "")
                if url and url not in seen:
                    all_articles.append(article)
                    seen.add(url)
        return all_articles


news_service = NewsAPIService()
