export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(255,255,255,0.04)' }} />
)

export const TrendCardSkeleton = () => (
  <div className="rounded-2xl p-5 space-y-4" style={{ background: '#0c0f1a', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="flex justify-between items-start">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="h-5 w-10" />
    </div>
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-2 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
  </div>
)
