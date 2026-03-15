import { type ReactNode } from 'react'
import { clsx } from 'clsx'

const STAGE_STYLES: Record<string, string> = {
  emerging: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  rising: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  mainstream: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
}

const DOMAIN_STYLES: Record<string, string> = {
  AI: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  Fintech: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Health: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  Crypto: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  Climate: 'bg-green-500/10 text-green-400 border border-green-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
}

export const StageBadge = ({ stage }: { stage: string }) => (
  <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest', STAGE_STYLES[stage?.toLowerCase()] ?? STAGE_STYLES.emerging)}>
    {stage}
  </span>
)

export const DomainBadge = ({ domain }: { domain: string }) => (
  <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider', DOMAIN_STYLES[domain] ?? DOMAIN_STYLES.Other)}>
    {domain}
  </span>
)

export const Badge = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', className)}>{children}</span>
)
