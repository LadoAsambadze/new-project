'use client'

import { useTranslations } from 'next-intl'
import { MapPin, Calendar, Ticket } from 'lucide-react'
import { Avatar } from '@/components/profile/avatar'
import { cn } from '@/lib/utils'
import type { EventType } from '@/graphql/events/types'

interface EventCardProps {
  event: EventType
  onClick?: (event: EventType) => void
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function EventCard({ event, onClick }: EventCardProps) {
  const t = useTranslations('events')
  const firstImage = event.images[0]
  const isSoldOut = event.availableTickets <= 0

  return (
    <div
      className="group overflow-hidden rounded-xl border border-border bg-card cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(event)}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {firstImage ? (
          <img
            src={firstImage}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        <span
          className={cn(
            'absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium',
            isSoldOut
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-green-500 text-white',
          )}
        >
          {isSoldOut ? t('soldOut') : `${event.availableTickets} ${t('ticketsLeft')}`}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">{event.title}</h3>

        <div className="flex items-center gap-2">
          <Avatar src={event.user.avatar} name={event.user.name} size="sm" />
          <span className="text-xs text-muted-foreground truncate">{event.user.name}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
            {event.category}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {event.city}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{formatDate(event.date)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-primary">
            ${event.ticketPrice.toFixed(0)}
          </div>
          <button
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.(event)
            }}
          >
            <Ticket className="h-3 w-3" />
            {t('getTicket')}
          </button>
        </div>
      </div>
    </div>
  )
}
