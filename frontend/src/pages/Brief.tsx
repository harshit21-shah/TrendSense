import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { FileText, Download, RefreshCw, Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useBrief } from '../hooks/useTrends'
import { format, parseISO } from 'date-fns'
import { Skeleton } from '../components/ui/Skeleton'

export function Brief() {
  const { data: brief, isLoading, isError, refetch } = useBrief()
  const [offset, setOffset] = useState(0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              Daily Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Morning Brief</h1>
          <p className="text-slate-600 text-sm mt-1">AI-synthesized digest of top 10 emerging trends</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button onClick={() => setOffset(o => o - 1)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-300 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ChevronLeft size={15} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Calendar size={11} />
            {offset === 0 ? 'Today' : offset === -1 ? 'Yesterday' : `${Math.abs(offset)}d ago`}
          </div>
          <button onClick={() => setOffset(o => Math.min(o + 1, 0))} disabled={offset === 0}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-300 transition-colors disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ChevronRight size={15} />
          </button>
          <button onClick={() => refetch()}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-300 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <RefreshCw size={13} />
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 transition-all no-print"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Download size={12} /> Export PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${[0, 3, 7].includes(i) ? 'w-1/3' : i % 2 === 0 ? 'w-full' : 'w-5/6'}`} />
          ))}
        </div>
      ) : isError || !brief ? (
        <div className="text-center py-24 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.06)' }}>
          <FileText size={40} className="mx-auto mb-4" style={{ color: '#1e293b' }} />
          <p className="text-slate-600 font-medium mb-1">No brief available yet</p>
          <p className="text-slate-700 text-sm">Run the pipeline to generate today's intelligence brief</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0c0f1a', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Brief meta header */}
          <div className="px-8 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(99,102,241,0.04)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: '#818cf8' }} />
              <span className="text-white font-semibold text-sm">TrendSense Intelligence Brief</span>
            </div>
            {brief.generated_at && (
              <span className="text-xs text-slate-700">
                {format(parseISO(brief.generated_at), 'MMM d, yyyy · h:mm a')}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="px-8 py-7 prose prose-invert prose-sm max-w-none
            prose-headings:font-bold prose-headings:text-white
            prose-h1:text-xl prose-h1:mb-4
            prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2
            prose-p:text-slate-400 prose-p:leading-relaxed prose-p:my-2
            prose-strong:text-slate-200 prose-strong:font-semibold
            prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
            prose-li:text-slate-400 prose-ul:my-2
            prose-blockquote:border-l-indigo-500 prose-blockquote:text-slate-500 prose-blockquote:not-italic
            prose-code:text-indigo-300 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-hr:border-white/[0.06]">
            <ReactMarkdown>{brief.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
