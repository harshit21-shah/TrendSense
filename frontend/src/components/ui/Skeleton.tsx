import { cn } from '../../lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-zinc-800/60', className)} />;
}

export function TrendRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 h-11 border-b border-zinc-800/30">
      {/* TVS badge */}
      <Skeleton className="w-8 h-5 rounded-md shrink-0" />
      {/* Title */}
      <Skeleton className="h-3.5 flex-1 max-w-xs" />
      {/* Domain + Stage */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-14" />
      </div>
      {/* Delta */}
      <Skeleton className="h-3 w-12 shrink-0" />
      {/* Sparkline */}
      <Skeleton className="hidden md:block w-16 h-5 rounded shrink-0" />
      {/* Age */}
      <Skeleton className="h-3 w-8 shrink-0" />
      {/* Bookmark */}
      <Skeleton className="w-4 h-4 rounded shrink-0" />
    </div>
  );
}
