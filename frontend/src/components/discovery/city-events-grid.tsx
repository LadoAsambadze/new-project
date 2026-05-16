'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { EventCard } from '@/components/events/event-card'
import { EVENTS_BY_CITY_QUERY } from '@/graphql/events/queries'
import type { EventFeedResult, EventType } from '@/graphql/events/types'

interface CityEventsGridProps {
  city: string
  category: string
  dateFrom: string
}

interface EventsByCityData {
  eventsByCity: EventFeedResult
}

export function CityEventsGrid({ city, category, dateFrom }: CityEventsGridProps) {
  const t = useTranslations('discover')
  const router = useRouter()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [allItems, setAllItems] = useState<EventType[]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(false)

  const effectiveCity = city || 'Tbilisi'

  const { data, loading, fetchMore } = useQuery<EventsByCityData>(EVENTS_BY_CITY_QUERY, {
    variables: {
      city: effectiveCity,
      category: category || undefined,
      dateFrom: dateFrom || undefined,
      cursor: undefined,
      limit: 12,
    },
    fetchPolicy: 'cache-and-network',
  })

  // Reset when city/category/dateFrom changes
  useEffect(() => {
    setAllItems([])
    setCursor(undefined)
    setHasMore(false)
  }, [city, category, dateFrom])

  useEffect(() => {
    if (data?.eventsByCity) {
      setAllItems(data.eventsByCity.items)
      setCursor(data.eventsByCity.nextCursor)
      setHasMore(data.eventsByCity.hasMore)
    }
  }, [data])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          void fetchMore({
            variables: {
              city: effectiveCity,
              category: category || undefined,
              dateFrom: dateFrom || undefined,
              cursor,
              limit: 12,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev
              const newItems = fetchMoreResult.eventsByCity.items
              setAllItems((p) => [...p, ...newItems])
              setCursor(fetchMoreResult.eventsByCity.nextCursor)
              setHasMore(fetchMoreResult.eventsByCity.hasMore)
              return {
                eventsByCity: {
                  ...fetchMoreResult.eventsByCity,
                  items: [...prev.eventsByCity.items, ...newItems],
                },
              }
            },
          })
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, cursor, effectiveCity, category, dateFrom, fetchMore])

  const displayCity = city || 'Tbilisi'

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">
        {t('eventsIn')} {displayCity}
      </h2>

      {loading && allItems.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">{t('noEventsInCity')}</p>
          <Link
            href="/events"
            className="text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
          >
            {t('browseAll')}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allItems.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => router.push(`/events/${event.id}`)}
              />
            ))}
          </div>
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-8" />
          {loading && allItems.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
