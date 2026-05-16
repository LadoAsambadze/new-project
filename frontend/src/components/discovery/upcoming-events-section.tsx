'use client'

import { useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { EventCard } from '@/components/events/event-card'
import { UPCOMING_EVENTS_QUERY } from '@/graphql/events/queries'
import type { EventType } from '@/graphql/events/types'

interface UpcomingEventsData {
  upcomingEvents: EventType[]
}

export function UpcomingEventsSection() {
  const t = useTranslations('discover')
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data, loading } = useQuery<UpcomingEventsData>(UPCOMING_EVENTS_QUERY, {
    variables: { limit: 8 },
    fetchPolicy: 'cache-and-network',
  })

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 320
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const events = data?.upcomingEvents ?? []

  if (!loading && events.length === 0) return null

  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold">{t('upcoming')}</h2>
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
            <div key={event.id} className="flex-shrink-0 w-72">
              <EventCard event={event} onClick={() => router.push(`/events/${event.id}`)} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
