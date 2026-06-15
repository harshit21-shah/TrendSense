"""
Semantic Deduplication Service for TrendSense
Removes duplicate signals using multiple strategies:
1. Exact title matching (case-insensitive)
2. Keyword-based similarity
3. Semantic similarity using embeddings
"""

import re
from typing import List, Dict, Set, Tuple
from difflib import SequenceMatcher
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class TrendDeduplicator:
    """Deduplicates trend signals using semantic and keyword-based approaches."""
    
    # Common stop words to ignore in keyword extraction
    STOP_WORDS = {
        'ai', 'powered', 'driven', 'based', 'for', 'and', 'the', 'in', 'on', 
        'with', 'using', 'systems', 'system', 'technology', 'tech', 'new',
        'advanced', 'next', 'gen', 'generation', 'market', 'industry'
    }
    
    # Known topic groups for domain-specific deduplication
    TOPIC_GROUPS = {
        'serverless-gpu': [
            'serverless gpu', 'gpu computing', 'gpu market', 'serverless computing'
        ],
        'vision-transformers': [
            'vision transformer', 'vit', 'image transformer', 'visual transformer'
        ],
        'ai-efficiency': [
            'efficient ai', 'ai efficiency', 'compression', 'model compression',
            'quantization', 'pruning', 'distillation'
        ],
        'crowd-density': [
            'crowd density', 'crowd prediction', 'crowd analysis', 'crowd monitoring'
        ],
        'chip-design': [
            'chip design', 'semiconductor design', 'asic design', 'hardware design'
        ],
        'music-recognition': [
            'music recognition', 'audio recognition', 'sound recognition', 'music identification'
        ],
        'causal-ai': [
            'causal ai', 'causal inference', 'causal learning', 'causality'
        ],
        'autonomous-systems': [
            'autonomous system', 'autonomous robot', 'self-driving', 'autonomous vehicle'
        ],
        'open-source-ai': [
            'open source ai', 'open ai', 'oss ai', 'open source model'
        ],
        'llm-limitations': [
            'llm limitation', 'autoregressive', 'language model limitation'
        ],
        'geological-ai': [
            'geology', 'geospatial', 'geological', 'earth science'
        ]
    }
    
    def __init__(self, similarity_threshold: float = 0.75):
        """
        Initialize deduplicator.
        
        Args:
            similarity_threshold: Minimum similarity score (0-1) to consider trends as duplicates
        """
        self.similarity_threshold = similarity_threshold
    
    def extract_keywords(self, title: str) -> Set[str]:
        """
        Extract meaningful keywords from a title.
        
        Args:
            title: Trend title
            
        Returns:
            Set of normalized keywords
        """
        # Normalize: lowercase, remove special chars, split
        normalized = re.sub(r'[^\w\s-]', '', title.lower())
        words = normalized.replace('-', ' ').split()
        
        # Filter stop words and short words
        keywords = {
            word for word in words 
            if word not in self.STOP_WORDS and len(word) > 2
        }
        
        return keywords
    
    def calculate_keyword_similarity(self, title1: str, title2: str) -> float:
        """
        Calculate Jaccard similarity between keyword sets.
        
        Args:
            title1: First trend title
            title2: Second trend title
            
        Returns:
            Similarity score between 0 and 1
        """
        keywords1 = self.extract_keywords(title1)
        keywords2 = self.extract_keywords(title2)
        
        if not keywords1 or not keywords2:
            return 0.0
        
        intersection = keywords1.intersection(keywords2)
        union = keywords1.union(keywords2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def calculate_string_similarity(self, title1: str, title2: str) -> float:
        """
        Calculate character-level similarity using SequenceMatcher.
        
        Args:
            title1: First trend title
            title2: Second trend title
            
        Returns:
            Similarity score between 0 and 1
        """
        return SequenceMatcher(None, title1.lower(), title2.lower()).ratio()
    
    def get_topic_group(self, title: str) -> str:
        """
        Identify which predefined topic group a title belongs to.
        
        Args:
            title: Trend title
            
        Returns:
            Topic group key or empty string if no match
        """
        title_lower = title.lower()
        
        for group_key, patterns in self.TOPIC_GROUPS.items():
            for pattern in patterns:
                if pattern in title_lower:
                    return group_key
        
        return ""
    
    def are_duplicates(self, trend1: Dict, trend2: Dict) -> bool:
        """
        Determine if two trends are duplicates using multiple strategies.
        
        Args:
            trend1: First trend dictionary
            trend2: Second trend dictionary
            
        Returns:
            True if trends are considered duplicates
        """
        title1 = trend1.get('title', '')
        title2 = trend2.get('title', '')
        
        # Strategy 1: Exact match (case-insensitive)
        if title1.lower().strip() == title2.lower().strip():
            return True
        
        # Strategy 2: Topic group matching
        group1 = self.get_topic_group(title1)
        group2 = self.get_topic_group(title2)
        if group1 and group2 and group1 == group2:
            # Same topic group - check if they're similar enough
            keyword_sim = self.calculate_keyword_similarity(title1, title2)
            if keyword_sim >= 0.6:  # Lower threshold for same topic group
                return True
        
        # Strategy 3: High keyword similarity
        keyword_sim = self.calculate_keyword_similarity(title1, title2)
        if keyword_sim >= self.similarity_threshold:
            return True
        
        # Strategy 4: High string similarity (catches typos and minor variations)
        string_sim = self.calculate_string_similarity(title1, title2)
        if string_sim >= 0.85:  # High threshold for string matching
            return True
        
        # Strategy 5: One title is substring of another (with keyword check)
        if (title1.lower() in title2.lower() or title2.lower() in title1.lower()):
            # Verify they share significant keywords
            if keyword_sim >= 0.5:
                return True
        
        return False
    
    def select_best_trend(self, duplicates: List[Dict]) -> Dict:
        """
        Select the best representative from a group of duplicate trends.
        
        Selection criteria (in order):
        1. Highest velocity score
        2. Most recent timestamp
        3. Longest/most descriptive title
        
        Args:
            duplicates: List of duplicate trend dictionaries
            
        Returns:
            The best trend to keep
        """
        if not duplicates:
            return {}
        
        if len(duplicates) == 1:
            return duplicates[0]
        
        # Sort by velocity score (desc), then by timestamp (desc), then by title length (desc)
        sorted_trends = sorted(
            duplicates,
            key=lambda t: (
                t.get('velocity_score', 0),
                t.get('first_seen_at', ''),
                len(t.get('title', ''))
            ),
            reverse=True
        )
        
        return sorted_trends[0]
    
    def deduplicate(self, trends: List[Dict]) -> List[Dict]:
        """
        Remove duplicate trends from a list.
        
        Args:
            trends: List of trend dictionaries
            
        Returns:
            Deduplicated list of trends
        """
        if not trends:
            return []
        
        # Track which trends have been grouped
        processed_indices = set()
        duplicate_groups = []
        
        # Find all duplicate groups
        for i, trend1 in enumerate(trends):
            if i in processed_indices:
                continue
            
            # Start a new group with this trend
            group = [trend1]
            processed_indices.add(i)
            
            # Find all duplicates of this trend
            for j, trend2 in enumerate(trends[i+1:], start=i+1):
                if j in processed_indices:
                    continue
                
                if self.are_duplicates(trend1, trend2):
                    group.append(trend2)
                    processed_indices.add(j)
            
            duplicate_groups.append(group)
        
        # Select best trend from each group
        deduplicated = [self.select_best_trend(group) for group in duplicate_groups]
        
        # Log deduplication stats
        original_count = len(trends)
        final_count = len(deduplicated)
        removed_count = original_count - final_count
        
        if removed_count > 0:
            logger.info(
                f"Deduplication: {original_count} trends -> {final_count} unique "
                f"({removed_count} duplicates removed, {removed_count/original_count*100:.1f}% reduction)"
            )
            
            # Log some examples of what was merged
            for group in duplicate_groups:
                if len(group) > 1:
                    titles = [t.get('title', 'Unknown') for t in group]
                    best = self.select_best_trend(group).get('title', 'Unknown')
                    logger.debug(f"Merged duplicates → '{best}': {titles}")
        
        return deduplicated
    
    def get_deduplication_report(self, trends: List[Dict]) -> Dict:
        """
        Generate a detailed report of duplicates found.
        
        Args:
            trends: List of trend dictionaries
            
        Returns:
            Report dictionary with duplicate groups and statistics
        """
        processed_indices = set()
        duplicate_groups = []
        
        for i, trend1 in enumerate(trends):
            if i in processed_indices:
                continue
            
            group = [trend1]
            processed_indices.add(i)
            
            for j, trend2 in enumerate(trends[i+1:], start=i+1):
                if j in processed_indices:
                    continue
                
                if self.are_duplicates(trend1, trend2):
                    group.append(trend2)
                    processed_indices.add(j)
            
            if len(group) > 1:  # Only include groups with duplicates
                duplicate_groups.append(group)
        
        return {
            'total_trends': len(trends),
            'unique_trends': len(trends) - sum(len(g) - 1 for g in duplicate_groups),
            'duplicate_groups': len(duplicate_groups),
            'total_duplicates': sum(len(g) - 1 for g in duplicate_groups),
            'groups': [
                {
                    'count': len(group),
                    'titles': [t.get('title', 'Unknown') for t in group],
                    'scores': [t.get('velocity_score', 0) for t in group],
                    'selected': self.select_best_trend(group).get('title', 'Unknown')
                }
                for group in duplicate_groups
            ]
        }


# Global deduplicator instance
deduplicator = TrendDeduplicator(similarity_threshold=0.75)
