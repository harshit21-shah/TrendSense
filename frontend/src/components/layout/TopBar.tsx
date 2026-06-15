import { Bell, Search, Play, Loader2, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useUnreadCount } from '../../hooks/useNotifications';
import { usePipelineStatus, useTriggerPipeline } from '../../hooks/usePipeline';
import { useTrends } from '../../hooks/useTrends';
import { cn } from '../../lib/cn';
import { formatDateTime } from '../../lib/utils';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Trends',
  '/brief': 'Daily Brief',
  '/chat': 'Ava',
  '/watchlist': 'Watchlist',
  '/sources': 'Sources',
};

const isMac =
  typeof navigator !== 'undefined' &&
  (navigator.platform.toLowerCase().includes('mac') || /mac/i.test(navigator.userAgent));
const SEARCH_SHORTCUT = isMac ? '⌘K' : 'Ctrl+K';

export function TopBar() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'TrendSense';
  const { setNotificationPanelOpen, notificationPanelOpen, setSearchOpen } = useAppStore();
  const unread = useUnreadCount();
  const { data: pipeline } = usePipelineStatus();
  const { data: trends } = useTrends({});
  const trigger = useTriggerPipeline();
  const isRunning = pipeline?.running ?? false;
  const isPending = trigger.isPending;

  // Show meaningful stats from live trend count (not pipeline run column which can be 0)
  const trendCount = trends?.length ?? 0;
  const lastRunTime = pipeline?.last_run?.completed_at;

  return (
    <header className="flex items-center h-[52px] px-4 border-b border-zinc-800/40 bg-zinc-950/90 backdrop-blur-sm shrink-0 gap-3">
      {/* Page title */}
      <h1 className="text-[13px] font-semibold text-zinc-200 tracking-tight">{title}</h1>

      {/* Status chip */}
      <div className="hidden sm:flex items-center gap-2 ml-1">
        {isRunning ? (
          <span className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/8 px-2 py-0.5 rounded-full ring-1 ring-amber-500/20 font-medium">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Running
          </span>
        ) : trendCount > 0 ? (
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-600">
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="tabular-nums">{trendCount.toLocaleString()} trends</span>
            {lastRunTime && (
              <span className="text-zinc-800 hidden md:inline">· {formatDateTime(lastRunTime)}</span>
            )}
          </span>
        ) : null}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 h-7 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 text-[12px] transition-colors ring-1 ring-zinc-800/80 hover:ring-zinc-700/60"
          aria-label={`Search trends (${SEARCH_SHORTCUT})`}
        >
          <Search className="h-3 w-3 shrink-0" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline text-zinc-700 text-[10px] font-mono bg-zinc-950/80 px-1 py-px rounded leading-none">
            {SEARCH_SHORTCUT}
          </kbd>
        </button>

        {/* Run pipeline */}
        <button
          onClick={() => trigger.mutate(undefined)}
          disabled={isRunning || isPending}
          className={cn(
            'flex items-center justify-center h-7 w-7 rounded-md transition-colors',
            isRunning || isPending
              ? 'text-zinc-700 cursor-not-allowed'
              : 'text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/80',
          )}
          title={isRunning ? 'Pipeline running…' : 'Run pipeline now'}
          aria-label={isRunning ? 'Pipeline running' : 'Run pipeline'}
        >
          {isRunning || isPending ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
          className={cn(
            'relative flex items-center justify-center h-7 w-7 rounded-md transition-colors',
            notificationPanelOpen
              ? 'text-zinc-200 bg-zinc-800'
              : 'text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/80',
          )}
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        >
          <Bell className="h-3.5 w-3.5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 flex items-center justify-center bg-violet-600 text-white text-[9px] font-bold rounded-full leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
