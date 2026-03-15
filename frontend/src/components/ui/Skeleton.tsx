export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
)

export const TrendCardSkeleton = () => (
  <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 space-y-4">
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="h-8 w-12" />
    </div>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
)
