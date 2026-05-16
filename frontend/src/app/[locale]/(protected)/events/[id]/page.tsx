'use client'

import { use } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { Link } from '@/i18n/navigation'
import { EventDetail } from '@/components/events/event-detail'
import { EVENT_QUERY, MY_TICKETS_QUERY } from '@/graphql/events/queries'
import type { EventType, TicketType } from '@/graphql/events/types'

interface EventData {
  event: EventType
}

interface MyTicketsData {
  myTickets: TicketType[]
}

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const t = useTranslations('events')
  const { user } = useAuth()

  const { data, loading } = useQuery<EventData>(EVENT_QUERY, {
    variables: { id },
  })

  const { data: ticketsData } = useQuery<MyTicketsData>(MY_TICKETS_QUERY, {
    skip: !user,
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const event = data?.event
  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Event not found</div>
      </div>
    )
  }

  const hasTicket = ticketsData?.myTickets.some((t) => t.eventId === id) ?? false

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4">
        <Link
          href="/events"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('title')}
        </Link>

        <EventDetail event={event} currentUserId={user?.id} hasTicket={hasTicket} />
      </div>
    </div>
  )
}
