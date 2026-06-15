export interface VelocityPoint {
  date: string;
  score: number;
}

export interface Trend {
  id: number;
  title: string;
  domain: string;
  velocity_score: number;
  tvs_delta?: number;
  stage: string;
  summary: string;
  investment_thesis?: string;
  product_opportunity?: string;
  risk_assessment?: string;
  historical_accuracy?: string;
  source_citations: string[];
  first_seen_at: string | null;
  velocity_history?: VelocityPoint[];
  last_updated_at?: string | null;
}

export interface DailyBrief {
  content: string;
  date: string;
  trend_count: number;
  signal_count: number;
  generated: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  trend_id?: number | null;
  read: boolean;
  timestamp: string | null;
}

export interface PipelineStatus {
  running: boolean;
  last_result?: {
    status: string;
    run_id?: number;
    trends_saved: number;
    signals_fetched: number;
    errors?: string[];
    stats?: Record<string, unknown>;
  } | null;
  last_run?: {
    id: number;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    signals_fetched: number;
    trends_saved: number;
  } | null;
}

export interface HealthResponse {
  status: string;
  db: string;
  chroma: string;
  groq_configured: boolean;
  newsapi_configured: boolean;
  pipeline_running: boolean;
  scheduler_minutes: number;
  domains: string[];
}

export interface SourceInfo {
  id: string;
  name: string;
  type: string;
  requires_key: boolean;
  configured?: boolean;
  feed_count: number;
  last_count?: number;
}

export interface SourcesResponse {
  sources: SourceInfo[];
  total_feeds: number;
  last_pipeline: {
    signals_fetched: number;
    completed_at: string | null;
  } | null;
}

export interface TrendFilters {
  domains?: string[];
  stages?: string[];
  tvsMin?: number;
  tvsMax?: number;
  momentumMin?: number;
  momentumMax?: number;
  timeRange?: '7d' | '30d' | '90d';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
