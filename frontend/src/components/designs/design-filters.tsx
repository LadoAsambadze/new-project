'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const CATEGORIES = ['all', 'wedding', 'birthday', 'corporate', 'party', 'other'] as const
type Category = (typeof CATEGORIES)[number]

interface DesignFiltersProps {
  selected: string
  onChange: (category: string) => void
}

export function DesignFilters({ selected, onChange }: DesignFiltersProps) {
  const t = useTranslations('feed')

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === 'all' ? '' : cat)}
          className={cn(
            'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
            (cat === 'all' && !selected) || selected === cat
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          )}
        >
          {t(cat as Category)}
        </button>
      ))}
    </div>
  )
}
