import { useQuery } from '@tanstack/react-query'
import { fetchTrends, fetchDomains, fetchBrief, fetchTimeline, fetchTrendById } from '../lib/api'

export const useTrends = (params: Record<string, string> = {}) =>
  useQuery({
    queryKey: ['trends', params],
    queryFn: () => fetchTrends(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

export const useDomains = () =>
  useQuery({
    queryKey: ['domains'],
    queryFn: fetchDomains,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

export const useBrief = () =>
  useQuery({
    queryKey: ['brief'],
    queryFn: fetchBrief,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })

export const useTimeline = (topic: string) =>
  useQuery({
    queryKey: ['timeline', topic],
    queryFn: () => fetchTimeline(topic),
    enabled: !!topic,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

export const useTrendDetail = (id: string) =>
  useQuery({
    queryKey: ['trend', id],
    queryFn: () => fetchTrendById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
