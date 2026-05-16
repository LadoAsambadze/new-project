'use client'

import { useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { EventCard } from '@/components/events/event-card'
import { FEATURED_EVENTS_QUERY } from '@/graphql/events/queries'
import type { EventType } from '@/graphql/events/types'

interface FeaturedEventsData {
  featuredEvents: EventType[]
}

export function FeaturedEventsSection() {
  const t = useTranslations('discover')
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data, loading } = useQuery<FeaturedEventsData>(FEATURED_EVENTS_QUERY, {
    variables: { limit: 6 },
    fetchPolicy: 'cache-and-network',
  })

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 320
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const events = data?.featuredEvents ?? []

  if (!loading && events.length === 0) return null

  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <h2 className="text-xl font-bold">{t('featured')}</h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && events.length === 0 ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72 h-56 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
        >
          {events.map((event) => (
            <div key={event.id} className="flex-shrink-0 w-72 relative">
              <span className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                <Star className="h-3 w-3 fill-white" />
                Featured
              </span>
              <EventCard event={event} onClick={() => router.push(`/events/${event.id}`)} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
