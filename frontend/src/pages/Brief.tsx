import ReactMarkdown from 'react-markdown';
import { FileText, Calendar, TrendingUp, Radio, RefreshCw, Play, AlertCircle } from 'lucide-react';
import { useDailyBrief } from '../hooks/useBrief';
import { useTriggerPipeline, usePipelineStatus } from '../hooks/usePipeline';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate } from '../lib/utils';

export default function Brief() {
  useDocumentTitle('Daily Brief');
  const { data: brief, isLoading, isError, refetch, isFetching } = useDailyBrief();
  const trigger = useTriggerPipeline();
  const { data: pipeline } = usePipelineStatus();
  const isRunning = pipeline?.running ?? false;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-3 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="h-7 w-7 text-rose-400" />
        </div>
        <h2 className="text-base font-semibold text-zinc-300 mb-2">Brief unavailable</h2>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          Could not load the daily brief. Make sure the backend is running and the pipeline has been
          executed at least once.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={!isRunning ? <Play className="h-4 w-4" /> : undefined}
            loading={isRunning}
            onClick={() => trigger.mutate(undefined)}
          >
            {isRunning ? 'Running…' : 'Run pipeline'}
          </Button>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800 ring-1 ring-zinc-700 flex items-center justify-center mx-auto mb-5">
          <FileText className="h-7 w-7 text-zinc-500" />
        </div>
        <h2 className="text-base font-semibold text-zinc-300 mb-2">No brief yet</h2>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          Run the intelligence pipeline to generate your first daily brief with AI-synthesized
          trend analysis, investment angles, and domain breakdowns.
        </p>
        <Button
          variant="primary"
          icon={!isRunning ? <Play className="h-4 w-4" /> : undefined}
          loading={isRunning}
          onClick={() => trigger.mutate(undefined)}
        >
          {isRunning ? 'Pipeline running…' : 'Run pipeline'}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Meta bar */}
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-zinc-800/40">
        <div className="flex items-center gap-4 text-[11px] text-zinc-600 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDate(brief.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            {brief.trend_count} trends
          </span>
          {brief.signal_count > 0 && (
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3" />
              {brief.signal_count} signals
            </span>
          )}
          {!brief.generated && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
              Preview — run pipeline for full brief
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />}
          onClick={() => refetch()}
          disabled={isFetching}
          className="shrink-0 text-xs"
        >
          Refresh
        </Button>
      </div>

      {/* Content */}
      <article className="ts-prose">
        <ReactMarkdown>{brief.content}</ReactMarkdown>
      </article>

      {/* CTA when brief is a fallback */}
      {!brief.generated && (
        <div className="mt-12 p-4 rounded-xl bg-zinc-900/60 ring-1 ring-zinc-800/60 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-300">Generate a full AI brief</p>
            <p className="text-xs text-zinc-600 mt-0.5">
              Analyst-quality report with domain breakdowns and investment angles.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            loading={isRunning}
            onClick={() => trigger.mutate(undefined)}
            className="shrink-0"
          >
            Run pipeline
          </Button>
        </div>
      )}
    </div>
  );
}
