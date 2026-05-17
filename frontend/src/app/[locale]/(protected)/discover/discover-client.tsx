'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CitySelector } from '@/components/discovery/city-selector'
import { FeaturedEventsSection } from '@/components/discovery/featured-events-section'
import { UpcomingEventsSection } from '@/components/discovery/upcoming-events-section'
import { DiscoveryFilters } from '@/components/discovery/discovery-filters'
import { CityEventsGrid } from '@/components/discovery/city-events-grid'

export function DiscoverClient() {
  const t = useTranslations('discover')
  const [selectedCity, setSelectedCity] = useState('Tbilisi')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dateFrom, setDateFrom] = useState('')

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    setSelectedCategory('')
    setDateFrom('')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-4 flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="mb-4 text-3xl font-bold">{t('title')}</h1>
          <CitySelector selectedCity={selectedCity} onCityChange={handleCityChange} />
        </div>

        {/* Featured Events */}
        <FeaturedEventsSection />

        {/* Upcoming Events */}
        <UpcomingEventsSection />

        {/* City Events */}
        <section>
          <div className="mb-4">
            <DiscoveryFilters
              selectedCategory={selectedCategory}
              dateFrom={dateFrom}
              onCategoryChange={setSelectedCategory}
              onDateFromChange={setDateFrom}
            />
          </div>
          <CityEventsGrid
            city={selectedCity}
            category={selectedCategory}
            dateFrom={dateFrom}
          />
        </section>
      </div>
    </div>
  )
}
