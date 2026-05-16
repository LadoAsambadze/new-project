'use client'

import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { TicketCard } from '@/components/events/ticket-card'
import { MY_TICKETS_QUERY } from '@/graphql/events/queries'
import type { TicketType } from '@/graphql/events/types'

interface MyTicketsData {
  myTickets: TicketType[]
}

export default function TicketsPage() {
  const t = useTranslations('events')

  const { data, loading } = useQuery<MyTicketsData>(MY_TICKETS_QUERY, {
    fetchPolicy: 'cache-and-network',
  })

  const tickets = data?.myTickets ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('myTickets')}</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{t('noTickets')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
