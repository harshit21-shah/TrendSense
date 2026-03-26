import httpx
import xml.etree.ElementTree as ET
from typing import List, Dict
from .logger import logger
from .text_utils import normalize_trend_title

class RedditRSSService:
    """
    Fetches Reddit signals using public RSS feeds.
    No API keys or Devvit required.
    """
    
    async def fetch_subreddit_rss(self, subreddit: str, limit: int = 25) -> List[Dict]:
        url = f"https://www.reddit.com/r/{subreddit}/.rss"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        signals = []
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                # Parse XML RSS feed
                root = ET.fromstring(response.content)
                # RSS namespaces
                ns = {'atom': 'http://www.w3.org/2005/Atom'}
                
                for entry in root.findall('atom:entry', ns)[:limit]:
                    title = entry.find('atom:title', ns).text
                    link = entry.find('atom:link', ns).attrib['href']
                    content_elem = entry.find('atom:content', ns)
                    content = content_elem.text if content_elem is not None else ""
                    
                    signals.append({
                        "source": "reddit_rss",
                        "source_id": f"rss_{link.split('/')[-2]}",
                        "title": normalize_trend_title(title),
                        "content": content[:500], # RSS content is HTML, we'll keep it brief
                        "score": 100, # Default score for RSS items
                        "url": link,
                        "subreddit": subreddit,
                        "created_at": 0 # Not easily parsed from RSS but fine for signals
                    })
            except Exception as e:
                logger.error(f"RSS error for r/{subreddit}: {str(e)}")
        
        return signals

reddit_service = RedditRSSService()
