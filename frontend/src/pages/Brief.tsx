import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { FileText, Download, RefreshCw, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useBrief } from '../hooks/useTrends'
import { format, parseISO } from 'date-fns'
import { Skeleton } from '../components/ui/Skeleton'

export function Brief() {
  const { data: brief, isLoading, isError, refetch } = useBrief()
  const [offset, setOffset] = useState(0) // 0 = today, -1 = yesterday, etc.

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Daily Brief</h1>
          <p className="text-slate-500 text-sm">AI-generated intelligence digest · Top 10 trends</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset(o => o - 1)}
            className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] rounded-lg transition-colors"
            title="Previous day"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-slate-400">
            <Calendar size={12} />
            {offset === 0 ? 'Today' : offset === -1 ? 'Yesterday' : `${Math.abs(offset)} days ago`}
          </div>
          <button
            onClick={() => setOffset(o => Math.min(o + 1, 0))}
            disabled={offset === 0}
            className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] rounded-lg transition-colors disabled:opacity-30"
            title="Next day"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => refetch()}
            className="p-2 text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all print:hidden"
          >
            <Download size={12} /> Export PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className={`h-5 ${i % 3 === 0 ? 'w-1/2' : 'w-full'}`} />)}
        </div>
      ) : isError || !brief ? (
        <div className="text-center py-24 border border-dashed border-white/[0.06] rounded-2xl">
          <FileText size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No brief available yet.</p>
          <p className="text-slate-700 text-sm">Run the pipeline to generate today's intelligence brief.</p>
        </div>
      ) : (
        <div className="bg-[#0d1117] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Brief header */}
          <div className="px-8 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-indigo-400" />
              <span className="text-white font-bold">Intelligence Brief</span>
            </div>
            {brief.generated_at && (
              <span className="text-xs text-slate-600">
                Generated {format(parseISO(brief.generated_at), 'MMM d, yyyy · h:mm a')}
              </span>
            )}
          </div>

          {/* Markdown content */}
          <div className="px-8 py-6 prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h1:text-2xl prose-h2:text-lg prose-h2:text-indigo-400 prose-h2:border-b prose-h2:border-white/[0.06] prose-h2:pb-2
            prose-p:text-slate-400 prose-p:leading-relaxed
            prose-strong:text-slate-200
            prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
            prose-li:text-slate-400
            prose-blockquote:border-indigo-500 prose-blockquote:text-slate-400
            prose-code:text-indigo-300 prose-code:bg-white/[0.06] prose-code:px-1 prose-code:rounded
            print:text-black print:prose-headings:text-black print:prose-p:text-gray-700
          ">
            <ReactMarkdown>{brief.content}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          nav, button, .print\\:hidden { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  )
}
