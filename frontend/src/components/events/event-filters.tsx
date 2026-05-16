'use client'

import { useTranslations } from 'next-intl'
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

interface EventFiltersProps {
  selectedCategory: string
  city: string
  dateFrom: string
  onCategoryChange: (category: string) => void
  onCityChange: (city: string) => void
  onDateFromChange: (date: string) => void
}

export function EventFilters({
  selectedCategory,
  city,
  dateFrom,
  onCategoryChange,
  onCityChange,
  onDateFromChange,
}: EventFiltersProps) {
  const t = useTranslations('events')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
              selectedCategory === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground shrink-0">{t('category')}:</label>
          <Input
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder={t('address')}
            className="h-8 text-sm w-32"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground shrink-0">{t('date')}:</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-8 text-sm w-40"
          />
        </div>
      </div>
    </div>
  )
}
