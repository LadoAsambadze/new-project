'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { Users, ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MY_EVENTS_QUERY } from '@/graphql/events/queries'
import { PUBLISH_EVENT_MUTATION } from '@/graphql/events/mutations'
import type { EventType } from '@/graphql/events/types'

interface MyEventsData {
  myEvents: EventType[]
}

interface PublishEventData {
  publishEvent: EventType
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export default function MyEventsPage() {
  const t = useTranslations('events')
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const { data, loading, refetch } = useQuery<MyEventsData>(MY_EVENTS_QUERY, {
    fetchPolicy: 'cache-and-network',
  })

  const [publishEvent] = useMutation<PublishEventData>(PUBLISH_EVENT_MUTATION, {
    onCompleted: () => {
      setPublishingId(null)
      void refetch()
    },
    onError: (err) => {
      setError(err.message)
      setPublishingId(null)
    },
  })

  const handlePublish = (id: string) => {
    setPublishingId(id)
    setError('')
    void publishEvent({ variables: { id } })
  }

  const events = data?.myEvents ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('myEvents')}</h1>
          <Link href="/events">
            <Button variant="outline" size="sm">
              {t('title')}
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{t('noEvents')}</p>
            <Link href="/events">
              <Button>{t('create')}</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex">
                  {event.images[0] && (
                    <div className="w-24 shrink-0 bg-muted">
                      <img
                        src={event.images[0]}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{event.title}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(event.date)} · {event.city}</p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                          event.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'CANCELLED'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-amber-100 text-amber-800',
                        )}
                      >
                        {event.status === 'PUBLISHED'
                          ? t('published')
                          : event.status === 'CANCELLED'
                            ? t('cancelled')
                            : t('draft')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{event.soldTickets} / {event.totalTickets} sold</span>
                      <span>${event.ticketPrice}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {event.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          disabled={publishingId === event.id}
                          onClick={() => handlePublish(event.id)}
                        >
                          {t('publish')}
                        </Button>
                      )}
                      <Link href={`/events/${event.id}/attendees`}>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {t('attendees')}
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
