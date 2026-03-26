import httpx
from typing import List, Dict
from datetime import datetime, timezone, timedelta
from .config import settings
from .logger import logger


class NewsAPIService:
    BASE_URL = "https://newsapi.org/v2/top-headlines"
    CATEGORIES = ["technology", "science", "business", "health"]

    async def fetch_top_headlines(self, category: str = "technology", page_size: int = 50) -> List[Dict]:
        """Fetches top headlines from NewsAPI, filtered to last 24h."""
        if not settings.NEWS_API_KEY:
            logger.warning("NEWS_API_KEY not set, skipping NewsAPI fetch.")
            return []

        params = {
            "category": category,
            "pageSize": page_size,
            "language": "en",
            "apiKey": settings.NEWS_API_KEY,
        }

        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        articles = []

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()

                for article in data.get("articles", []):
                    published_at = article.get("publishedAt", "")
                    try:
                        pub_dt = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
                        if pub_dt < cutoff:
                            continue
                    except (ValueError, AttributeError):
                        pass  # include if we can't parse the date

                    articles.append({
                        "source": "newsapi",
                        "source_id": f"news_{abs(hash(article.get('url', '')))}",
                        "title": article.get("title", ""),
                        "content": article.get("description", "") or article.get("content", ""),
                        "score": 100,  # NewsAPI doesn't have engagement scores
                        "url": article.get("url", ""),
                        "subreddit": category,  # reuse field for category
                        "created_at": published_at,
                    })

            except Exception as e:
                logger.error(f"NewsAPI error for category '{category}': {str(e)}")

        return articles

    async def fetch_all_categories(self) -> List[Dict]:
        """Fetches headlines across all configured categories and deduplicates by URL."""
        all_articles: List[Dict] = []
        seen_urls = set()
        
        for category in self.CATEGORIES:
            articles = await self.fetch_top_headlines(category)
            for article in articles:
                url = article.get("url")
                if url and url not in seen_urls:
                    all_articles.append(article)
                    seen_urls.add(url)
            
            logger.info(f"NewsAPI: fetched {len(articles)} articles for '{category}'. Total unique: {len(all_articles)}")
        
        return all_articles


news_service = NewsAPIService()
