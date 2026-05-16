'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { MapPin, Calendar, Ticket, User } from 'lucide-react'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { PURCHASE_TICKET_MUTATION } from '@/graphql/events/mutations'
import type { EventType, TicketType } from '@/graphql/events/types'

interface EventDetailProps {
  event: EventType
  currentUserId?: string
  hasTicket?: boolean
}

interface PurchaseTicketData {
  purchaseTicket: TicketType
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function EventDetail({ event, currentUserId, hasTicket }: EventDetailProps) {
  const t = useTranslations('events')
  const [activeImage, setActiveImage] = useState(0)
  const [purchased, setPurchased] = useState(false)
  const [error, setError] = useState('')

  const isOrganizer = currentUserId === event.userId
  const isSoldOut = event.availableTickets <= 0
  const canPurchase = !isOrganizer && !hasTicket && !purchased && !isSoldOut

  const [purchaseTicket, { loading }] = useMutation<PurchaseTicketData>(PURCHASE_TICKET_MUTATION, {
    variables: { eventId: event.id },
    onCompleted: () => setPurchased(true),
    onError: (err) => setError(err.message),
  })

  return (
    <div className="mx-auto max-w-3xl">
      {/* Image gallery */}
      {event.images.length > 0 && (
        <div className="mb-6">
          <div className="aspect-video overflow-hidden rounded-xl bg-muted">
            <img
              src={event.images[activeImage]}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
          {event.images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {event.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === i ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Main info */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground capitalize">
              {event.category}
            </span>
            <h1 className="mt-2 text-2xl font-bold">{event.title}</h1>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-primary" />
              <span>{formatDate(event.date)}</span>
            </div>
            {event.endDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{t('endDate')}: {formatDate(event.endDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>{event.address}, {event.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar src={event.user.avatar} name={event.user.name} size="sm" />
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Organizer
              </div>
              <div className="text-sm font-medium">{event.user.name}</div>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold">About this event</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>

        {/* Ticket purchase panel */}
        <div className="lg:w-64">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">${event.ticketPrice.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">{t('ticketPrice')}</div>
            </div>

            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">{t('totalTickets')}</span>
                <span className="font-medium">{event.totalTickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('ticketsLeft')}</span>
                <span className={`font-medium ${isSoldOut ? 'text-destructive' : 'text-green-600'}`}>
                  {isSoldOut ? t('soldOut') : event.availableTickets}
                </span>
              </div>
            </div>

            {purchased ? (
              <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800 text-center font-medium">
                {t('yourTicket')} ✓
              </div>
            ) : hasTicket ? (
              <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground text-center">
                {t('alreadyHaveTicket')}
              </div>
            ) : isOrganizer ? null : (
              <Button
                onClick={() => void purchaseTicket()}
                disabled={loading || !canPurchase}
                className="w-full"
              >
                <Ticket className="mr-2 h-4 w-4" />
                {isSoldOut ? t('soldOut') : t('getTicket')}
              </Button>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
