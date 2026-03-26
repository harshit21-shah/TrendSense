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
  source_citations: string[];
  first_seen_at: string;
}

export type TrendStage = 'Emerging' | 'Rising' | 'Mainstream' | 'Fading';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};
