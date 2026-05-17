'use client'

interface Props {
  label: string
  value: number
}

export function StatsCard({ label, value }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="text-3xl font-bold text-foreground">{value.toLocaleString()}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
