"""
RSS Feed Service — aggregates signals from multiple free, no-key-required sources:
  - TechCrunch, The Verge, Wired, Ars Technica (tech)
  - MIT Technology Review, Nature News (science/research)
  - VentureBeat, TechCrunch AI (AI-specific)
  - Hacker News (via RSS, as backup to Algolia)
  - Product Hunt (trending products)
  - GitHub Trending (via unofficial RSS)
"""

import httpx
import xml.etree.ElementTree as ET
from typing import List, Dict
from datetime import datetime, timezone, timedelta
from .logger import logger
from .text_utils import normalize_trend_title

# Feed definitions: (name, url, domain_hint)
RSS_FEEDS = [
    # Tech news
    ("TechCrunch",        "https://techcrunch.com/feed/",                          "AI"),
    ("TechCrunch AI",     "https://techcrunch.com/category/artificial-intelligence/feed/", "AI"),
    ("The Verge",         "https://www.theverge.com/rss/index.xml",                "AI"),
    ("Ars Technica",      "https://feeds.arstechnica.com/arstechnica/technology-lab", "AI"),
    ("Wired",             "https://www.wired.com/feed/rss",                        "AI"),
    # Science / Research
    ("MIT Tech Review",   "https://www.technologyreview.com/feed/",                "AI"),
    ("Nature News",       "https://www.nature.com/nature.rss",                     "Health"),
    # Business / Fintech
    ("VentureBeat",       "https://venturebeat.com/feed/",                         "Fintech"),
    ("TechCrunch Fintech","https://techcrunch.com/category/fintech/feed/",         "Fintech"),
    # Health / Biotech
    ("TechCrunch Health", "https://techcrunch.com/category/biotech-health/feed/",  "Health"),
    # Climate
    ("TechCrunch Climate","https://techcrunch.com/category/climate/feed/",         "Climate"),
    # Product Hunt (trending products — good signal for emerging trends)
    ("Product Hunt",      "https://www.producthunt.com/feed",                      "AI"),
]

# How old an article can be (hours) before we skip it
MAX_AGE_HOURS = 48


class RSSFeedService:
    async def fetch_feed(self, name: str, url: str, domain_hint: str) -> List[Dict]:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
        }
        cutoff = datetime.now(timezone.utc) - timedelta(hours=MAX_AGE_HOURS)
        articles = []

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                root = ET.fromstring(response.content)

                # Handle both RSS 2.0 and Atom feeds
                items = root.findall(".//item") or root.findall(
                    ".//{http://www.w3.org/2005/Atom}entry"
                )

                for item in items:
                    title = (
                        _text(item, "title")
                        or _text(item, "{http://www.w3.org/2005/Atom}title")
                        or ""
                    )
                    link = (
                        _text(item, "link")
                        or _attr(item, "{http://www.w3.org/2005/Atom}link", "href")
                        or ""
                    )
                    description = (
                        _text(item, "description")
                        or _text(item, "{http://www.w3.org/2005/Atom}summary")
                        or _text(item, "{http://www.w3.org/2005/Atom}content")
                        or ""
                    )
                    pub_date_str = (
                        _text(item, "pubDate")
                        or _text(item, "{http://www.w3.org/2005/Atom}published")
                        or _text(item, "{http://www.w3.org/2005/Atom}updated")
                        or ""
                    )

                    if not title or not link:
                        continue

                    # Age filter
                    if pub_date_str:
                        try:
                            pub_dt = _parse_date(pub_date_str)
                            if pub_dt and pub_dt < cutoff:
                                continue
                        except Exception:
                            pass  # include if we can't parse

                    articles.append({
                        "source": f"rss_{name.lower().replace(' ', '_')}",
                        "source_id": f"rss_{abs(hash(link))}",
                        "title": normalize_trend_title(title.strip()),
                        "content": _strip_html(description)[:600],
                        "score": 80,
                        "url": link.strip(),
                        "subreddit": name,
                        "domain_hint": domain_hint,
                        "created_at": pub_date_str,
                    })

            except ET.ParseError as e:
                logger.warning(f"RSS parse error for {name}: {e}")
            except Exception as e:
                logger.error(f"RSS fetch error for {name} ({url}): {e}")

        return articles

    async def fetch_all(self) -> List[Dict]:
        import asyncio
        tasks = [self.fetch_feed(name, url, hint) for name, url, hint in RSS_FEEDS]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_articles: List[Dict] = []
        seen_urls: set = set()

        for i, result in enumerate(results):
            name = RSS_FEEDS[i][0]
            if isinstance(result, Exception):
                logger.error(f"RSS gather error for {name}: {result}")
                continue
            for article in result:
                url = article.get("url", "")
                if url and url not in seen_urls:
                    all_articles.append(article)
                    seen_urls.add(url)

        logger.info(f"RSS feeds: fetched {len(all_articles)} unique articles from {len(RSS_FEEDS)} sources")
        return all_articles


# ── helpers ──────────────────────────────────────────────────────────────────

def _text(element, tag: str) -> str:
    child = element.find(tag)
    return (child.text or "").strip() if child is not None else ""


def _attr(element, tag: str, attr: str) -> str:
    child = element.find(tag)
    return (child.attrib.get(attr, "") or "").strip() if child is not None else ""


def _strip_html(text: str) -> str:
    """Very lightweight HTML tag stripper."""
    import re
    return re.sub(r"<[^>]+>", " ", text).strip()


def _parse_date(date_str: str):
    """Try common date formats used in RSS/Atom feeds."""
    from email.utils import parsedate_to_datetime
    try:
        return parsedate_to_datetime(date_str)  # RFC 2822 (RSS)
    except Exception:
        pass
    for fmt in (
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.strptime(date_str, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


rss_service = RSSFeedService()
