import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight } from 'lucide-react';
import { useTrends } from '../hooks/useTrends';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { TrendList } from '../components/trends/TrendList';

export default function Watchlist() {
  useDocumentTitle('Watchlist');
  const { watchlistIds } = useWatchlistStore();
  const { data: allTrends, isLoading } = useTrends();

  const watchlistTrends = allTrends?.filter((t) => watchlistIds.includes(t.id));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/50 shrink-0">
        <Bookmark className="h-4 w-4 text-violet-400" />
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Saved Trends</h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            {watchlistIds.length === 0
              ? 'Nothing saved yet'
              : `${watchlistIds.length} trend${watchlistIds.length !== 1 ? 's' : ''} bookmarked`}
          </p>
        </div>
      </div>

      {watchlistIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-5 p-12 text-zinc-600">
          <Bookmark className="h-12 w-12 opacity-15" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-500 mb-1">Your watchlist is empty</p>
            <p className="text-xs mb-5 text-zinc-600 leading-relaxed max-w-xs">
              Bookmark trends from the dashboard to track their velocity over time.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 ring-1 ring-zinc-700 transition-colors"
            >
              Browse trends
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          <TrendList
            trends={watchlistTrends}
            isLoading={isLoading}
            emptyMessage="Watchlisted trends not found — they may have been removed."
          />
        </div>
      )}
    </div>
  );
}
