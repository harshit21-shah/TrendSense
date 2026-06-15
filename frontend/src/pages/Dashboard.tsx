import { useState } from 'react';
import { BarChart2, Zap, TrendingUp, Radio, AlertCircle } from 'lucide-react';
import { useTrends } from '../hooks/useTrends';
import { usePipelineStatus } from '../hooks/usePipeline';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { FilterBar } from '../components/trends/FilterBar';
import { TrendList } from '../components/trends/TrendList';
import type { TrendFilters } from '../types';
import { cn } from '../lib/cn';

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: 'emerald' | 'amber' | 'violet' | 'zinc';
}

function Stat({ icon, label, value, accent = 'zinc' }: StatProps) {
  const accentText = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    violet: 'text-violet-400',
    zinc: 'text-zinc-300',
  }[accent];

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="text-zinc-700 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-zinc-700 uppercase tracking-wider font-semibold leading-none mb-1">{label}</p>
        <p className={cn('text-sm font-semibold tabular-nums leading-none font-mono', accentText)}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle('Trends');
  const [filters, setFilters] = useState<TrendFilters>({});
  const { data: trends, isLoading, isError } = useTrends(filters);
  const { data: pipeline } = usePipelineStatus();

  const total = trends?.length ?? 0;
  const hot = trends?.filter((t) => t.velocity_score >= 70).length ?? 0;
  const avgTVS =
    trends && trends.length > 0
      ? (trends.reduce((acc, t) => acc + Math.min(100, t.velocity_score), 0) / trends.length).toFixed(1)
      : '—';
  const signals = pipeline?.last_run?.signals_fetched ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Stats bar — minimal, inline */}
      <div className="flex items-center gap-6 px-5 h-11 border-b border-zinc-800/40 shrink-0">
        <Stat
          icon={<BarChart2 className="h-3.5 w-3.5" />}
          label="Trends"
          value={isLoading ? '…' : total.toLocaleString()}
          accent={total > 0 ? 'zinc' : 'zinc'}
        />
        <div className="w-px h-3 bg-zinc-800 shrink-0" />
        <Stat
          icon={<Zap className="h-3.5 w-3.5" />}
          label="Hot (70+)"
          value={isLoading ? '…' : hot}
          accent={hot > 0 ? 'amber' : 'zinc'}
        />
        <div className="w-px h-3 bg-zinc-800 shrink-0" />
        <Stat
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Avg TVS"
          value={isLoading ? '…' : avgTVS}
          accent={parseFloat(String(avgTVS)) >= 70 ? 'emerald' : parseFloat(String(avgTVS)) >= 50 ? 'violet' : 'zinc'}
        />
        {signals > 0 && (
          <>
            <div className="w-px h-3 bg-zinc-800 shrink-0" />
            <Stat
              icon={<Radio className="h-3.5 w-3.5" />}
              label="Signals"
              value={signals.toLocaleString()}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex items-center gap-2 mx-4 mt-3 px-3 py-2.5 rounded-lg bg-rose-950/25 ring-1 ring-rose-900/40 text-[12px] text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Could not load trends — check that the backend is running.</span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <TrendList trends={trends} isLoading={isLoading} />
      </div>
    </div>
  );
}
