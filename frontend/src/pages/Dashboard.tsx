import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, BarChart2, Layers } from 'lucide-react'
import { useTrends, useDomains } from '../hooks/useTrends'
import { TrendCard } from '../components/TrendCard'
import { TrendingTicker } from '../components/TrendingTicker'
import { TrendCardSkeleton } from '../components/ui/Skeleton'
import { useStore } from '../store/useStore'
import { clsx } from 'clsx'
import type { Trend } from '../types'

const STAGES = ['All', 'Emerging', 'Rising', 'Mainstream']

const STAT = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
  <div className="bg-[#0d1117] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
    <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
      {icon}
    </div>
    <div>
      <div className="text-white font-bold text-xl leading-none">{value}</div>
      <div className="text-slate-500 text-xs mt-0.5">{label}</div>
    </div>
  </div>
)

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
    return (trends as Trend[]).filter(
      (t) => t.title.toLowerCase().includes(q) || t.summary?.toLowerCase().includes(q) || t.domain?.toLowerCase().includes(q)
    )
  }, [trends, searchQuery])

  const stats = useMemo(() => {
    const t = trends as Trend[]
    return {
      total: t.length,
      emerging: t.filter((x) => x.stage?.toLowerCase() === 'emerging').length,
      rising: t.filter((x) => x.stage?.toLowerCase() === 'rising').length,
      avgTvs: t.length ? Math.round(t.reduce((a, b) => a + (b.velocity_score ?? b.tvs_score ?? 0), 0) / t.length) : 0,
    }
  }, [trends])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
          Emerging Intelligence
        </h1>
        <p className="text-slate-500 text-sm">
          Multi-agent trend detection · Sentiment-adjusted velocity scoring · Updated daily
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <STAT icon={<Layers size={16} className="text-indigo-400" />} label="Total Trends" value={stats.total} color="bg-indigo-500/10" />
        <STAT icon={<Zap size={16} className="text-blue-400" />} label="Emerging" value={stats.emerging} color="bg-blue-500/10" />
        <STAT icon={<TrendingUp size={16} className="text-orange-400" />} label="Rising" value={stats.rising} color="bg-orange-500/10" />
        <STAT icon={<BarChart2 size={16} className="text-violet-400" />} label="Avg TVS" value={stats.avgTvs} color="bg-violet-500/10" />
      </div>

      {/* Ticker */}
      {!isLoading && filtered.length > 0 && <TrendingTicker trends={filtered} />}

      {/* Domain tabs */}
      <div className="flex gap-2 flex-wrap mb-3">
        {['All', ...domains].map((d) => (
          <button
            key={d}
            onClick={() => setActiveDomain(d)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
              activeDomain === d
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-indigo-500/30 hover:text-slate-200'
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Stage pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStage(s)}
            className={clsx(
              'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border',
              activeStage === s
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-slate-600 border-white/[0.06] hover:border-white/20 hover:text-slate-400'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <TrendCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/[0.06] rounded-2xl">
          <p className="text-slate-600 mb-2">No trends found.</p>
          <p className="text-slate-700 text-sm">Try adjusting filters or run the pipeline.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
