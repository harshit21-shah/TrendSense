import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TrendingUp, BarChart2, Layers, Activity, Globe, Info, Filter, Search } from 'lucide-react'
import { useTrends, useDomains } from '../hooks/useTrends'
import { TrendCard } from '../components/TrendCard'
import { TrendCardSkeleton } from '../components/ui/Skeleton'
import { useStore } from '../store/useStore'
import { clsx } from 'clsx'
import type { Trend } from '../types'

function MetricTile({ label, value, trend, icon: Icon }: { label: string; value: string | number; trend?: string; icon: any }) {
  return (
    <div className="bg-[#0c0f16] border border-white/[0.06] p-5 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Icon size={18} className="text-indigo-400" />
        </div>
        {trend && (
          <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
            <TrendingUp size={10} /> {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight tabular-nums">{value}</div>
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">{label}</div>
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
    
    const distMap: Record<string, number> = {}
    t.forEach(x => { distMap[x.domain] = (distMap[x.domain] || 0) + 1 })
    const distribution = Object.entries(distMap).map(([name, value]) => ({ name, value }))
    
    return {
      total: t.length,
      emerging: t.filter(x => x.stage?.toLowerCase() === 'emerging').length,
      rising: t.filter(x => x.stage?.toLowerCase() === 'rising').length,
      avgTvs: Math.round(avgTvs),
      distribution
    }
  }, [trends])


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & High-Level Metrics */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 pulse-dot" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.15em]">Live Intelligence Feed</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">TrendSense v2.0</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
              Strategic Intelligence <span className="text-indigo-400">Dashboard</span>
            </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            Real-time multi-agent analysis of emerging market signals. We aggregate decentralized data streams to surface actionable trends before they hit the mainstream.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full lg:w-auto min-w-[340px]">
          <MetricTile label="Total Signals" value={stats.total} icon={Layers} />
          <MetricTile label="Avg Momentum" value={`${stats.avgTvs}%`} icon={BarChart2} trend="+12%" />
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border-r border-white/10 mr-2 text-slate-500">
            <Filter size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Stages</span>
          </div>
          {['All', 'Emerging', 'Rising', 'Mainstream'].map(s => (
            <button
              key={s}
              onClick={() => setActiveStage(s as any)}
              className={clsx(
                "px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 uppercase tracking-wider whitespace-nowrap",
                activeStage === s 
                  ? "bg-white text-black shadow-lg" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Search size={14} />
            </div>
            <input 
              type="text"
              placeholder="Search intelligence..."
              className="bg-[#0c0f16] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-[11px] font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors w-[220px]"
              value={searchQuery}
              onChange={(e) => useStore.getState().setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pl-4 border-l border-white/10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Domain:</span>
            <select 
              value={activeDomain}
              onChange={(e) => setActiveDomain(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-indigo-400 uppercase tracking-widest focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#0c0f16]">All Domains</option>
              {domains.map(d => <option key={d} value={d} className="bg-[#0c0f16]">{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <TrendCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0c0f16] border border-white/[0.04] py-24 text-center rounded-2xl">
          <Info size={32} className="mx-auto text-slate-700 mb-4" />
          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">No signals detected</h3>
          <p className="text-slate-600 text-[11px] mt-1">Try adjusting your filters or refining your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Footer Meta */}
      <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Global Monitoring: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Agents Online: 12</span>
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
          © 2024 TrendSense Intelligence System
        </div>
      </div>
    </div>
  )
}
