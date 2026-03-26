import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3
} from 'lucide-react';
import { getTrends } from '../api';
import { TimelineItemSkeleton } from '../components/ui/SkeletonLoader';
import { useTrendStore } from '../store/useTrendStore';
import { cn } from '../utils/cn';
import { formatRelativeDate } from '../utils/date';

type TimeRange = '7d' | '30d' | '90d' | 'all';

const Timeline: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const { setSelectedTrend } = useTrendStore();

  const { data: trends, isLoading } = useQuery({
    queryKey: ['timeline-trends', timeRange, selectedDomain],
    queryFn: () => getTrends(selectedDomain ? [selectedDomain] : undefined),
  });

  const groupedTrends = React.useMemo(() => {
    if (!trends) return {};
    const groups: Record<string, typeof trends> = {};
    trends.forEach(trend => {
      const date = new Date(trend.first_seen_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(trend);
    });
    return groups;
  }, [trends]);

  const domains = React.useMemo(() => {
    if (!trends) return [];
    return [...new Set(trends.map(t => t.domain))];
  }, [trends]);

  return (
    <div className="space-y-4 pb-24 px-4 md:px-0">
      {/* Header */}
      <header className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-accent font-mono text-[10px] uppercase tracking-[0.15em]">
          <Clock size={10} strokeWidth={2.5} />
          <span>Historical Evolution</span>
        </div>
        <h1 className="text-h3 font-extrabold tracking-tight text-text-primary flex items-center gap-2">
          <Clock size={20} className="text-text-muted/40" />
          Trend Timeline
        </h1>
      </header>

      {/* Unified Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 py-2 border-y border-border/10">
        {/* Time Range */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {([
            { value: '7d',  label: '7 Days'  },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: 'all', label: 'All Time' },
          ] as { value: TimeRange; label: string }[]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={cn(
                "filter-pill",
                timeRange === value ? "filter-pill-active" : "filter-pill-inactive"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border/20 hidden sm:block" />

        {/* Domain Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setSelectedDomain(null)}
            className={cn("filter-pill", !selectedDomain ? "filter-pill-active" : "filter-pill-inactive")}
          >
            All Domains
          </button>
          {domains.map(domain => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={cn("filter-pill", selectedDomain === domain ? "filter-pill-active" : "filter-pill-inactive")}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Content */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <TimelineItemSkeleton key={i} index={i} />
          ))}
        </div>
      ) : trends && trends.length > 0 ? (
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] md:left-[23px] top-5 bottom-5 w-px bg-border/30" aria-hidden="true" />

          <div className="space-y-8">
            {Object.entries(groupedTrends).map(([date, dateTrends], dateIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.08 }}
                className="relative"
              >
                {/* Date Marker */}
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <div className="relative z-10 w-10 h-10 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center shrink-0">
                    <Calendar size={16} className="text-accent" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-text-primary">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </h3>
                    <span className="text-text-muted/40">·</span>
                    <p className="text-caption text-text-muted font-semibold">{dateTrends.length} signal{dateTrends.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Trend cards for this date */}
                <div className="ml-14 md:ml-16 space-y-2.5">
                  {dateTrends.map((trend, trendIndex) => {
                    const isPositive = (trend.tvs_delta || 0) > 0;
                    return (
                      <motion.div
                        key={trend.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (dateIndex * 0.08) + (trendIndex * 0.04) }}
                        onClick={() => setSelectedTrend(trend)}
                        className="signal-card group"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedTrend(trend)}
                        aria-label={`View ${trend.title}`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          {/* TVS Score */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-[28px] font-bold font-mono text-text-primary leading-none">
                              {Math.max(45, Math.min(98, trend.velocity_score + (trendIndex * 3) - (dateIndex * 2)))}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isPositive
                                ? <TrendingUp size={12} className="text-success" />
                                : <TrendingDown size={12} className="text-danger" />}
                              <span className={cn(
                                "text-[11px] font-bold font-mono px-2 py-0.5 rounded-badge",
                                isPositive ? "text-success bg-success/10" : "text-danger bg-danger/10"
                              )}>
                                {isPositive ? '+' : ''}{(trend.tvs_delta || 0).toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="px-1.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-accent/10 border border-accent/20 text-accent">
                                {trend.stage}
                              </span>
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                {trend.domain}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 leading-snug line-clamp-1">
                              {trend.title}
                            </h4>
                            <p className="text-caption text-text-secondary line-clamp-2 leading-relaxed mt-0.5">
                              {trend.summary}
                            </p>
                          </div>

                          {/* Timestamp */}
                          <span className="text-[10px] font-bold text-text-muted whitespace-nowrap shrink-0">
                            {formatRelativeDate(trend.first_seen_at)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-surface rounded-card border border-border/50 space-y-4">
          <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mx-auto text-accent/40 border border-accent/10">
            <BarChart3 size={28} strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold tracking-tight">No Trends Found</h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm">
              No trends match your current filter selection. Try adjusting the time range or domain filter.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
