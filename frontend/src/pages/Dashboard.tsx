import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, BarChart2, Layers, ArrowUpRight } from 'lucide-react'
import { useTrends, useDomains } from '../hooks/useTrends'
import { TrendCard } from '../components/TrendCard'
import { TrendingTicker } from '../components/TrendingTicker'
import { TrendCardSkeleton } from '../components/ui/Skeleton'
import { useStore } from '../store/useStore'
import { clsx } from 'clsx'
import type { Trend } from '../types'

const STAGES = ['All', 'Emerging', 'Rising', 'Mainstream']

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="relative rounded-2xl p-4 overflow-hidden group cursor-default"
      style={{ background: '#0c0f1a', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}08, transparent 70%)` }} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
          <div className="text-xs text-slate-600 mt-0.5 font-medium">{label}</div>
          {sub && <div className="text-[10px] mt-1 font-semibold" style={{ color }}>{sub}</div>}
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { activeDomain, activeStage, searchQuery, setActiveDomain, setActiveStage } = useStore()
  const { data: domains = [] } = useDomains()

  const params: Record<string, string> = {}
  if (activeDomain !== 'All') params.domain = activeDomain
  if (activeStage !== 'All') params.stage = activeStage

  const { data: trends = [], isLoading } = useTrends(params)

  const filtered = useMemo(() => {
    if (!searchQuery) return trends as Trend[]
    const q = searchQuery.toLowerCase()
    return (trends as Trend[]).filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.summary?.toLowerCase().includes(q) ||
      t.domain?.toLowerCase().includes(q)
    )
  }, [trends, searchQuery])

  const stats = useMemo(() => {
    const t = trends as Trend[]
    const avgTvs = t.length ? t.reduce((a, b) => a + (b.velocity_score ?? b.tvs_score ?? 0), 0) / t.length : 0
    const topTrend = t[0]
    return {
      total: t.length,
      emerging: t.filter(x => x.stage?.toLowerCase() === 'emerging').length,
      rising: t.filter(x => x.stage?.toLowerCase() === 'rising').length,
      avgTvs: Math.round(avgTvs),
      topScore: topTrend ? Math.round(topTrend.velocity_score ?? topTrend.tvs_score ?? 0) : 0,
    }
  }, [trends])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero header */}
      <div className="mb-8 relative">
        <div className="absolute -top-4 -left-4 w-64 h-64 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              Intelligence Dashboard
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Emerging Signals
          </h1>
          <p className="text-slate-600 text-sm max-w-lg">
            Multi-agent trend detection across Reddit, HackerNews & NewsAPI · Sentiment-adjusted velocity scoring · Updated daily at 4AM IST
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Layers size={16} style={{ color: '#818cf8' }} />} label="Total Trends" value={stats.total}
          sub={`${stats.emerging + stats.rising} active`} color="#6366f1" />
        <StatCard icon={<Zap size={16} style={{ color: '#60a5fa' }} />} label="Emerging" value={stats.emerging}
          sub="New signals" color="#3b82f6" />
        <StatCard icon={<TrendingUp size={16} style={{ color: '#fb923c' }} />} label="Rising" value={stats.rising}
          sub="Accelerating" color="#f97316" />
        <StatCard icon={<BarChart2 size={16} style={{ color: '#c084fc' }} />} label="Avg TVS" value={stats.avgTvs}
          sub={`Peak: ${stats.topScore}`} color="#a855f7" />
      </div>

      {/* Ticker */}
      {!isLoading && filtered.length > 0 && <TrendingTicker trends={filtered} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Domain tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {['All', ...domains].map(d => (
            <button key={d} onClick={() => setActiveDomain(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={activeDomain === d
                ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {d}
            </button>
          ))}
        </div>

        <div className="w-px bg-white/[0.06] hidden sm:block" />

        {/* Stage pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STAGES.map(s => (
            <button key={s} onClick={() => setActiveStage(s)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200"
              style={activeStage === s
                ? { background: 'rgba(255,255,255,0.1)', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.15)' }
                : { background: 'transparent', color: '#475569', border: '1px solid rgba(255,255,255,0.05)' }
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* Result count */}
        {!isLoading && (
          <div className="ml-auto flex items-center gap-1 text-xs text-slate-700 shrink-0">
            <ArrowUpRight size={11} />
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <TrendCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.06)' }}>
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-600 mb-1 font-medium">No trends match these filters</p>
          <p className="text-slate-700 text-sm">Try adjusting your domain or stage filter</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((trend, i) => (
              <motion.div key={trend.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}>
                <TrendCard trend={trend} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
