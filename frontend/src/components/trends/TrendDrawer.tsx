import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, BookmarkCheck, Bookmark, ExternalLink,
  TrendingUp, AlertTriangle, Lightbulb, Award,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ReactNode } from 'react';
import { useTrend } from '../../hooks/useTrends';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { useAppStore } from '../../store/useAppStore';
import { TVSBadge, DeltaBadge } from '../ui/TVSBadge';
import { DomainBadge, StageBadge } from '../ui/Badge';
import { Sparkline } from '../ui/Sparkline';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';
import { formatDateTime } from '../../lib/utils';
import { toTitleCase } from '../../lib/text';

/** The RAG agent sometimes stores historical_accuracy as a JSON string.
 *  Extract the human-readable summary from it, or return the raw string if it's already plain text. */
function parseHistoricalAccuracy(raw: string): string {
  if (!raw) return '';
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    if (obj.refined_summary && typeof obj.refined_summary === 'string') return obj.refined_summary;
    if (obj.summary && typeof obj.summary === 'string') return obj.summary;
    const score = obj.historical_accuracy_score;
    if (typeof score === 'number') return `Accuracy score: ${score}/100`;
  } catch {
    // not JSON — return as-is
  }
  return raw;
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-zinc-900/60 ring-1 ring-zinc-800/50 p-3.5">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-zinc-600 shrink-0">{icon}</span>
        <h3 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="text-sm text-zinc-400 leading-relaxed">{children}</div>
    </div>
  );
}

interface TrendDrawerProps {
  trendId: number;
  onClose: () => void;
}

export function TrendDrawer({ trendId, onClose }: TrendDrawerProps) {
  const { data: trend, isLoading, isError } = useTrend(trendId);
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
  const { drawerOpen } = useAppStore();
  const inWatchlist = trend ? isInWatchlist(trend.id) : false;

  // Escape key closes the drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-20 bg-zinc-950/60"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={trend?.title ?? 'Trend detail'}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-[520px] max-w-[92vw] z-30 bg-[#111113] border-l border-zinc-800/60 shadow-2xl shadow-black/60 flex flex-col"
          >
            {isLoading ? (
              <div className="p-5 space-y-4">
                <Skeleton className="h-7 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-[56px] w-full rounded-lg mt-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-28 w-full rounded-lg mt-4" />
              </div>
            ) : isError ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-600 p-8">
                <p className="text-sm text-zinc-500">Failed to load trend details.</p>
                <button
                  onClick={onClose}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  Close
                </button>
              </div>
            ) : trend ? (
              <>
                {/* Header */}
                <div className="flex items-start gap-3 p-4 border-b border-zinc-800">
                  <TVSBadge score={trend.velocity_score} size="lg" />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h2 className="text-base font-semibold text-zinc-100 leading-snug mb-2.5">
                      {toTitleCase(trend.title)}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <DomainBadge domain={trend.domain} />
                      <StageBadge stage={trend.stage} />
                      <DeltaBadge delta={trend.tvs_delta ?? 0} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => toggleWatchlist(trend.id)}
                      className={cn(
                        'flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium ring-1 transition-colors',
                        inWatchlist
                          ? 'bg-violet-600/20 text-violet-300 ring-violet-500/30 hover:bg-violet-600/30'
                          : 'bg-zinc-800 text-zinc-400 ring-zinc-700 hover:text-zinc-200 hover:bg-zinc-700',
                      )}
                      aria-pressed={inWatchlist}
                    >
                      {inWatchlist ? (
                        <BookmarkCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Bookmark className="h-3.5 w-3.5" />
                      )}
                      {inWatchlist ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
                      aria-label="Close detail panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Sparkline — fills drawer width */}
                {trend.velocity_history && trend.velocity_history.length > 1 && (
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-500 font-medium">Velocity history</span>
                      <span className="text-xs text-zinc-700 tabular-nums">
                        {trend.velocity_history.length} data points
                      </span>
                    </div>
                    <Sparkline
                      data={trend.velocity_history}
                      width={400}
                      height={56}
                      fill
                    />
                  </div>
                )}

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <p className="text-sm text-zinc-300 leading-relaxed">{trend.summary}</p>

                  {trend.investment_thesis && (
                    <Section icon={<TrendingUp className="h-4 w-4" />} title="Investment Thesis">
                      <div className="ts-prose text-sm">
                        <ReactMarkdown>{trend.investment_thesis}</ReactMarkdown>
                      </div>
                    </Section>
                  )}

                  {trend.product_opportunity && (
                    <Section icon={<Lightbulb className="h-4 w-4" />} title="Product Opportunity">
                      <div className="ts-prose text-sm">
                        <ReactMarkdown>{trend.product_opportunity}</ReactMarkdown>
                      </div>
                    </Section>
                  )}

                  {trend.risk_assessment && (
                    <Section icon={<AlertTriangle className="h-4 w-4" />} title="Risk Assessment">
                      <div className="ts-prose text-sm">
                        <ReactMarkdown>{trend.risk_assessment}</ReactMarkdown>
                      </div>
                    </Section>
                  )}

                  {trend.historical_accuracy && (
                    <Section icon={<Award className="h-4 w-4" />} title="Historical Accuracy">
                      <div className="ts-prose text-sm">
                        <ReactMarkdown>{parseHistoricalAccuracy(trend.historical_accuracy)}</ReactMarkdown>
                      </div>
                    </Section>
                  )}

                  {/* Citations */}
                  {trend.source_citations && trend.source_citations.length > 0 && (
                    <div className="pt-1">
                      <h3 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                        Sources ({trend.source_citations.length})
                      </h3>
                      <div className="space-y-1.5">
                        {trend.source_citations.map((cite, i) => {
                          const isUrl = cite.startsWith('http');
                          return (
                            <div key={i} className="text-xs text-zinc-500 flex items-start gap-1.5">
                              <span className="text-zinc-700 shrink-0 mt-px">·</span>
                              {isUrl ? (
                                <a
                                  href={cite}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors break-all"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0 mt-px" />
                                  <span>{cite}</span>
                                </a>
                              ) : (
                                <span className="leading-relaxed">{cite}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer metadata */}
                  <div className="pt-3 border-t border-zinc-800/50 space-y-1 text-xs text-zinc-700">
                    {trend.first_seen_at && <p>First seen: {formatDateTime(trend.first_seen_at)}</p>}
                    {trend.last_updated_at && <p>Updated: {formatDateTime(trend.last_updated_at)}</p>}
                    <p className="text-zinc-800">ID #{trend.id}</p>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
