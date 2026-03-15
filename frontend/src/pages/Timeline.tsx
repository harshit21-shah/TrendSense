import { useState } from 'react'
import { Search, X, TrendingUp, Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { useTimeline } from '../hooks/useTrends'
import { format } from 'date-fns'

const COLORS = ['#6366f1', '#f97316', '#10b981', '#f43f5e']
const PRESETS = ['AI agents', 'DeFi', 'GLP-1', 'Quantum computing']

function useMultiTimeline(topics: string[]) {
  const results = topics.map(t => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useTimeline(t)
    return { topic: t, points: (data?.data_points ?? []) as { date: string; score: number }[] }
  })
  const allDates = [...new Set(results.flatMap(r => r.points.map(p => p.date)))].sort()
  return allDates.map(date => {
    const row: Record<string, string | number> = { date }
    results.forEach(({ topic, points }) => {
      const pt = points.find(p => p.date === date)
      if (pt) row[topic] = pt.score
    })
    return row
  })
}

function TopicChip({ topic, color, onRemove }: { topic: string; color: string; onRemove: () => void }) {
  const { isLoading, isError } = useTimeline(topic)
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-slate-300 font-medium">{topic}</span>
      {isLoading && <span className="text-[10px] text-slate-700">loading...</span>}
      {isError && <span className="text-[10px] text-red-500">no data</span>}
      <button onClick={onRemove} className="ml-1 text-slate-700 hover:text-red-400 transition-colors">
        <X size={12} />
      </button>
    </div>
  )
}

export function Timeline() {
  const [input, setInput] = useState('')
  const [topics, setTopics] = useState<string[]>([])

  const addTopic = (t?: string) => {
    const val = (t ?? input).trim()
    if (val && !topics.includes(val) && topics.length < 4) {
      setTopics(prev => [...prev, val])
      setInput('')
    }
  }

  const chartData = useMultiTimeline(topics)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Trend Timeline</h1>
        <p className="text-slate-600 text-sm">Compare topic velocity over time · Up to 4 topics · 14-day window</p>
      </div>

      {/* Input row */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTopic()}
            placeholder="Enter a topic (e.g. AI agents, DeFi, GLP-1)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-300 placeholder-slate-700 focus:outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          />
        </div>
        <button onClick={() => addTopic()} disabled={!input.trim() || topics.length >= 4}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Preset suggestions */}
      {topics.length === 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="text-[11px] text-slate-700 self-center">Try:</span>
          {PRESETS.map(p => (
            <button key={p} onClick={() => addTopic(p)}
              className="text-xs px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-300 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Topic chips */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {topics.map((t, i) => (
            <TopicChip key={t} topic={t} color={COLORS[i]} onRemove={() => setTopics(topics.filter(x => x !== t))} />
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl p-6" style={{ background: '#0c0f1a', border: '1px solid rgba(255,255,255,0.06)' }}>
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <TrendingUp size={44} style={{ color: '#1e293b' }} className="mb-4" />
            <p className="text-slate-600 font-medium mb-1">Add a topic to visualize its velocity</p>
            <p className="text-slate-700 text-sm">Compare up to 4 topics side by side</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" tick={{ fill: '#334155', fontSize: 11 }}
                  tickFormatter={v => { try { return format(new Date(v), 'MMM d') } catch { return v } }}
                  axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#334155', fontSize: 11 }}
                  axisLine={false} tickLine={false} width={28} />
                <ReferenceLine y={40} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.3}
                  label={{ value: 'Rising', fill: '#f97316', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={70} stroke="#a855f7" strokeDasharray="4 4" strokeOpacity={0.3}
                  label={{ value: 'Mainstream', fill: '#a855f7', fontSize: 10, position: 'insideTopRight' }} />
                <Tooltip
                  contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: '#475569', marginBottom: 4 }}
                  labelFormatter={v => { try { return format(new Date(v), 'MMM d, yyyy') } catch { return v } }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 16 }} />
                {topics.map((t, i) => (
                  <Line key={t} type="monotone" dataKey={t} stroke={COLORS[i]} strokeWidth={2}
                    dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: COLORS[i] }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>

            <div className="flex gap-6 mt-4 justify-center">
              {[{ l: 'Emerging', c: '#3b82f6', r: '0–40' }, { l: 'Rising', c: '#f97316', r: '41–70' }, { l: 'Mainstream', c: '#a855f7', r: '71–100' }].map(({ l, c, r }) => (
                <div key={l} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                  {l} <span className="text-slate-800">({r})</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
