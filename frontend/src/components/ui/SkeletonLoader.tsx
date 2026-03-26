import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  index?: number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rect',
  style,
}) => {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-surface/60",
        variant === 'circle' && "rounded-full",
        variant === 'text' && "h-4 w-full",
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
};

// Deterministic heights for skeleton sparklines — no hydration mismatch
const SPARK_HEIGHTS = [55, 70, 38, 80, 45, 92, 30, 65, 50, 78, 42, 88];

export const TrendRowSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 bg-surface/40 rounded-[2rem] border border-border/5 animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
      aria-hidden="true"
    >
      <div className="flex-1 flex items-center gap-6">
        {/* Score & sparkline skeleton */}
        <div className="flex flex-col items-center gap-2 min-w-[72px]">
          <Skeleton variant="rect" className="w-10 h-7 rounded-lg" />
          <Skeleton variant="rect" className="w-8 h-3 rounded-full" />
          <div className="flex items-end gap-[1px] h-4 mt-1">
            {SPARK_HEIGHTS.map((h, i) => (
              <Skeleton
                key={i}
                variant="rect"
                className="w-[2px] rounded-full opacity-40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Skeleton variant="rect" className="w-16 h-4 rounded-full" />
            <Skeleton variant="rect" className="w-12 h-4 rounded-full opacity-70" />
            <Skeleton variant="rect" className="w-20 h-4 rounded-full opacity-50" />
          </div>
          <Skeleton variant="text" className="w-1/2 h-5 opacity-80" />
          <Skeleton variant="text" className="w-3/4 h-3.5 opacity-50" />
        </div>
      </div>

      <div className="flex items-center gap-3 pl-6 border-l border-border/10">
        <Skeleton variant="rect" className="w-6 h-6 rounded-xl opacity-20" />
      </div>
    </div>
  );
};

// Chat message skeleton
export const ChatMessageSkeleton: React.FC<{ role?: 'user' | 'assistant' }> = ({ role = 'assistant' }) => {
  return (
    <div
      className={cn(
        "flex gap-6 animate-pulse",
        role === 'user' ? "flex-row-reverse" : ""
      )}
      aria-hidden="true"
    >
      <Skeleton 
        variant="circle" 
        className={cn(
          "w-10 h-10 shrink-0",
          role === 'user' ? "bg-text-primary/20" : "bg-surface-raised"
        )}
      />
      <div className={cn(
        "flex flex-col gap-2 max-w-[85%]",
        role === 'user' ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "p-6 rounded-[2.5rem] space-y-3 w-full",
          role === 'user' 
            ? "bg-surface-raised/60 rounded-tr-none" 
            : "bg-surface/40 rounded-tl-none"
        )}>
          <Skeleton variant="text" className="w-full h-4" />
          <Skeleton variant="text" className="w-4/5 h-4" />
          <Skeleton variant="text" className="w-3/5 h-4" />
        </div>
        <Skeleton variant="rect" className="w-16 h-3 rounded-full opacity-30" />
      </div>
    </div>
  );
};

// Trend drawer skeleton
export const TrendDrawerSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="rect" className="w-20 h-5 rounded-full" />
          <Skeleton variant="rect" className="w-16 h-5 rounded-full opacity-50" />
        </div>
        <Skeleton variant="text" className="w-3/4 h-8" />
      </div>

      {/* Chart skeleton */}
      <div className="rounded-2xl bg-surface/40 border border-border/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="rect" className="w-24 h-4 rounded-full" />
          <Skeleton variant="rect" className="w-32 h-8 rounded-xl" />
        </div>
        <Skeleton variant="rect" className="w-full h-16 rounded-lg" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex items-center gap-2 bg-surface/30 rounded-2xl p-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="flex-1 h-10 rounded-xl" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-5/6 h-4" />
        <Skeleton variant="text" className="w-4/6 h-4" />
        <div className="grid grid-cols-2 gap-3 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Timeline skeleton
export const TimelineItemSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => {
  return (
    <div 
      className="flex gap-6 animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-2">
        <Skeleton variant="circle" className="w-3 h-3" />
        <Skeleton variant="rect" className="w-px h-full min-h-[60px]" />
      </div>
      <div className="flex-1 pb-8 space-y-3">
        <Skeleton variant="rect" className="w-24 h-3 rounded-full opacity-40" />
        <Skeleton variant="text" className="w-2/3 h-5" />
        <Skeleton variant="text" className="w-full h-4 opacity-60" />
        <Skeleton variant="text" className="w-5/6 h-4 opacity-60" />
      </div>
    </div>
  );
};

// Dashboard header skeleton
export const DashboardHeaderSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      <Skeleton variant="rect" className="w-32 h-3 rounded-full" />
      <Skeleton variant="text" className="w-64 h-12" />
      <Skeleton variant="text" className="w-96 h-5 opacity-60" />
    </div>
  );
};

// Dashboard filters skeleton
export const DashboardFiltersSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 py-8 border-y border-border/10 animate-pulse" aria-hidden="true">
      <div className="flex flex-wrap items-center gap-8">
        <Skeleton variant="rect" className="w-24 h-4 rounded-full" />
        <div className="flex items-center gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="w-24 h-10 rounded-full" />
          ))}
        </div>
        <div className="h-6 w-px bg-border/10" />
        <div className="flex items-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="w-20 h-10 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
};
