"""
Reddit RSS / API service with rate limiting.

Reddit aggressively throttles unauthenticated RSS (effectively 1 req/60s per IP).
Two modes are supported:
  1. Unauthenticated RSS  — no keys required, slow (semaphored, 1 req at a time + delay)
  2. OAuth2 client-credentials — set REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET in .env
     Gives 100 req/min authenticated access to the Reddit JSON API.
"""
import asyncio
import base64
import time
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional

import httpx

from .domains import SUBREDDIT_MAP, DEFAULT_SUBREDDIT, infer_domain_hint
from .logger import logger
from .text_utils import normalize_trend_title

# ── Global concurrency guard for unauthenticated requests ───────────────────
# Reddit returns 429 if more than ~1 concurrent RSS request comes from same IP.
_REDDIT_SEMAPHORE = asyncio.Semaphore(1)
_REDDIT_REQ_DELAY = 3.0          # seconds between unauthenticated requests
_REDDIT_RETRY_DELAYS = [5, 15, 30]  # exponential-ish backoff on 429

TIMEOUT = 20.0
RSS_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

# Reduced to 2 high-signal subreddits per domain to stay within rate limits
SUBREDDIT_MAP_SLIM: Dict[str, List[str]] = {
    "AI": ["MachineLearning", "artificial"],
    "Fintech": ["fintech", "investing"],
    "Health": ["medicine", "health"],
    "Biotech": ["biotech", "genetics"],
    "Climate": ["climate", "RenewableEnergy"],
    "Crypto": ["CryptoCurrency", "Bitcoin"],
}


