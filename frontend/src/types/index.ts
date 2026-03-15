export interface Trend {
  id: string | number
  title: string
  domain: string
  velocity_score: number
  tvs_score?: number
  tvs_delta: number
  stage: 'Emerging' | 'Rising' | 'Mainstream' | string
  summary: string
  investment_thesis: string
  product_opportunity: string
  risk_assessment: string
  historical_accuracy?: string
  source_citations: string[]
  first_seen_at: string
  run_date?: string
  velocity_history?: { date: string; score: number }[]
}

export interface DailyBrief {
  brief_date: string
  content: string
  top_trends: Trend[]
  generated_at: string
}

export interface TimelinePoint {
  date: string
  score: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  grounded_in?: number
  timestamp: Date
}

export interface PipelineStatus {
  running: boolean
  last_run?: string
  trends_count?: number
}
