import { useQuery } from '@tanstack/react-query';
import { getDailyBrief } from '../api';

export function useDailyBrief() {
  return useQuery({
    queryKey: ['daily-brief'],
    queryFn: getDailyBrief,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