class RedditRSSService:
    def __init__(self) -> None:
        self._oauth_token: Optional[str] = None
        self._oauth_expires: float = 0.0
        self._client_id: Optional[str] = None
        self._client_secret: Optional[str] = None
        self._load_credentials()

    def _load_credentials(self) -> None:
        try:
            from .config import settings
            cid = getattr(settings, "REDDIT_CLIENT_ID", None)
            csec = getattr(settings, "REDDIT_CLIENT_SECRET", None)
            if cid and csec and cid != "your_reddit_client_id":
                self._client_id = cid
                self._client_secret = csec
                logger.info("Reddit: OAuth2 credentials configured.")
            else:
                logger.info("Reddit: no OAuth2 credentials — using unauthenticated RSS (rate-limited).")
        except Exception:
            pass

    @property
    def _use_oauth(self) -> bool:
        return bool(self._client_id and self._client_secret)

    # ── OAuth2 token management ──────────────────────────────────────────────

    async def _ensure_oauth_token(self) -> Optional[str]:
        if not self._use_oauth:
            return None
        if self._oauth_token and time.time() < self._oauth_expires - 60:
            return self._oauth_token
        creds = base64.b64encode(
            f"{self._client_id}:{self._client_secret}".encode()
        ).decode()
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(
                "https://www.reddit.com/api/v1/access_token",
                headers={
                    "Authorization": f"Basic {creds}",
                    "User-Agent": "TrendSense/2.0 (Signal Intelligence)",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                content="grant_type=client_credentials",
            )
            if r.status_code == 200:
                data = r.json()
                self._oauth_token = data["access_token"]
                self._oauth_expires = time.time() + data.get("expires_in", 3600)
                logger.info("Reddit: OAuth2 token refreshed.")
                return self._oauth_token
            else:
                logger.error(f"Reddit OAuth2 token error: {r.status_code} {r.text[:200]}")
                return None

    # ── Authenticated JSON fetch (OAuth2) ───────────────────────────────────

    async def _fetch_oauth(
        self, subreddit: str, domain_hint: Optional[str], limit: int
    ) -> List[Dict]:
        token = await self._ensure_oauth_token()
        if not token:
            return []
        url = f"https://oauth.reddit.com/r/{subreddit}/hot.json"
        headers = {
            "Authorization": f"Bearer {token}",
            "User-Agent": "TrendSense/2.0 (Signal Intelligence)",
        }
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                r = await client.get(url, headers=headers, params={"limit": limit})
                r.raise_for_status()
                data = r.json()
                posts = data.get("data", {}).get("children", [])
                signals = []
                for post in posts:
                    p = post.get("data", {})
                    title = normalize_trend_title(p.get("title", ""))
                    link = f"https://reddit.com{p.get('permalink', '')}"
                    content = (p.get("selftext") or "")[:500]
                    hint = domain_hint or infer_domain_hint(title, content, subreddit)
                    source_id = p.get("id", link)
                    signals.append({
                        "source": "reddit",
                        "source_id": f"reddit_{source_id}",
                        "title": title,
                        "content": content,
                        "score": p.get("score", 0),
                        "url": link,
                        "subreddit": subreddit,
                        "domain_hint": hint,
                        "created_at": int(p.get("created_utc", 0)),
                    })
                return signals
            except Exception as e:
                logger.error(f"Reddit OAuth fetch r/{subreddit}: {e}")
                return []

    # ── Unauthenticated RSS fetch (rate-limited) ─────────────────────────────

    async def _fetch_rss(
        self, subreddit: str, domain_hint: Optional[str], limit: int
    ) -> List[Dict]:
        url = f"https://www.reddit.com/r/{subreddit}/.rss"
        headers = {
            "User-Agent": RSS_USER_AGENT,
            "Accept": "application/rss+xml, application/xml, */*",
        }
        # Hold the semaphore for the entire request to ensure sequential access
        async with _REDDIT_SEMAPHORE:
            for attempt, wait in enumerate([0] + _REDDIT_RETRY_DELAYS):
                if wait:
                    logger.warning(f"Reddit 429 r/{subreddit} — waiting {wait}s (attempt {attempt+1})")
                    await asyncio.sleep(wait)
                try:
                    async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
                        response = await client.get(url, headers=headers)
                    if response.status_code == 429:
                        if attempt < len(_REDDIT_RETRY_DELAYS):
                            continue  # retry
                        logger.error(f"Reddit RSS r/{subreddit}: exhausted retries (429)")
                        return []
                    response.raise_for_status()
                    root = ET.fromstring(response.content)
                    ns = {"atom": "http://www.w3.org/2005/Atom"}
                    signals = []
                    for entry in root.findall("atom:entry", ns)[:limit]:
                        title_el = entry.find("atom:title", ns)
                        link_el = entry.find("atom:link", ns)
                        if title_el is None or link_el is None:
                            continue
                        title = normalize_trend_title(title_el.text or "")
                        link = link_el.attrib.get("href", "")
                        content_el = entry.find("atom:content", ns)
                        content = (content_el.text or "")[:500] if content_el is not None else ""
                        hint = domain_hint or infer_domain_hint(title, content, subreddit)
                        source_id = link.split("/")[-3] if "/" in link else link
                        signals.append({
                            "source": "reddit",
                            "source_id": f"reddit_{source_id}",
                            "title": title,
                            "content": content,
                            "score": 100,
                            "url": link,
                            "subreddit": subreddit,
                            "domain_hint": hint,
                            "created_at": 0,
                        })
                    # Polite gap before releasing semaphore
                    await asyncio.sleep(_REDDIT_REQ_DELAY)
                    return signals
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429:
                        if attempt < len(_REDDIT_RETRY_DELAYS):
                            continue
                    logger.error(f"Reddit RSS error r/{subreddit}: {e}")
                    return []
                except Exception as e:
                    logger.error(f"Reddit RSS error r/{subreddit}: {e}")
                    return []
        return []

    # ── Public interface ─────────────────────────────────────────────────────

    async def fetch_subreddit_rss(
        self, subreddit: str, domain_hint: Optional[str] = None, limit: int = 25
    ) -> List[Dict]:
        if self._use_oauth:
            return await self._fetch_oauth(subreddit, domain_hint, limit)
        return await self._fetch_rss(subreddit, domain_hint, limit)

    async def fetch_for_domains(self, domains: List[str]) -> List[Dict]:
        """Fetch subreddits for each domain, rate-limited (sequential via semaphore)."""
        tasks = []
        for domain in domains:
            # Use the slim map (2 subs per domain) to stay within rate limits
            subs = SUBREDDIT_MAP_SLIM.get(domain, SUBREDDIT_MAP.get(domain, [DEFAULT_SUBREDDIT]))[:2]
            for sub in subs:
                tasks.append(self.fetch_subreddit_rss(sub, domain_hint=domain))

        if self._use_oauth:
            # OAuth: safe to run concurrently (100 req/min)
            results = await asyncio.gather(*tasks, return_exceptions=True)
        else:
            # Unauthenticated: run sequentially via the semaphore inside each call
            # gather is fine here — the semaphore enforces serialisation
            results = await asyncio.gather(*tasks, return_exceptions=True)

        all_posts: List[Dict] = []
        for r in results:
            if isinstance(r, list):
                all_posts.extend(r)
            elif isinstance(r, Exception):
                logger.error(f"Reddit fetch_for_domains exception: {r}")
        logger.info(
            f"Reddit: {len(all_posts)} posts from {len(tasks)} subreddits "
            f"({'OAuth2' if self._use_oauth else 'RSS/unauthenticated'})"
        )
        return all_posts


reddit_service = RedditRSSService()
