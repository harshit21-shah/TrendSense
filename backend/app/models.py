from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class RawPost(Base):
    __tablename__ = "raw_posts"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String)  # reddit, hn, newsapi
    source_id = Column(String, unique=True, index=True)
    title = Column(String)
    content = Column(Text)
    score = Column(Integer)
    url = Column(String)
    subreddit = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Trend(Base):
    __tablename__ = "trends"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    domain = Column(String, index=True)  # AI, fintech, health, etc.
    velocity_score = Column(Float)  # TVS
    stage = Column(String)  # Emerging, Rising, Mainstream
    summary = Column(Text)
    investment_thesis = Column(Text)
    product_opportunity = Column(Text)
    risk_assessment = Column(Text)
    historical_accuracy = Column(Text)
    source_citations = Column(JSON)  # List of URLs/sources
    first_seen_at = Column(DateTime(timezone=True), server_default=func.now())
    velocity_history = Column(JSON)  # List of {date: str, score: float}
    tvs_delta = Column(Float, default=0.0)  # Change vs previous run (positive = rising)
    last_updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class DailyBrief(Base):
    __tablename__ = "daily_briefs"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)  # Markdown
    date = Column(DateTime(timezone=True), server_default=func.now())
