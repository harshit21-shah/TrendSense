import { TrendingUp } from 'lucide-react'
import type { Trend } from '../types'

export function TrendingTicker({ trends }: { trends: Trend[] }) {
  if (!trends.length) return null
  const top = trends.slice(0, 6)
  const items = [...top, ...top]

  return (
    <div className="relative overflow-hidden rounded-xl mb-6 py-2.5 px-4"
      style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#818cf8' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          Trending
        </div>
        <div className="overflow-hidden flex-1 mask-fade-x">
          <div className="ticker-track flex gap-10 whitespace-nowrap">
            {items.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-[13px]">
                <TrendingUp size={11} style={{ color: '#6366f1', flexShrink: 0 }} />
                <span className="text-slate-300 font-medium">{t.title}</span>
                <span className="font-bold tabular-nums text-[11px]" style={{ color: '#818cf8' }}>
                  {Math.round(t.velocity_score ?? t.tvs_score ?? 0)}
                </span>
                <span className="text-slate-800">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
