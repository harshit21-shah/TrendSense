"""
Source registry — single source of truth for domains, feeds, and agent metadata.
Domains are driven by PIPELINE_DOMAINS env via get_active_domains().
"""

from typing import Dict, List, Tuple, Optional

# Subreddit → domain hint (reverse lookup built at import)
SUBREDDIT_MAP: Dict[str, List[str]] = {
    "AI": ["MachineLearning", "artificial", "LocalLLaMA", "singularity", "OpenAI"],
    "Fintech": ["fintech", "investing", "stocks", "wallstreetbets"],
    "Health": ["medicine", "health", "science", "Futurology"],
    "Biotech": ["biotech", "bioinformatics", "genetics", "labrats"],
    "Climate": ["climate", "energy", "sustainability", "RenewableEnergy"],
    "Crypto": ["CryptoCurrency", "defi", "ethereum", "Bitcoin"],
}

DEFAULT_SUBREDDIT = "technology"

NEWS_CATEGORY_MAP: Dict[str, str] = {
    "AI": "technology",
    "Fintech": "business",
    "Health": "health",
    "Biotech": "science",
    "Climate": "science",
    "Crypto": "business",
}

# (name, url, domain_hint)
RSS_FEEDS: List[Tuple[str, str, str]] = [
    # AI & Tech
    ("TechCrunch", "https://techcrunch.com/feed/", "AI"),
    ("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/", "AI"),
    ("The Verge", "https://www.theverge.com/rss/index.xml", "AI"),
    ("Ars Technica", "https://feeds.arstechnica.com/arstechnica/technology-lab", "AI"),
    ("Wired", "https://www.wired.com/feed/rss", "AI"),
    ("MIT Tech Review", "https://www.technologyreview.com/feed/", "AI"),
    ("VentureBeat AI", "https://venturebeat.com/category/ai/feed/", "AI"),
    ("Product Hunt", "https://www.producthunt.com/feed", "AI"),
    ("Hacker News RSS", "https://hnrss.org/frontpage", "AI"),
    ("Dev.to", "https://dev.to/feed", "AI"),
    # Fintech
    ("VentureBeat", "https://venturebeat.com/feed/", "Fintech"),
    ("TechCrunch Fintech", "https://techcrunch.com/category/fintech/feed/", "Fintech"),
    ("CoinDesk", "https://www.coindesk.com/arc/outboundfeeds/rss/", "Crypto"),
    ("The Block", "https://www.theblock.co/rss.xml", "Crypto"),
    # Health & Biotech
    ("Nature News", "https://www.nature.com/nature.rss", "Health"),
    ("TechCrunch Health", "https://techcrunch.com/category/biotech-health/feed/", "Biotech"),
    ("STAT News", "https://www.statnews.com/feed/", "Biotech"),
    # Climate
    ("TechCrunch Climate", "https://techcrunch.com/category/climate/feed/", "Climate"),
    ("CleanTechnica", "https://cleantechnica.com/feed/", "Climate"),
    ("Carbon Brief", "https://www.carbonbrief.org/feed", "Climate"),
    # Crypto / Web3
    ("Decrypt", "https://decrypt.co/feed", "Crypto"),
    ("Cointelegraph", "https://cointelegraph.com/rss", "Crypto"),
]

# Keyword → domain for untagged signals (HN, NewsAPI)
DOMAIN_KEYWORDS: Dict[str, List[str]] = {
    "AI": ["ai", "llm", "gpt", "machine learning", "neural", "agent", "openai", "anthropic", "gpu"],
    "Fintech": ["fintech", "banking", "payment", "lending", "insurtech", "trading", "venture"],
    "Health": ["health", "medical", "hospital", "patient", "diagnostic", "fda", "clinical"],
    "Biotech": ["biotech", "genomics", "crispr", "pharma", "drug", "protein", "synthetic biology"],
    "Climate": ["climate", "carbon", "renewable", "solar", "ev ", "emissions", "sustainability"],
    "Crypto": ["crypto", "bitcoin", "ethereum", "blockchain", "defi", "web3", "token"],
}

DOMAIN_STAGES: List[str] = ["Emerging", "Rising", "Mainstream", "Fading"]

# Build subreddit → domain reverse map
_SUBREDDIT_DOMAIN: Dict[str, str] = {}
for domain, subs in SUBREDDIT_MAP.items():
    for sub in subs:
        _SUBREDDIT_DOMAIN[sub.lower()] = domain


def get_active_domains() -> List[str]:
    from .config import settings
    return settings.pipeline_domains_list


def infer_domain_hint(title: str, content: str = "", subreddit: str = "") -> Optional[str]:
    """Infer domain from subreddit name or keyword matching."""
    if subreddit:
        d = _SUBREDDIT_DOMAIN.get(subreddit.lower().replace("r/", ""))
        if d:
            return d
    text = f"{title} {content}".lower()
    scores: Dict[str, int] = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        scores[domain] = sum(1 for kw in keywords if kw in text)
    if scores:
        best = max(scores, key=scores.get)
        if scores[best] > 0:
            return best
    return None


def get_source_catalog() -> List[dict]:
    """Return source metadata for /sources API."""
    from .config import settings
    domains = get_active_domains()
    reddit_count = sum(len(SUBREDDIT_MAP.get(d, [DEFAULT_SUBREDDIT])) for d in domains)
    rss_for_domains = [f for f in RSS_FEEDS if f[2] in domains] or RSS_FEEDS
    return [
        {"id": "reddit", "name": "Reddit RSS", "type": "social", "requires_key": False, "feed_count": reddit_count},
        {"id": "hackernews", "name": "Hacker News", "type": "social", "requires_key": False, "feed_count": 1},
        {"id": "newsapi", "name": "NewsAPI", "type": "news", "requires_key": True, "configured": bool(settings.NEWS_API_KEY), "feed_count": len(set(NEWS_CATEGORY_MAP.get(d, "technology") for d in domains))},
        {"id": "rss", "name": "RSS Feeds", "type": "news", "requires_key": False, "feed_count": len(rss_for_domains)},
        {"id": "github", "name": "GitHub Trending", "type": "developer", "requires_key": False, "feed_count": 1},
    ]
