from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text, ForeignKey, Boolean
from sqlalchemy.sql import func
from .database import Base


class RawPost(Base):
    __tablename__ = "raw_posts"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String)
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
    title = Column(String, unique=True, index=True)
    domain = Column(String, index=True)
    velocity_score = Column(Float)
    stage = Column(String)
    summary = Column(Text)
    investment_thesis = Column(Text)
    product_opportunity = Column(Text)
    risk_assessment = Column(Text)
    historical_accuracy = Column(Text)
    source_citations = Column(JSON)
    first_seen_at = Column(DateTime(timezone=True), server_default=func.now())
    velocity_history = Column(JSON, default=list)
    tvs_delta = Column(Float, default=0.0)
    last_updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DailyBrief(Base):
    __tablename__ = "daily_briefs"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    date = Column(DateTime(timezone=True), server_default=func.now())
    trend_count = Column(Integer, default=0)
    signal_count = Column(Integer, default=0)


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="running")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    signals_fetched = Column(Integer, default=0)
    trends_saved = Column(Integer, default=0)
    errors = Column(JSON, default=list)
    stats = Column(JSON, default=dict)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    title = Column(String)
    message = Column(Text)
    trend_id = Column(Integer, ForeignKey("trends.id"), nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
