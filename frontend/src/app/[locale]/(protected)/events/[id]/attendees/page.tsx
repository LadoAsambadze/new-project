'use client'

import { use } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { AttendeesList } from '@/components/events/attendees-list'
import { EVENT_ATTENDEES_QUERY } from '@/graphql/events/queries'
import type { TicketType } from '@/graphql/events/types'

interface AttendeesData {
  eventAttendees: TicketType[]
}

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default function AttendeesPage({ params }: PageProps) {
  const { id } = use(params)
  const t = useTranslations('events')

  const { data, loading } = useQuery<AttendeesData>(EVENT_ATTENDEES_QUERY, {
    variables: { eventId: id },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4">
        <Link
          href={`/events/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to event
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('attendees')}</h1>
          <div className="text-sm text-muted-foreground">
            {data?.eventAttendees.length ?? 0} attendees
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <AttendeesList tickets={data?.eventAttendees ?? []} />
        )}
      </div>
    </div>
  )
}
