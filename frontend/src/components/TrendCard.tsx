import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ChevronDown, ExternalLink, Briefcase, Lightbulb, ShieldAlert, Bookmark, BookmarkCheck, Clock, ArrowUpRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { StageBadge, DomainBadge } from './ui/Badge'
import { TVSBar } from './ui/TVSBar'
import { useStore } from '../store/useStore'
import type { Trend } from '../types'

function Delta({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.5) return <span className="text-[11px] text-slate-600 flex items-center gap-0.5"><Minus size={10} />0</span>
  const up = delta > 0
  return (
    <span className={`text-[11px] font-bold flex items-center gap-0.5 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? '+' : ''}{Math.round(delta)}
    </span>
  )
}

export function TrendCard({ trend }: { trend: Trend }) {
  const [expanded, setExpanded] = useState(false)
  const { addBookmark, removeBookmark, isBookmarked } = useStore()
  const bookmarked = isBookmarked(trend.id)
  const score = trend.velocity_score ?? trend.tvs_score ?? 0

  const sparkData = useMemo(() =>
    trend.velocity_history?.length
      ? trend.velocity_history
      : Array.from({ length: 10 }, (_, i) => ({
          date: `d${i}`,
          score: Math.max(5, score * (0.5 + (i / 10) * 0.5) + (Math.random() - 0.4) * 10),
        })),
    [trend.velocity_history, score]
  )

  const strokeColor = score >= 70 ? '#a855f7' : score >= 40 ? '#f97316' : '#3b82f6'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, #0d1117 0%, #0a0d14 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.11)')}
      onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)')}
    >
      {/* Top accent line based on stage */}
      <div className="h-px w-full" style={{
        background: score >= 70
          ? 'linear-gradient(90deg, transparent, #a855f7, transparent)'
          : score >= 40
          ? 'linear-gradient(90deg, transparent, #f97316, transparent)'
          : 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
        opacity: 0.6,
      }} />

      <div className="p-5 flex-1 flex flex-col gap-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <StageBadge stage={trend.stage} />
            <DomainBadge domain={trend.domain} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Delta delta={trend.tvs_delta} />
            <button
              onClick={() => bookmarked ? removeBookmark(trend.id) : addBookmark(trend)}
              className="transition-all duration-200 hover:scale-110"
              title={bookmarked ? 'Remove' : 'Save'}
            >
              {bookmarked
                ? <BookmarkCheck size={14} style={{ color: '#fbbf24' }} />
                : <Bookmark size={14} className="text-slate-700 hover:text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-slate-100 transition-colors">
          {trend.title}
        </h3>

        {/* Sparkline */}
        <div className="h-14 -mx-1 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <defs>
                <linearGradient id={`g-${trend.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="score" stroke={strokeColor} strokeWidth={1.5}
                fill={`url(#g-${trend.id})`} dot={false} />
              <Tooltip
                contentStyle={{ background: '#1e2433', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11, padding: '4px 8px' }}
                labelStyle={{ display: 'none' }}
                itemStyle={{ color: strokeColor }}
                formatter={(v: number) => [Math.round(v), 'TVS']}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TVS bar */}
        <TVSBar score={score} />

        {/* Summary */}
        <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-3">{trend.summary}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-1">
          {trend.first_seen_at && (
            <span className="flex items-center gap-1 text-[11px] text-slate-700">
              <Clock size={10} />
              {formatDistanceToNow(new Date(trend.first_seen_at), { addSuffix: true })}
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] font-semibold transition-colors ml-auto"
            style={{ color: expanded ? '#818cf8' : '#475569' }}
          >
            {expanded ? 'Collapse' : 'View Intelligence'}
            <ChevronDown size={12} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded intelligence panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-4 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
              {[
                { icon: <Briefcase size={11} />, label: 'Investment Thesis', color: '#818cf8', text: trend.investment_thesis },
                { icon: <Lightbulb size={11} />, label: 'Product Opportunity', color: '#34d399', text: trend.product_opportunity },
                { icon: <ShieldAlert size={11} />, label: 'Risk Assessment', color: '#f87171', text: trend.risk_assessment },
              ].map(({ icon, label, color, text }) => text && (
                <div key={label}>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color }}>
                    {icon} {label}
                  </div>
                  <p className="text-slate-400 text-[13px] leading-relaxed">{text}</p>
                </div>
              ))}

              {trend.source_citations?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">Sources</div>
                  <div className="flex flex-wrap gap-1.5">
                    {trend.source_citations.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all"
                        style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                      >
                        Source {i + 1} <ArrowUpRight size={9} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
