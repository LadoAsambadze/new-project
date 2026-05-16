'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const CATEGORIES = [
  { key: 'all', value: '' },
  { key: 'designer', value: 'DESIGNER' },
  { key: 'venue', value: 'VENUE' },
  { key: 'band', value: 'BAND' },
  { key: 'manager', value: 'EVENT_MANAGER' },
] as const

interface ServiceFiltersProps {
  selectedCategory: string
  city: string
  onCategoryChange: (category: string) => void
  onCityChange: (city: string) => void
}

export function ServiceFilters({
  selectedCategory,
  city,
  onCategoryChange,
  onCityChange,
}: ServiceFiltersProps) {
  const t = useTranslations('services')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
              selectedCategory === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {t(cat.key)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 max-w-xs">
        <label className="text-sm text-muted-foreground shrink-0">{t('city')}:</label>
        <Input
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder={t('city')}
          className="h-8 text-sm"
        />
      </div>
    </div>
  )
}
