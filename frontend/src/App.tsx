import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  TrendingUp, TrendingDown, ShieldAlert, Lightbulb, Briefcase,
  RefreshCw, ChevronDown, ChevronUp, ExternalLink, Minus
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Trend {
  id: number
  title: string
  domain: string
  velocity_score: number
  tvs_delta: number
  stage: string
  summary: string
  investment_thesis: string
  product_opportunity: string
  risk_assessment: string
  historical_accuracy: string
  source_citations: string[]
  first_seen_at: string
}

const STAGE_STYLES: Record<string, string> = {
  emerging: 'bg-blue-100 text-blue-700',
  rising: 'bg-orange-100 text-orange-700',
  mainstream: 'bg-purple-100 text-purple-700',
}

const DOMAIN_COLORS: Record<string, string> = {
  AI: 'bg-violet-100 text-violet-700',
  Fintech: 'bg-emerald-100 text-emerald-700',
  Health: 'bg-rose-100 text-rose-700',
  Crypto: 'bg-yellow-100 text-yellow-700',
  Climate: 'bg-green-100 text-green-700',
  Other: 'bg-gray-100 text-gray-600',
}

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.5) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
        <Minus size={12} /> 0
      </span>
    )
  }
  const isUp = delta > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isUp ? '+' : ''}{Math.round(delta)}
    </span>
  )
}

function TrendCard({ trend }: { trend: Trend }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const stageKey = trend.stage?.toLowerCase() ?? ''
  const domainKey = trend.domain ?? 'Other'

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${STAGE_STYLES[stageKey] ?? 'bg-gray-100 text-gray-700'}`}>
              {trend.stage}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DOMAIN_COLORS[domainKey] ?? DOMAIN_COLORS.Other}`}>
              {trend.domain}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1 text-orange-600 font-bold text-lg">
              <TrendingUp size={16} />
              <span>{Math.round(trend.velocity_score)}</span>
            </div>
            <DeltaBadge delta={trend.tvs_delta} />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{trend.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{trend.summary}</p>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors"
        >
          {isExpanded ? <><span>Less</span> <ChevronUp size={15} /></> : <><span>More Intelligence</span> <ChevronDown size={15} /></>}
        </button>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-3 bg-gray-50 border-t border-gray-100 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1 uppercase tracking-wide">
              <Briefcase size={13} /> Investment Thesis
            </div>
            <p className="text-gray-700 text-sm leading-relaxed italic">"{trend.investment_thesis}"</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-green-700 font-bold text-xs mb-1 uppercase tracking-wide">
              <Lightbulb size={13} /> Product Opportunity
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{trend.product_opportunity}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-red-700 font-bold text-xs mb-1 uppercase tracking-wide">
              <ShieldAlert size={13} /> Risk Assessment
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{trend.risk_assessment}</p>
          </div>
          {trend.source_citations?.length > 0 && (
            <div className="pt-1">
              <div className="text-xs font-bold text-gray-400 uppercase mb-2">Sources</div>
              <div className="flex flex-wrap gap-2">
                {trend.source_citations.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Source {idx + 1} <ExternalLink size={10} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const STAGES = ['All', 'Emerging', 'Rising', 'Mainstream']

function App() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [activeDomain, setActiveDomain] = useState('All')
  const [activeStage, setActiveStage] = useState('All')
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  const fetchDomains = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/domains`)
      setDomains(['All', ...res.data])
    } catch {
      setDomains(['All'])
    }
  }, [])

  const fetchTrends = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (activeDomain !== 'All') params.domain = activeDomain
      if (activeStage !== 'All') params.stage = activeStage
      const res = await axios.get(`${API_URL}/trends`, { params })
      setTrends(res.data)
    } catch (err) {
      console.error('Error fetching trends:', err)
    } finally {
      setLoading(false)
    }
  }, [activeDomain, activeStage])

  const triggerPipeline = async () => {
    setTriggering(true)
    try {
      await axios.post(`${API_URL}/run-pipeline`)
      // Poll until pipeline finishes, then auto-refresh trends
      const poll = setInterval(async () => {
        try {
          const { data } = await axios.get(`${API_URL}/pipeline-status`)
          if (!data.running) {
            clearInterval(poll)
            setTriggering(false)
            fetchTrends()
          }
        } catch {
          clearInterval(poll)
          setTriggering(false)
        }
      }, 3000)
    } catch (err) {
      console.error('Error triggering pipeline:', err)
      setTriggering(false)
    }
  }

  useEffect(() => { fetchDomains() }, [fetchDomains])
  useEffect(() => { fetchTrends() }, [fetchTrends])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">TS</div>
            <h1 className="text-xl font-bold tracking-tight">TrendSense</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTrends}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={triggerPipeline}
              disabled={triggering}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all shadow-sm"
            >
              {triggering ? (
                <><RefreshCw size={15} className="animate-spin" /> Analyzing signals...</>
              ) : (
                'Run Pipeline'
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Emerging Intelligence Brief</h2>
          <p className="text-gray-500 text-base">
            Multi-agent trend detection with sentiment-adjusted velocity scoring.
          </p>
        </header>

        {/* Domain filter tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {domains.map((d: string) => (
            <button
              key={d}
              onClick={() => setActiveDomain(d)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                activeDomain === d
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Stage filter pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {STAGES.map(s => (
            <button
              key={s}
              onClick={() => setActiveStage(s)}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-colors border ${
                activeStage === s
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <RefreshCw size={40} className="animate-spin text-blue-600 mb-4" />
            <p className="text-gray-400 font-medium">Loading emerging trends...</p>
          </div>
        ) : trends.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 mb-3">No trends found for these filters.</p>
            <button onClick={triggerPipeline} className="text-blue-600 font-bold hover:underline text-sm">
              Run the pipeline to gather intelligence.
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trends.map((trend: Trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200 text-center">
        <p className="text-gray-400 text-xs">
          TrendSense — Strategic Trend Intelligence Platform
        </p>
      </footer>
    </div>
  )
}

export default App
