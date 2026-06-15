import { TrendRow } from './TrendRow';
import { TrendRowSkeleton } from '../ui/Skeleton';
import { useAppStore } from '../../store/useAppStore';
import type { Trend } from '../../types';

interface TrendListProps {
  trends?: Trend[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function TrendList({ trends, isLoading, emptyMessage }: TrendListProps) {
  const { selectedTrendId } = useAppStore();

  if (isLoading) {
    return (
      <div className="flex flex-col overflow-y-auto">
        {/* Column header */}
        <div className="flex items-center gap-3 px-4 h-8 border-b border-zinc-800/60 bg-zinc-950/80 sticky top-0 z-10">
          <span className="w-9 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">TVS</span>
          <span className="flex-1 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">Trend</span>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <span className="w-14 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">Domain</span>
            <span className="w-16 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">Stage</span>
          </div>
          <span className="w-14 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold text-right">Δ</span>
          <span className="hidden md:block w-16 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">Velocity</span>
          <span className="w-9 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold text-right">Age</span>
          <span className="w-4" />
        </div>
        <div>
          {Array.from({ length: 12 }).map((_, i) => (
            <TrendRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 py-24 text-center text-zinc-700">
        <p className="text-sm">{emptyMessage ?? 'No trends match the current filters.'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* Sticky column headers */}
      <div className="flex items-center gap-3 px-4 h-8 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-10 shrink-0">
        <span className="w-9 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">TVS</span>
        <span className="flex-1 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">Trend</span>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <span className="w-16 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">Domain</span>
          <span className="w-16 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">Stage</span>
        </div>
        <span className="w-14 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold text-right">Δ Momentum</span>
        <span className="hidden md:block w-16 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">Velocity</span>
        <span className="w-9 text-[10px] text-zinc-700 uppercase tracking-wider font-semibold text-right">Age</span>
        <span className="w-4" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {trends.map((trend) => (
          <TrendRow
            key={trend.id}
            trend={trend}
            isSelected={trend.id === selectedTrendId}
          />
        ))}
      </div>
    </div>
  );
}
