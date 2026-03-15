const getGradient = (score: number) => {
  if (score < 40) return 'linear-gradient(90deg, #3b82f6, #06b6d4)'
  if (score < 70) return 'linear-gradient(90deg, #f97316, #eab308)'
  return 'linear-gradient(90deg, #a855f7, #ec4899)'
}

const getGlow = (score: number) => {
  if (score < 40) return 'rgba(59,130,246,0.4)'
  if (score < 70) return 'rgba(249,115,22,0.4)'
  return 'rgba(168,85,247,0.4)'
}

export const TVSBar = ({ score }: { score: number }) => {
  const pct = Math.min(Math.max(score, 0), 100)
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Velocity Score</span>
        <span className="text-sm font-bold text-white tabular-nums">{Math.round(pct)}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: getGradient(pct),
            boxShadow: `0 0 8px ${getGlow(pct)}`,
          }}
        />
      </div>
    </div>
  )
}
