import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  ExternalLink, Briefcase, Lightbulb, ShieldAlert, Bookmark, BookmarkCheck,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { StageBadge, DomainBadge } from './ui/Badge'
import { TVSBar } from './ui/TVSBar'
import { useStore } from '../store/useStore'
import type { Trend } from '../types'

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.5)
    return <span className="inline-flex items-center gap-0.5 text-xs text-slate-500"><Minus size={11} /> 0</span>
  const up = delta > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? '+' : ''}{Math.round(delta)}
    </span>
  )
}

const SECTION = ({ icon, label, color, children }: { icon: React.ReactNode; label: string; color: string; children: React.ReactNode }) => (
  <div>
    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-1.5 ${color}`}>
      {icon} {label}
    </div>
    <p className="text-slate-300 text-sm leading-relaxed">{children}</p>
  </div>
)

export function TrendCard({ trend }: { trend: Trend }) {
  const [expanded, setExpanded] = useState(false)
  const { addBookmark, removeBookmark, isBookmarked } = useStore()
  const bookmarked = isBookmarked(trend.id)
  const score = trend.velocity_score ?? trend.tvs_score ?? 0

  const sparkData = trend.velocity_history?.length
    ? trend.velocity_history
    : Array.from({ length: 7 }, (_, i) => ({ date: `d${i}`, score: Math.random() * score * 0.4 + score * 0.6 }))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="group bg-[#0d1117] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 flex flex-col"
    >
      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <StageBadge stage={trend.stage} />
            <DomainBadge domain={trend.domain} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DeltaBadge delta={trend.tvs_delta} />
            <button
              onClick={() => bookmarked ? removeBookmark(trend.id) : addBookmark(trend)}
              className="text-slate-600 hover:text-amber-400 transition-colors"
              title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {bookmarked ? <BookmarkCheck size={15} className="text-amber-400" /> : <Bookmark size={15} />}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-base leading-snug line-clamp-2">{trend.title}</h3>

        {/* Sparkline */}
        <div className="h-12 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <defs>
                <linearGradient id={`spark-${trend.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={1.5} fill={`url(#spark-${trend.id})`} dot={false} />
              <Tooltip
                contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#64748b' }}
                itemStyle={{ color: '#a5b4fc' }}
                formatter={(v: number) => [Math.round(v), 'TVS']}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TVS bar */}
        <TVSBar score={score} />

        {/* Summary */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{trend.summary}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-1">
          {trend.first_seen_at && (
            <span className="flex items-center gap-1 text-[11px] text-slate-600">
              <Clock size={10} />
              {formatDistanceToNow(new Date(trend.first_seen_at), { addSuffix: true })}
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-indigo-400 text-xs font-semibold hover:text-indigo-300 transition-colors ml-auto"
          >
            {expanded ? <><ChevronUp size={13} /> Less</> : <><ChevronDown size={13} /> Intelligence</>}
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-4 border-t border-white/[0.06] bg-white/[0.02] space-y-4">
              <SECTION icon={<Briefcase size={11} />} label="Investment Thesis" color="text-indigo-400">
                {trend.investment_thesis}
              </SECTION>
              <SECTION icon={<Lightbulb size={11} />} label="Product Opportunity" color="text-emerald-400">
                {trend.product_opportunity}
              </SECTION>
              <SECTION icon={<ShieldAlert size={11} />} label="Risk Assessment" color="text-red-400">
                {trend.risk_assessment}
              </SECTION>

              {trend.source_citations?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Sources</div>
                  <div className="flex flex-wrap gap-2">
                    {trend.source_citations.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-lg text-xs text-indigo-400 hover:bg-white/[0.08] transition-colors"
                      >
                        Source {i + 1} <ExternalLink size={9} />
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
