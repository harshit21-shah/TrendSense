import { clsx } from 'clsx'

const STAGE: Record<string, { bg: string; text: string; dot: string }> = {
  emerging: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', dot: '#3b82f6' },
  rising:   { bg: 'rgba(249,115,22,0.1)', text: '#fb923c', dot: '#f97316' },
  mainstream: { bg: 'rgba(168,85,247,0.1)', text: '#c084fc', dot: '#a855f7' },
}

const DOMAIN: Record<string, { bg: string; text: string }> = {
  AI:      { bg: 'rgba(99,102,241,0.12)', text: '#818cf8' },
  Fintech: { bg: 'rgba(16,185,129,0.12)', text: '#34d399' },
  Health:  { bg: 'rgba(244,63,94,0.12)',  text: '#fb7185' },
  Crypto:  { bg: 'rgba(234,179,8,0.12)',  text: '#facc15' },
  Climate: { bg: 'rgba(34,197,94,0.12)',  text: '#4ade80' },
  Other:   { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8' },
}

export const StageBadge = ({ stage }: { stage: string }) => {
  const s = STAGE[stage?.toLowerCase()] ?? STAGE.emerging
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.dot}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {stage}
    </span>
  )
}

export const DomainBadge = ({ domain }: { domain: string }) => {
  const d = DOMAIN[domain] ?? DOMAIN.Other
  return (
    <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: d.bg, color: d.text }}>
      {domain}
    </span>
  )
}

export const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', className)}>{children}</span>
)
