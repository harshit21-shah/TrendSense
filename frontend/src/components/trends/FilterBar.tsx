import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { useDomains, useStages } from '../../hooks/useTrends';
import type { TrendFilters } from '../../types';
import { cn } from '../../lib/cn';

// Canonical domain display order — from config
const CANONICAL_ORDER = ['AI', 'Fintech', 'Health', 'Biotech', 'Climate', 'Crypto'];

const DOMAIN_COLORS: Record<string, string> = {
  ai: 'text-violet-400 bg-violet-500/10 ring-violet-500/25',
  fintech: 'text-blue-400 bg-blue-500/10 ring-blue-500/25',
  health: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/25',
  biotech: 'text-teal-400 bg-teal-500/10 ring-teal-500/25',
  climate: 'text-green-400 bg-green-500/10 ring-green-500/25',
  crypto: 'text-amber-400 bg-amber-500/10 ring-amber-500/25',
};

const TVS_PRESETS = [
  { label: 'All', min: undefined },
  { label: '30+', min: 30 },
  { label: '50+', min: 50 },
  { label: '70+', min: 70 },
  { label: '85+', min: 85 },
];

const TIME_RANGES: { label: string; value: TrendFilters['timeRange'] }[] = [
  { label: 'All', value: undefined },
  { label: '90d', value: '90d' },
  { label: '30d', value: '30d' },
  { label: '7d', value: '7d' },
];

interface FilterBarProps {
  filters: TrendFilters;
  onChange: (f: TrendFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const { data: domainData = [], isLoading: domainsLoading } = useDomains();
  const { data: stageData = [], isLoading: stagesLoading } = useStages();

  // Deduplicate domains: collapse "AI"/"ai"/"AI | Cloud" → "AI", etc.
  const domains = useMemo(() => {
    const accumulated = new Map<string, number>();
    for (const d of domainData) {
      const primary = d.name.split('|')[0].trim();
      const key = primary.toUpperCase() === 'AI' ? 'AI' : primary.charAt(0).toUpperCase() + primary.slice(1).toLowerCase();
      accumulated.set(key, (accumulated.get(key) ?? 0) + d.count);
    }
    // Sort by canonical order first, then by count
    const result = Array.from(accumulated.entries()).map(([name, count]) => ({ name, count }));
    result.sort((a, b) => {
      const ai = CANONICAL_ORDER.indexOf(a.name);
      const bi = CANONICAL_ORDER.indexOf(b.name);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return b.count - a.count;
    });
    return result;
  }, [domainData]);

  // Deduplicate stages (collapse "Emerging"/"emerging")
  const stages = useMemo(() => {
    const accumulated = new Map<string, number>();
    for (const s of stageData) {
      const key = s.name.charAt(0).toUpperCase() + s.name.slice(1).toLowerCase();
      accumulated.set(key, (accumulated.get(key) ?? 0) + s.count);
    }
    const order = ['Emerging', 'Rising', 'Mainstream', 'Fading'];
    return Array.from(accumulated.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        const ai = order.indexOf(a.name);
        const bi = order.indexOf(b.name);
        if (ai !== -1 && bi !== -1) return ai - bi;
        return b.count - a.count;
      });
  }, [stageData]);

  // When filtering, match the canonical name against all its variants
  const toggleDomain = (canonical: string) => {
    const cur = filters.domains ?? [];
    onChange({
      ...filters,
      domains: cur.includes(canonical) ? cur.filter((x) => x !== canonical) : [...cur, canonical],
    });
  };

  const toggleStage = (canonical: string) => {
    const cur = filters.stages ?? [];
    onChange({
      ...filters,
      stages: cur.includes(canonical) ? cur.filter((x) => x !== canonical) : [...cur, canonical],
    });
  };

  const activeCount =
    (filters.domains?.length ?? 0) +
    (filters.stages?.length ?? 0) +
    (filters.tvsMin != null ? 1 : 0) +
    (filters.timeRange ? 1 : 0);

  const isLoading = domainsLoading || stagesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/40 h-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-5 rounded-full bg-zinc-800/60 animate-pulse" style={{ width: `${42 + i * 10}px` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1 px-4 py-2 border-b border-zinc-800/40 bg-zinc-950 min-h-[42px]">
      {/* Domains */}
      {domains.map((d) => {
        const active = filters.domains?.includes(d.name) ?? false;
        const colorKey = d.name.toLowerCase();
        return (
          <button
            key={d.name}
            onClick={() => toggleDomain(d.name)}
            aria-pressed={active}
            className={cn(
              'h-6 px-2.5 rounded-full text-[11px] font-medium ring-1 transition-all',
              active
                ? (DOMAIN_COLORS[colorKey] ?? 'text-zinc-200 bg-zinc-700/60 ring-zinc-600/40')
                : 'text-zinc-600 ring-zinc-800/60 hover:text-zinc-300 hover:ring-zinc-700 hover:bg-zinc-800/40',
            )}
          >
            {d.name}
          </button>
        );
      })}

      {/* Thin divider */}
      {domains.length > 0 && stages.length > 0 && (
        <div className="w-px h-3 bg-zinc-800 shrink-0 mx-1" />
      )}

      {/* Stages */}
      {stages.map((s) => {
        const active = filters.stages?.includes(s.name) ?? false;
        return (
          <button
            key={s.name}
            onClick={() => toggleStage(s.name)}
            aria-pressed={active}
            className={cn(
              'h-6 px-2.5 rounded-full text-[11px] font-medium ring-1 transition-all',
              active
                ? 'text-zinc-200 bg-zinc-700/50 ring-zinc-600/40'
                : 'text-zinc-600 ring-zinc-800/60 hover:text-zinc-300 hover:ring-zinc-700 hover:bg-zinc-800/40',
            )}
          >
            {s.name}
          </button>
        );
      })}

      {/* Thin divider before TVS */}
      {(domains.length > 0 || stages.length > 0) && (
        <div className="w-px h-3 bg-zinc-800 shrink-0 mx-1" />
      )}

      {/* TVS threshold */}
      <div className="flex items-center gap-0.5">
        {TVS_PRESETS.map((p) => {
          const active =
            (p.min == null && filters.tvsMin == null) || filters.tvsMin === p.min;
          return (
            <button
              key={p.label}
              onClick={() => onChange({ ...filters, tvsMin: p.min })}
              aria-pressed={active}
              className={cn(
                'h-6 px-2 rounded text-[11px] font-medium transition-all',
                active ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50',
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Time range — pushed to right */}
      <div className="flex items-center gap-0.5 ml-auto">
        {TIME_RANGES.map((r) => {
          const active = r.value === filters.timeRange || (r.value == null && filters.timeRange == null);
          return (
            <button
              key={r.label}
              onClick={() => onChange({ ...filters, timeRange: r.value })}
              aria-pressed={active}
              className={cn(
                'h-6 px-2 rounded text-[11px] font-medium transition-all',
                active ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50',
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Clear — only when filters are active */}
      {activeCount > 0 && (
        <button
          onClick={() => onChange({})}
          className="flex items-center gap-1 h-6 px-2 rounded text-[11px] text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          Clear
          <span className="bg-zinc-800 text-zinc-400 text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
            {activeCount}
          </span>
        </button>
      )}
    </div>
  );
}
