import { cn } from '../../lib/cn';

// Domain color dots — intentional semantic palette
const DOMAIN_COLORS: Record<string, string> = {
  ai: 'bg-violet-500',
  fintech: 'bg-blue-500',
  health: 'bg-emerald-500',
  biotech: 'bg-teal-500',
  climate: 'bg-green-500',
  crypto: 'bg-amber-500',
  other: 'bg-zinc-500',
};

const DOMAIN_TEXT: Record<string, string> = {
  ai: 'text-violet-400',
  fintech: 'text-blue-400',
  health: 'text-emerald-400',
  biotech: 'text-teal-400',
  climate: 'text-green-400',
  crypto: 'text-amber-400',
  other: 'text-zinc-400',
};

function normalizeDomain(domain: string): string {
  return domain.split('|')[0].trim().toLowerCase();
}

export function getDomainStyle(domain: string, active: boolean): string {
  const key = normalizeDomain(domain);
  const text = DOMAIN_TEXT[key] ?? 'text-zinc-400';
  const dotBg = DOMAIN_COLORS[key] ?? 'bg-zinc-500';
  if (active) {
    return `${text} ring-1 ring-current/30 bg-current/10`;
  }
  return `text-zinc-500 ring-zinc-800 hover:text-zinc-300 hover:bg-zinc-800/60 ${dotBg}`;
}

export function DomainBadge({ domain }: { domain: string }) {
  const key = normalizeDomain(domain);
  const dot = DOMAIN_COLORS[key] ?? 'bg-zinc-500';
  const text = DOMAIN_TEXT[key] ?? 'text-zinc-400';
  // Show only the primary domain (before |)
  const label = domain.split('|')[0].trim();

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium shrink-0', text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
      {label}
    </span>
  );
}

const STAGE_STYLES: Record<string, string> = {
  emerging: 'text-zinc-500',
  rising: 'text-sky-500',
  mainstream: 'text-violet-500',
  fading: 'text-zinc-600',
};

export function StageBadge({ stage }: { stage: string }) {
  const key = (stage ?? '').toLowerCase();
  const color = STAGE_STYLES[key] ?? 'text-zinc-500';
  return (
    <span className={cn('text-[11px] font-medium shrink-0', color)}>
      {stage}
    </span>
  );
}
