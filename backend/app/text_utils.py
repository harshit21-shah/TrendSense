"""Text normalization utilities for TrendSense."""

import re


def to_title_case(text: str) -> str:
    """
    Convert text to proper Title Case with smart handling of:
    - Acronyms (AI, LLM, API, etc.)
    - Common tech terms
    - Proper capitalization rules
    """
    if not text:
        return text
    
    # Common acronyms and tech terms that should stay uppercase
    acronyms = {
        'ai', 'ml', 'llm', 'api', 'sdk', 'ui', 'ux', 'ceo', 'cto', 'cfo',
        'saas', 'paas', 'iaas', 'aws', 'gcp', 'usa', 'uk', 'eu', 'ipo',
        'vc', 'pe', 'roi', 'kpi', 'b2b', 'b2c', 'seo', 'sms', 'iot',
        'ar', 'vr', 'xr', 'nft', 'dao', 'defi', 'web3', 'gpt', 'nlp',
        'cv', 'ocr', 'rpa', 'etl', 'crm', 'erp', 'hr', 'it', 'r&d',
        'gdpr', 'hipaa', 'soc', 'iso', 'pci', 'dss', 'sql', 'nosql',
        'rest', 'graphql', 'grpc', 'http', 'https', 'tcp', 'ip', 'dns',
        'cdn', 'ddos', 'vpn', 'ssl', 'tls', 'oauth', 'jwt', 'mfa', '2fa',
        'ci', 'cd', 'devops', 'mlops', 'aiops',
        'esg', 'kyc', 'aml', 'ciso', 'dpo', 'coo', 'cmo', 'chro',
        'tvs', 'hn', 'reddit', 'github', 'stackoverflow', 'linkedin',
        'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'twitch',
        'openai', 'anthropic', 'google', 'microsoft', 'amazon', 'meta',
        'apple', 'nvidia', 'amd', 'intel', 'ibm', 'oracle', 'salesforce',
        'usa', 'uk', 'eu', 'apac', 'emea', 'latam', 'mena', 'asean',
    }
    
    # Tech compound words that should be capitalized as one word
    tech_compounds = {
        'fintech': 'Fintech',
        'healthtech': 'Healthtech',
        'edtech': 'Edtech',
        'proptech': 'Proptech',
        'insurtech': 'Insurtech',
        'regtech': 'Regtech',
        'martech': 'Martech',
        'adtech': 'Adtech',
        'hrtech': 'HRtech',
        'legaltech': 'Legaltech',
        'agtech': 'Agtech',
        'cleantech': 'Cleantech',
        'biotech': 'Biotech',
        'medtech': 'Medtech',
    }
    
    # Words that should stay lowercase (unless at start)
    lowercase_words = {
        'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in',
        'into', 'of', 'on', 'or', 'the', 'to', 'with', 'vs', 'via'
    }
    
    # Split into words while preserving punctuation
    words = re.findall(r"[\w']+|[^\w\s]", text.lower())
    result = []
    
    for i, word in enumerate(words):
        # Skip punctuation
        if not re.match(r"[\w']+", word):
            result.append(word)
            continue
        
        # Check if it's an acronym
        word_clean = word.strip("'")
        if word_clean in acronyms:
            result.append(word_clean.upper())
            # Add space after word if not followed by punctuation
            if i < len(words) - 1 and re.match(r"[\w']+", words[i + 1]):
                result.append(' ')
            continue
        
        # Check if it's a tech compound word
        if word_clean in tech_compounds:
            result.append(tech_compounds[word_clean])
            if i < len(words) - 1 and re.match(r"[\w']+", words[i + 1]):
                result.append(' ')
            continue
        
        # First word or after punctuation should always be capitalized
        if i == 0 or (i > 0 and words[i-1] in '.!?:'):
            result.append(word.capitalize())
            if i < len(words) - 1 and re.match(r"[\w']+", words[i + 1]):
                result.append(' ')
            continue
        
        # Keep lowercase words lowercase (unless first word)
        if word_clean in lowercase_words:
            result.append(word)
            if i < len(words) - 1 and re.match(r"[\w']+", words[i + 1]):
                result.append(' ')
            continue
        
        # Default: capitalize first letter
        result.append(word.capitalize())
        if i < len(words) - 1 and re.match(r"[\w']+", words[i + 1]):
            result.append(' ')
    
    return ''.join(result).strip()


def normalize_trend_title(title: str) -> str:
    """
    Normalize a trend title for consistent display.
    Handles common issues like all-lowercase, all-uppercase, etc.
    """
    if not title:
        return title
    
    # If already properly capitalized (has mix of upper and lower), return as-is
    if title != title.lower() and title != title.upper() and not title.islower():
        # Check if it looks reasonable (not ALL CAPS or all lowercase)
        upper_count = sum(1 for c in title if c.isupper())
        lower_count = sum(1 for c in title if c.islower())
        if upper_count > 0 and lower_count > upper_count:
            return title
    
    # Otherwise, apply title case
    return to_title_case(title)
