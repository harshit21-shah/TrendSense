import { clsx } from 'clsx'

const getColor = (score: number) => {
  if (score < 40) return 'from-blue-500 to-cyan-400'
  if (score < 70) return 'from-orange-500 to-yellow-400'
  return 'from-purple-500 to-pink-400'
}

export const TVSBar = ({ score }: { score: number }) => {
  const pct = Math.min(Math.max(score, 0), 100)
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">TVS</span>
        <span className="text-sm font-bold text-white">{Math.round(pct)}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-700', getColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
