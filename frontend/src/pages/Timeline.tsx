import { useState } from 'react'
import { Search, X, TrendingUp } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
import { useTimeline } from '../hooks/useTrends'
import { format } from 'date-fns'

const COLORS = ['#6366f1', '#f97316', '#10b981', '#f43f5e']
const STAGE_THRESHOLDS = [
  { y: 40, label: 'Rising →', color: '#f97316' },
  { y: 70, label: 'Mainstream →', color: '#a855f7' },
]

function TopicLine({ topic, color, onRemove }: { topic: string; color: string; onRemove: () => void }) {
  const { data, isLoading, isError } = useTimeline(topic)

  return (
    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-sm text-slate-300 font-medium">{topic}</span>
      {isLoading && <span className="text-xs text-slate-600 ml-1">loading...</span>}
      {isError && <span className="text-xs text-red-500 ml-1">error</span>}
      {data && <span className="text-xs text-slate-600 ml-1">{data.data_points?.length ?? 0} pts</span>}
      <button onClick={onRemove} className="ml-auto text-slate-600 hover:text-red-400 transition-colors">
        <X size={12} />
      </button>
    </div>
  )
}

function useMultiTimeline(topics: string[]) {
  const results = topics.map((t) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useTimeline(t)
    return { topic: t, points: data?.data_points ?? [] }
  })

  // Merge all dates
  const allDates = [...new Set(results.flatMap((r) => r.points.map((p: { date: string }) => p.date)))].sort()

  const merged = allDates.map((date) => {
    const row: Record<string, string | number> = { date }
    results.forEach(({ topic, points }) => {
      const pt = points.find((p: { date: string; score: number }) => p.date === date)
      if (pt) row[topic] = pt.score
    })
    return row
  })

  return merged
}

export function Timeline() {
  const [input, setInput] = useState('')
  const [topics, setTopics] = useState<string[]>([])

  const addTopic = () => {
    const t = input.trim()
    if (t && !topics.includes(t) && topics.length < 4) {
      setTopics([...topics, t])
      setInput('')
    }
  }

  const chartData = useMultiTimeline(topics)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Trend Timeline</h1>
        <p className="text-slate-500 text-sm">Compare topic velocity over time — up to 4 topics</p>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTopic()}
            placeholder="Enter a topic (e.g. AI agents, DeFi, GLP-1)..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
        <button
          onClick={addTopic}
          disabled={!input.trim() || topics.length >= 4}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          Add
        </button>
      </div>

      {/* Topic chips */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {topics.map((t, i) => (
            <TopicLine key={t} topic={t} color={COLORS[i]} onRemove={() => setTopics(topics.filter((x) => x !== t))} />
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="bg-[#0d1117] border border-white/[0.06] rounded-2xl p-6">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <TrendingUp size={40} className="text-slate-700 mb-4" />
            <p className="text-slate-600 mb-1">Add a topic to see its velocity timeline</p>
            <p className="text-slate-700 text-sm">Try "AI agents", "quantum computing", or "GLP-1"</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#475569', fontSize: 11 }}
                  tickFormatter={(v) => { try { return format(new Date(v), 'MMM d') } catch { return v } }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                {STAGE_THRESHOLDS.map(({ y, label, color }) => (
                  <ReferenceLine key={y} y={y} stroke={color} strokeDasharray="4 4" strokeOpacity={0.4}
                    label={{ value: label, fill: color, fontSize: 10, position: 'insideTopRight' }}
                  />
                ))}
                <Tooltip
                  contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: '#64748b' }}
                  labelFormatter={(v) => { try { return format(new Date(v), 'MMM d, yyyy') } catch { return v } }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 16 }} />
                {topics.map((t, i) => (
                  <Line
                    key={t}
                    type="monotone"
                    dataKey={t}
                    stroke={COLORS[i]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            {/* Stage legend */}
            <div className="flex gap-4 mt-4 justify-center">
              {[
                { label: 'Emerging', color: 'bg-blue-500', range: '0–40' },
                { label: 'Rising', color: 'bg-orange-500', range: '41–70' },
                { label: 'Mainstream', color: 'bg-purple-500', range: '71–100' },
              ].map(({ label, color, range }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  {label} <span className="text-slate-700">({range})</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
