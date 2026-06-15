import axios from 'axios';
import type {
  Trend,
  DailyBrief,
  Notification,
  PipelineStatus,
  TrendFilters,
  HealthResponse,
  SourcesResponse,
} from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';
const PIPELINE_KEY = (import.meta.env.VITE_PIPELINE_API_KEY as string | undefined) || '';

const api = axios.create({ baseURL: API_URL });

export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
};

export const getSources = async (): Promise<SourcesResponse> => {
  const { data } = await api.get<SourcesResponse>('/sources');
  return data;
};

export const getTrends = async (filters?: TrendFilters): Promise<Trend[]> => {
  const { data } = await api.get<Trend[]>('/trends', {
    params: {
      domains: filters?.domains?.length ? filters.domains.join(',') : undefined,
      stages: filters?.stages?.length ? filters.stages.join(',') : undefined,
      tvs_min: filters?.tvsMin,
      tvs_max: filters?.tvsMax,
      momentum_min: filters?.momentumMin,
      momentum_max: filters?.momentumMax,
      time_range: filters?.timeRange,
    },
  });
  return data;
};

export const getTrend = async (id: number): Promise<Trend> => {
  const { data } = await api.get<Trend>(`/trends/${id}`);
  return data;
};

export const getDomains = async (): Promise<{ name: string; count: number }[]> => {
  const { data } = await api.get<{ name: string; count: number }[]>('/domains');
  return data;
};

export const getStages = async (): Promise<{ name: string; count: number }[]> => {
  const { data } = await api.get<{ name: string; count: number }[]>('/stages');
  return data;
};

export const searchTrends = async (q: string): Promise<Trend[]> => {
  const { data } = await api.get<Trend[]>('/search', { params: { q } });
  return data;
};

export const getDailyBrief = async (): Promise<DailyBrief> => {
  const { data } = await api.get<DailyBrief>('/daily-brief');
  return data;
};

export const getNotifications = async (
  unreadOnly = false,
  limit = 30,
): Promise<Notification[]> => {
  const { data } = await api.get<Notification[]>('/notifications', {
    params: { unread_only: unreadOnly, limit },
  });
  return data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};

export const getChatSuggestions = async (): Promise<string[]> => {
  const { data } = await api.get<{ suggestions: string[] }>('/chat/suggestions');
  return data.suggestions;
};

export const triggerPipeline = async (
  domains?: string[],
): Promise<{ status: string; message: string }> => {
  const headers: Record<string, string> = {};
  if (PIPELINE_KEY) headers['X-API-Key'] = PIPELINE_KEY;
  const params = domains?.length ? { domains: domains.join(',') } : undefined;
  const { data } = await api.post<{ status: string; message: string }>(
    '/run-pipeline',
    {},
    { headers, params },
  );
  return data;
};

export const getPipelineStatus = async (): Promise<PipelineStatus> => {
  const { data } = await api.get<PipelineStatus>('/pipeline-status');
  return data;
};

export const queryTrends = async (
  question: string,
  onChunk: (content: string) => void,
  onError?: (error: string) => void,
  signal?: AbortSignal,
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal,
    });
    if (!response.ok) {
      onError?.(`HTTP ${response.status}: ${response.statusText}`);
      return;
    }
    const reader = response.body?.getReader();
    if (!reader) {
      onError?.('Stream not available from server.');
      return;
    }
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') return;
        try {
          const parsed = JSON.parse(payload) as { content?: string };
          if (parsed.content) onChunk(parsed.content);
        } catch {
          // skip malformed chunk
        }
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError?.(err instanceof Error ? err.message : String(err));
  }
};

export default api;
