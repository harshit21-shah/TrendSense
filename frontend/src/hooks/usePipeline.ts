import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPipelineStatus, triggerPipeline } from '../api';
import { useAppStore } from '../store/useAppStore';

export function usePipelineStatus() {
  return useQuery({
    queryKey: ['pipeline-status'],
    queryFn: getPipelineStatus,
    refetchInterval: (query) => (query.state.data?.running ? 3_000 : 15_000),
    staleTime: 2_000,
  });
}

export function useTriggerPipeline() {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: (domains?: string[]) => triggerPipeline(domains),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-status'] });
      if (data.status === 'running') {
        addToast({ type: 'info', message: 'Pipeline already running…' });
      } else {
        addToast({ type: 'info', message: 'Pipeline started — results in ~60s' });
      }
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        message: `Failed to start pipeline: ${err.message}`,
      });
    },
  });
}
