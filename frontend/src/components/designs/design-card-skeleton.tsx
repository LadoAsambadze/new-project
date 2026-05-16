export function DesignCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-muted" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="flex gap-2">
            <div className="h-5 w-10 bg-muted rounded" />
            <div className="h-5 w-8 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
