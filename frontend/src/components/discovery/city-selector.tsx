'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { GEORGIAN_CITIES } from '@/lib/georgian-cities'

interface CitySelectorProps {
  selectedCity: string
  onCityChange: (city: string) => void
}

// Deduplicate while preserving order
const UNIQUE_CITIES = Array.from(new Set(GEORGIAN_CITIES))

export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const t = useTranslations('discover')

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onCityChange('')}
        className={cn(
          'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
          selectedCity === ''
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        )}
      >
        {t('allCities')}
      </button>
      {UNIQUE_CITIES.map((city) => (
        <button
          key={city}
          onClick={() => onCityChange(city)}
          className={cn(
            'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
            selectedCity === city
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          )}
        >
          {city}
        </button>
      ))}
    </div>
  )
}
