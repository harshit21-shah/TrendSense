import { useQuery } from '@tanstack/react-query';
import { getTrends, getTrend, getDomains, getStages, searchTrends } from '../api';
import type { TrendFilters } from '../types';

export function useTrends(filters?: TrendFilters) {
  return useQuery({
    queryKey: ['trends', filters],
    queryFn: () => getTrends(filters),
    staleTime: 30_000,
  });
}

export function useTrend(id: number | null) {
  return useQuery({
    queryKey: ['trend', id],
    queryFn: () => getTrend(id!),
    enabled: id != null,
    staleTime: 60_000,
  });
}

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: getDomains,
    staleTime: 5 * 60_000,
  });
}

export function useStages() {
  return useQuery({
    queryKey: ['stages'],
    queryFn: getStages,
    staleTime: 5 * 60_000,
  });
}

export function useSearchTrends(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchTrends(query),
    enabled: query.trim().length > 1,
    staleTime: 10_000,
  });
}
