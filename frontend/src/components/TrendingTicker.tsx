import { motion } from 'framer-motion'
import { TrendingUp, Zap } from 'lucide-react'
import type { Trend } from '../types'

export function TrendingTicker({ trends }: { trends: Trend[] }) {
  if (!trends.length) return null
  const top5 = trends.slice(0, 5)
  // Duplicate for seamless loop
  const items = [...top5, ...top5]

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-[#0d1117] to-indigo-950/60 border border-indigo-500/10 rounded-xl py-2.5 px-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0 text-indigo-400 font-bold text-xs uppercase tracking-widest">
          <Zap size={12} className="text-yellow-400" />
          Live
        </div>
        <div className="overflow-hidden flex-1">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {items.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-sm text-slate-300">
                <TrendingUp size={12} className="text-indigo-400 shrink-0" />
                <span className="font-medium">{t.title}</span>
                <span className="text-indigo-400 font-bold text-xs">{Math.round(t.velocity_score ?? t.tvs_score ?? 0)}</span>
                <span className="text-slate-700">·</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
