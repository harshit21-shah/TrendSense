import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../api';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
