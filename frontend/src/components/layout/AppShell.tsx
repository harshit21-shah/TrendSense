import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NotificationPanel } from './NotificationPanel';
import { SearchOverlay } from './SearchOverlay';
import { ToastManager } from '../ui/Toast';
import { TrendDrawer } from '../trends/TrendDrawer';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAppStore } from '../../store/useAppStore';
import { usePipelineStatus } from '../../hooks/usePipeline';
import { useHealth } from '../../hooks/useHealth';
import type { PipelineStatus } from '../../types';

// Accurate pipeline completion watcher — checks status before toasting
function PipelineWatcher() {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();
  const { data } = usePipelineStatus();
  const prevRunning = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (prevRunning.current === true && data?.running === false) {
      const status = (data as PipelineStatus).last_result?.status;
      const errors = (data as PipelineStatus).last_result?.errors ?? [];
      const saved = (data as PipelineStatus).last_run?.trends_saved ?? 0;

      const signals = (data as PipelineStatus).last_run?.signals_fetched ?? 0;
      if (status === 'completed' && errors.length === 0) {
        const detail = signals > 0 ? ` · ${signals} signals processed` : '';
        addToast({
          type: 'success',
          message: `Pipeline complete${detail}`,
        });
      } else if (status === 'failed' || errors.length > 0) {
        addToast({
          type: 'error',
          message: 'Pipeline failed — check Sources for details',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['daily-brief'] });
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    }
    prevRunning.current = data?.running;
  }, [data?.running, data, queryClient, addToast]);

  return null;
}

const API_ORIGIN = (() => {
  try {
    return new URL((import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000').origin;
  } catch {
    return 'http://localhost:8000';
  }
})();

// Shows a slim banner when the FastAPI backend is unreachable
function BackendBanner() {
  const { isError, isFetching, isSuccess } = useHealth();

  // Only show after we know for certain it's unreachable (not during initial load)
  if (isFetching || isSuccess) return null;
  if (!isError) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/80 border-b border-amber-900/60 text-xs text-amber-300 shrink-0">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>
        Backend unreachable — ensure the FastAPI server is running at{' '}
        <code className="font-mono text-amber-200">{API_ORIGIN}</code>
      </span>
    </div>
  );
}

// Global keyboard shortcuts
function KeyboardShortcuts() {
  const { setSearchOpen } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        navigate('/chat');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setSearchOpen, navigate]);

  return null;
}

export function AppShell() {
  const { selectedTrendId, closeDrawer } = useAppStore();

  return (
    <div className="flex h-full bg-zinc-950">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <BackendBanner />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Overlays */}
      <NotificationPanel />
      <SearchOverlay />
      <ToastManager />

      {/* Global trend drawer — works from any page including search */}
      {selectedTrendId != null && (
        <TrendDrawer trendId={selectedTrendId} onClose={closeDrawer} />
      )}

      {/* Headless watchers */}
      <PipelineWatcher />
      <KeyboardShortcuts />
    </div>
  );
}
