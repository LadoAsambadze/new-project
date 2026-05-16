export function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-12" />
        </div>
        <div className="h-4 bg-muted rounded w-24" />
      </div>
    </div>
  )
}
