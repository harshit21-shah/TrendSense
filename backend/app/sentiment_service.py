from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import Dict
import nltk

# Ensure NLTK data is available
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class SentimentService:
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()

    def analyze(self, text: str) -> Dict[str, float]:
        """
        Performs dual sentiment analysis using TextBlob and VADER.
        Returns a dictionary with polarity, subjectivity, and VADER compound scores.
        """
        if not text:
            return {"polarity": 0.0, "subjectivity": 0.0, "compound": 0.0}

        blob = TextBlob(text)
        vader_scores = self.vader.polarity_scores(text)

        return {
            "polarity": blob.sentiment.polarity,
            "subjectivity": blob.sentiment.subjectivity,
            "compound": vader_scores['compound'],
            "pos": vader_scores['pos'],
            "neu": vader_scores['neu'],
            "neg": vader_scores['neg']
        }

    def get_sentiment_label(self, compound_score: float) -> str:
        """Categorizes sentiment based on VADER compound score."""
        if compound_score >= 0.05:
            return "Positive"
        elif compound_score <= -0.05:
            return "Negative"
        else:
            return "Neutral"

sentiment_service = SentimentService()
