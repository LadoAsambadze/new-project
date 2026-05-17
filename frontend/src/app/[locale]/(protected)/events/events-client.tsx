'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { Plus, MapPin } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter, Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { EventGrid } from '@/components/events/event-grid'
import { EventFilters } from '@/components/events/event-filters'
import { CreateEventForm } from '@/components/events/create-event-form'
import { EVENTS_QUERY } from '@/graphql/events/queries'
import type { EventFeedResult, EventType } from '@/graphql/events/types'

interface EventsData {
  events: EventFeedResult
}

export function EventsClient() {
  const t = useTranslations('events')
  const { user } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [city, setCity] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [allItems, setAllItems] = useState<EventType[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const { data, loading, fetchMore } = useQuery<EventsData>(EVENTS_QUERY, {
    variables: {
      category: selectedCategory || undefined,
      city: city || undefined,
      dateFrom: dateFrom || undefined,
      cursor: undefined,
      limit: 12,
    },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => {
    if (data?.events) {
      setAllItems(data.events.items)
      setCursor(data.events.nextCursor)
      setHasMore(data.events.hasMore)
    }
  }, [data])

  const resetFilters = () => {
    setAllItems([])
    setCursor(undefined)
    setHasMore(false)
  }

  const handleLoadMore = () => {
    if (!cursor) return
    void fetchMore({
      variables: {
        category: selectedCategory || undefined,
        city: city || undefined,
        dateFrom: dateFrom || undefined,
        cursor,
        limit: 12,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        const newItems = fetchMoreResult.events.items
        setAllItems((p) => [...p, ...newItems])
        setCursor(fetchMoreResult.events.nextCursor)
        setHasMore(fetchMoreResult.events.hasMore)
        return {
          events: {
            ...fetchMoreResult.events,
            items: [...prev.events.items, ...newItems],
          },
        }
      },
    })
  }

  const handleEventClick = (event: EventType) => {
    router.push(`/events/${event.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-4">
        {/* Discover banner */}
        <Link
          href="/discover"
          className="mb-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10"
        >
          <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">Looking for local events?</p>
            <p className="text-xs text-muted-foreground">Browse events by city in Georgia &rarr; Discover</p>
          </div>
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <Button
            onClick={() => setShowCreate(true)}
            className="hidden md:flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('create')}
          </Button>
        </div>

        <div className="mb-6">
          <EventFilters
            selectedCategory={selectedCategory}
            city={city}
            dateFrom={dateFrom}
            onCategoryChange={(c) => { setSelectedCategory(c); resetFilters() }}
            onCityChange={(c) => { setCity(c); resetFilters() }}
            onDateFromChange={(d) => { setDateFrom(d); resetFilters() }}
          />
        </div>

        {allItems.length === 0 && !loading ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{t('noEvents')}</p>
          </div>
        ) : (
          <>
            <EventGrid
              events={allItems}
              loading={loading && allItems.length === 0}
              onEventClick={handleEventClick}
            />
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors md:hidden"
        aria-label={t('create')}
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Create event modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-bold">{t('create')}</h2>
            <CreateEventForm
              onSuccess={() => {
                setShowCreate(false)
                setAllItems([])
              }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
