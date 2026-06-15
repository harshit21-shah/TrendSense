import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '../../lib/cn';

interface TVSBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreTier(score: number) {
  if (score >= 85) return { ring: 'ring-emerald-500/25', bg: 'bg-emerald-500/10', text: 'text-emerald-400' };
  if (score >= 70) return { ring: 'ring-amber-500/25', bg: 'bg-amber-500/10', text: 'text-amber-400' };
  if (score >= 50) return { ring: 'ring-violet-500/25', bg: 'bg-violet-500/10', text: 'text-violet-400' };
  return { ring: 'ring-zinc-700/40', bg: 'bg-zinc-800/60', text: 'text-zinc-500' };
}

export function TVSBadge({ score, size = 'md' }: TVSBadgeProps) {
  // Cap display at 100 — old data sometimes has scores > 100
  const display = Math.min(100, Math.round(score));
  const { ring, bg, text } = getScoreTier(display);

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center shrink-0 rounded-md font-mono font-bold tabular-nums ring-1',
        bg, text, ring,
        size === 'sm' && 'text-[11px] w-8 h-5',
        size === 'md' && 'text-xs w-9 h-6',
        size === 'lg' && 'text-sm w-11 h-7',
      )}
    >
      {display}
    </span>
  );
}

interface DeltaBadgeProps {
  delta: number;
}

export function DeltaBadge({ delta }: DeltaBadgeProps) {
  if (delta == null || delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-mono text-zinc-700 tabular-nums w-14 justify-end">
        <Minus className="h-2.5 w-2.5" />
        <span>0.0</span>
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-mono tabular-nums w-14 justify-end font-medium',
        up ? 'text-emerald-400' : 'text-rose-400',
      )}
    >
      {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      <span>{up ? '+' : ''}{delta.toFixed(1)}</span>
    </span>
  );
}
