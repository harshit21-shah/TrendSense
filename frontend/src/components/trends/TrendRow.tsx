import type { KeyboardEvent, MouseEvent } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { TVSBadge, DeltaBadge } from '../ui/TVSBadge';
import { DomainBadge, StageBadge } from '../ui/Badge';
import { Sparkline } from '../ui/Sparkline';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/cn';
import { timeAgo } from '../../lib/utils';
import { toTitleCase } from '../../lib/text';
import type { Trend } from '../../types';

interface TrendRowProps {
  trend: Trend;
  isSelected?: boolean;
}

export function TrendRow({ trend, isSelected }: TrendRowProps) {
  const { selectTrend } = useAppStore();
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(trend.id);

  const handleWatchlist = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    toggleWatchlist(trend.id);
  };

  const handleRowKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectTrend(trend.id);
    }
  };

  const title = toTitleCase(trend.title);
  const age = timeAgo(trend.last_updated_at ?? trend.first_seen_at);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={() => selectTrend(trend.id)}
      onKeyDown={handleRowKey}
      className={cn(
        'flex items-center gap-3 px-4 h-11 border-b border-zinc-800/30 cursor-pointer group select-none transition-colors',
        isSelected
          ? 'bg-zinc-800/50 border-l-2 border-l-violet-500 pl-[14px]'
          : 'hover:bg-zinc-900/60 border-l-2 border-l-transparent',
      )}
    >
      {/* TVS score */}
      <TVSBadge score={trend.velocity_score} size="sm" />

      {/* Title — flex-1 to fill available width */}
      <p className="flex-1 min-w-0 text-sm text-zinc-200 truncate font-medium leading-none">
        {title}
      </p>

      {/* Metadata — right-aligned, all shrink-0 */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <DomainBadge domain={trend.domain} />
        <StageBadge stage={trend.stage} />
      </div>

      <DeltaBadge delta={trend.tvs_delta} />

      <div className="hidden md:block shrink-0">
        <Sparkline data={trend.velocity_history} width={64} height={20} />
      </div>

      <span className="text-[11px] text-zinc-700 font-mono w-9 text-right shrink-0 tabular-nums">
        {age}
      </span>

      {/* Bookmark — visible on touch, hover-fade on pointer */}
      <button
        onClick={handleWatchlist}
        onKeyDown={(e) => e.key === 'Enter' && handleWatchlist(e)}
        className={cn(
          'p-0.5 rounded transition-colors shrink-0',
          inWatchlist
            ? 'text-violet-400'
            : 'text-zinc-800 sm:opacity-0 sm:group-hover:opacity-100 hover:text-zinc-500',
        )}
        aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        aria-pressed={inWatchlist}
      >
        {inWatchlist ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
