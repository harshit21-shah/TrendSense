# TrendSense Deduplication System

## Overview
Comprehensive semantic deduplication system that removes duplicate trend signals using multiple strategies to ensure data quality and reduce noise.

---

## Problem Statement

### Identified Duplicates (from analysis)
- **Serverless GPU**: 4 duplicates (95, 90, 88, 85 scores)
- **Vision Transformers**: 5 duplicates (95, 92, 90, 85, 80 scores)
- **AI Efficiency**: 4 duplicates (all 90 score)
- **Crowd Density**: 3 duplicates (all 80 score)
- **AI Chip Design**: 4 duplicates (90, 80, 80, 75 scores)
- **Climate/Geology**: 3 duplicates (80, 80, 70 scores)
- **Music Recognition**: 3 duplicates (80, 75, 75 scores)
- **Causal AI**: 3 duplicates (85, 75, 70 scores)
- **Autonomous Systems**: 2 duplicates (both 90 score)
- **Open-Source AI**: 2 duplicates (85, 80 scores)
- **LLM Limitations**: 2 duplicates (80, 70 scores)

**Total Impact**: 88 signals → ~55-60 unique signals (35% reduction)

---

## Solution Architecture

### Multi-Strategy Deduplication

#### Strategy 1: Exact Title Matching
```python
# Case-insensitive exact match
if title1.lower().strip() == title2.lower().strip():
    return True
```

#### Strategy 2: Topic Group Matching
```python
TOPIC_GROUPS = {
    'serverless-gpu': ['serverless gpu', 'gpu computing', 'gpu market'],
    'vision-transformers': ['vision transformer', 'vit', 'image transformer'],
    'ai-efficiency': ['efficient ai', 'compression', 'quantization'],
    # ... 11 predefined topic groups
}
```

#### Strategy 3: Keyword Similarity (Jaccard)
```python
# Extract keywords, remove stop words
keywords1 = extract_keywords(title1)
keywords2 = extract_keywords(title2)

# Calculate Jaccard similarity
similarity = len(intersection) / len(union)

# Threshold: 0.75 (75% keyword overlap)
```

#### Strategy 4: String Similarity (SequenceMatcher)
```python
# Character-level similarity
similarity = SequenceMatcher(None, title1, title2).ratio()

# Threshold: 0.85 (85% character match)
```

#### Strategy 5: Substring Matching
```python
# One title contains another + keyword verification
if title1 in title2 and keyword_similarity >= 0.5:
    return True
```

---

## Selection Criteria

When duplicates are found, the system selects the best representative using:

1. **Highest Velocity Score** (primary)
2. **Most Recent Timestamp** (secondary)
3. **Longest/Most Descriptive Title** (tertiary)

```python
sorted_trends = sorted(
    duplicates,
    key=lambda t: (
        t['velocity_score'],      # Highest score wins
        t['first_seen_at'],       # Most recent wins
        len(t['title'])           # Longest title wins
    ),
    reverse=True
)
```

---

## API Integration

### Automatic Deduplication (Default)
```bash
GET /trends?deduplicate=true
```

Returns deduplicated trends automatically.

### Disable Deduplication
```bash
GET /trends?deduplicate=false
```

Returns all trends including duplicates (for debugging).

### Deduplication Report
```bash
GET /deduplication-report
```

Returns detailed analysis:
```json
{
  "total_trends": 88,
  "unique_trends": 56,
  "duplicate_groups": 11,
  "total_duplicates": 32,
  "groups": [
    {
      "count": 4,
      "titles": [
        "serverless gpu computing",
        "serverless gpu market",
        "serverless gpu",
        "serverless gpu market growth"
      ],
      "scores": [95, 90, 85, 88],
      "selected": "serverless gpu computing"
    }
  ]
}
```

---

## Implementation Details

### File Structure
```
backend/app/
├── deduplication.py       # Core deduplication logic
├── main.py               # API integration
└── models.py             # Trend model
```

### Key Classes

#### `TrendDeduplicator`
Main deduplication engine with configurable similarity threshold.

**Methods:**
- `extract_keywords(title)` - Extract meaningful keywords
- `calculate_keyword_similarity(title1, title2)` - Jaccard similarity
- `calculate_string_similarity(title1, title2)` - Character similarity
- `get_topic_group(title)` - Identify predefined topic
- `are_duplicates(trend1, trend2)` - Multi-strategy duplicate detection
- `select_best_trend(duplicates)` - Choose best representative
- `deduplicate(trends)` - Main deduplication function
- `get_deduplication_report(trends)` - Generate analysis report

---

## Configuration

### Similarity Thresholds
```python
# Keyword similarity threshold
KEYWORD_THRESHOLD = 0.75  # 75% keyword overlap

# String similarity threshold
STRING_THRESHOLD = 0.85   # 85% character match

# Topic group keyword threshold
TOPIC_GROUP_THRESHOLD = 0.6  # 60% for same topic group
```

### Stop Words
Com