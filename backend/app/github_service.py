"""
GitHub Trending — fetches daily trending repositories via unofficial RSS/scrape.
"""

import httpx
import re
from typing import List, Dict
from .domains import infer_domain_hint
from .logger import logger
from .text_utils import normalize_trend_title

TIMEOUT = 20.0
TRENDING_URL = "https://github.com/trending?since=daily"


class GitHubTrendingService:
    async def fetch_trending(self) -> List[Dict]:
        """Parse GitHub trending page for repo names and descriptions."""
        headers = {
            "User-Agent": "TrendSense/2.0",
            "Accept": "text/html",
        }
        signals: List[Dict] = []

        async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
            try:
                response = await client.get(TRENDING_URL, headers=headers)
                response.raise_for_status()
                html = response.text

                # Extract repo blocks: href="/owner/repo" and description spans
                repo_pattern = re.compile(
                    r'href="/([^/]+/[^/"]+)"[^>]*>\s*<span[^>]*>([^<]+)</span>',
                    re.DOTALL,
                )
                desc_pattern = re.compile(
                    r'class="col-9 color-fg-muted my-1 pr-4"[^>]*>([^<]+)',
                )

                repos = repo_pattern.findall(html)
                descs = desc_pattern.findall(html)

                for i, (repo_path, repo_name) in enumerate(repos[:25]):
                    desc = descs[i].strip() if i < len(descs) else ""
                    title = normalize_trend_title(f"{repo_name.strip()} — GitHub Trending")
                    url = f"https://github.com/{repo_path}"
                    signals.append({
                        "source": "github",
                        "source_id": f"github_{repo_path.replace('/', '_')}",
                        "title": title,
                        "content": desc[:400],
                        "score": 85,
                        "url": url,
                        "subreddit": "github",
                        "domain_hint": infer_domain_hint(title, desc) or "AI",
                        "created_at": 0,
                    })
            except Exception as e:
                logger.error(f"GitHub trending fetch error: {e}")
        return signals


github_service = GitHubTrendingService()
