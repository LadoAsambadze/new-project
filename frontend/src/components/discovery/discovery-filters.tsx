'use client'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Music', value: 'Music' },
  { label: 'Art', value: 'Art' },
  { label: 'Sport', value: 'Sport' },
  { label: 'Food', value: 'Food' },
  { label: 'Tech', value: 'Tech' },
  { label: 'Other', value: 'Other' },
]

interface DiscoveryFiltersProps {
  selectedCategory: string
  dateFrom: string
  onCategoryChange: (category: string) => void
  onDateFromChange: (date: string) => void
}

export function DiscoveryFilters({
  selectedCategory,
  dateFrom,
  onCategoryChange,
  onDateFromChange,
}: DiscoveryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap',
              selectedCategory === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="h-7 text-xs w-36"
        />
      </div>
    </div>
  )
}
