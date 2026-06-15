import { useQuery } from '@tanstack/react-query';
import {
  Play, GitBranch, Newspaper, Radio, MessageCircle,
  Activity, Database, Cpu, AlertCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { getSources } from '../api';
import { usePipelineStatus, useTriggerPipeline } from '../hooks/usePipeline';
import { useHealth } from '../hooks/useHealth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/cn';
import { formatDateTime } from '../lib/utils';

const SOURCE_ICONS: Record<string, ReactNode> = {
  reddit: <MessageCircle className="h-4 w-4" />,
  hackernews: <Activity className="h-4 w-4" />,
  newsapi: <Newspaper className="h-4 w-4" />,
  rss: <Radio className="h-4 w-4" />,
  github: <GitBranch className="h-4 w-4" />,
};

type StatusLevel = 'ok' | 'warn' | 'error' | 'unknown';

function StatusDot({ status }: { status: StatusLevel }) {
  return (
    <span
      className={cn(
        'w-2 h-2 rounded-full shrink-0',
        status === 'ok' && 'bg-emerald-500',
        status === 'warn' && 'bg-amber-500',
        status === 'error' && 'bg-rose-500',
        status === 'unknown' && 'bg-zinc-600',
      )}
    />
  );
}

function HealthCard({
  label, status, note, icon,
}: {
  label: string; status: StatusLevel; note?: string; icon: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-zinc-900 ring-1 ring-zinc-800">
      <div className="flex items-center justify-between">
        <span className="text-zinc-500">{icon}</span>
        <StatusDot status={status} />
      </div>
      <div>
        <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
        <p
          className={cn(
            'text-sm font-semibold capitalize',
            status === 'ok' && 'text-emerald-400',
            status === 'warn' && 'text-amber-400',
            status === 'error' && 'text-rose-400',
            status === 'unknown' && 'text-zinc-500',
          )}
        >
          {note ?? status}
        </p>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-950/30 ring-1 ring-rose-900/50 text-xs text-rose-300">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default function Sources() {
  useDocumentTitle('Sources');
  const { data: health, isLoading: healthLoading, isError: healthError } = useHealth();
  const {
    data: sources,
    isLoading: sourcesLoading,
    isError: sourcesError,
  } = useQuery({
    queryKey: ['sources'],
    queryFn: getSources,
    staleTime: 30_000,
  });
  const { data: pipeline } = usePipelineStatus();
  const trigger = useTriggerPipeline();
  const isRunning = pipeline?.running ?? false;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
      {/* System health */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
          System Health
        </h2>
        {healthError ? (
          <ErrorCard message="Could not reach backend — ensure the FastAPI server is running and VITE_API_URL is correct." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {healthLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[88px] rounded-lg" />
                ))
              : health
                ? (
                  <>
                    <HealthCard label="Database" status={health.db === 'ok' ? 'ok' : 'error'} icon={<Database className="h-4 w-4" />} />
                    <HealthCard label="Vector DB" status={health.chroma === 'ok' ? 'ok' : 'error'} icon={<Activity className="h-4 w-4" />} />
                    <HealthCard label="Groq LLM" status={health.groq_configured ? 'ok' : 'warn'} note={health.groq_configured ? 'Configured' : 'Not set'} icon={<Cpu className="h-4 w-4" />} />
                    <HealthCard label="NewsAPI" status={health.newsapi_configured ? 'ok' : 'warn'} note={health.newsapi_configured ? 'Configured' : 'Not set'} icon={<Newspaper className="h-4 w-4" />} />
                  </>
                )
                : null}
          </div>
        )}
      </section>

      {/* Pipeline */}
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Pipeline</h2>
            {health && (
              <p className="text-xs text-zinc-700 mt-1">
                Auto-runs every {health.scheduler_minutes}m · domains: {health.domains.join(', ')}
              </p>
            )}
          </div>
          <Button
            variant={isRunning ? 'secondary' : 'primary'}
            size="sm"
            loading={isRunning}
            icon={!isRunning ? <Play className="h-4 w-4" /> : undefined}
            onClick={() => trigger.mutate(undefined)}
            disabled={isRunning}
          >
            {isRunning ? 'Running…' : 'Run now'}
          </Button>
        </div>

        <div className="rounded-xl bg-zinc-900 ring-1 ring-zinc-800 p-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <StatusDot
              status={
                isRunning
                  ? 'warn'
                  : pipeline?.last_run?.status === 'completed'
                    ? 'ok'
                    : pipeline?.last_run
                      ? 'error'
                      : 'unknown'
              }
            />
            <span className="text-sm text-zinc-300">
              {isRunning
                ? 'Pipeline is running…'
                : pipeline?.last_run
                  ? `Last run ${pipeline.last_run.status}`
                  : 'No pipeline runs yet'}
            </span>
          </div>

          {pipeline?.last_run && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs border-t border-zinc-800 pt-4">
              <div>
                <p className="text-zinc-600 mb-0.5">Started</p>
                <p className="text-zinc-300 tabular-nums">{formatDateTime(pipeline.last_run.started_at)}</p>
              </div>
              <div>
                <p className="text-zinc-600 mb-0.5">Completed</p>
                <p className="text-zinc-300 tabular-nums">
                  {pipeline.last_run.completed_at ? formatDateTime(pipeline.last_run.completed_at) : '—'}
                </p>
              </div>
              <div>
                <p className="text-zinc-600 mb-0.5">Signals fetched</p>
                <p className="text-zinc-100 font-semibold tabular-nums">{pipeline.last_run.signals_fetched}</p>
              </div>
              <div>
                <p className="text-zinc-600 mb-0.5">Trends saved</p>
                <p className="text-zinc-100 font-semibold tabular-nums">{pipeline.last_run.trends_saved}</p>
              </div>
            </div>
          )}

          {pipeline?.last_result?.errors && pipeline.last_result.errors.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-950/30 ring-1 ring-rose-900">
              <p className="text-xs font-semibold text-rose-400 mb-1.5">
                {pipeline.last_result.errors.length} error{pipeline.last_result.errors.length !== 1 ? 's' : ''}
              </p>
              {pipeline.last_result.errors.map((err, i) => (
                <p key={i} className="text-xs text-rose-400/70 leading-relaxed">{err}</p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Data sources */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Data Sources</h2>
          {sources && <span className="text-xs text-zinc-700">{sources.total_feeds} total feeds</span>}
        </div>

        {sourcesError ? (
          <ErrorCard message="Could not load source information." />
        ) : (
          <div className="space-y-2">
            {sourcesLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-[64px] rounded-lg" />
                ))
              : sources?.sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg bg-zinc-900 ring-1 ring-zinc-800"
                  >
                    <span className="text-zinc-500 shrink-0">
                      {SOURCE_ICONS[source.id] ?? <Activity className="h-4 w-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{source.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-zinc-600 capitalize">{source.type}</span>
                        {source.feed_count > 0 && (
                          <span className="text-xs text-zinc-700">{source.feed_count} feeds</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {source.last_count != null && source.last_count > 0 && (
                        <span className="text-xs text-zinc-600 tabular-nums">
                          {source.last_count} signals
                        </span>
                      )}
                      <StatusDot
                        status={source.requires_key ? (source.configured ? 'ok' : 'warn') : 'ok'}
                      />
                    </div>
                  </div>
                ))}
          </div>
        )}

        {sources?.last_pipeline && (
          <p className="text-xs text-zinc-700 mt-3">
            Last pipeline: {sources.last_pipeline.signals_fetched} signals ·{' '}
            {formatDateTime(sources.last_pipeline.completed_at)}
          </p>
        )}
      </section>
    </div>
  );
}
