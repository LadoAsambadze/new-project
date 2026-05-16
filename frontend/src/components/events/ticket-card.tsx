import { useTranslations } from 'next-intl'
import { Calendar, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TicketType } from '@/graphql/events/types'

interface TicketCardProps {
  ticket: TicketType
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

export function TicketCard({ ticket }: TicketCardProps) {
  const t = useTranslations('events')
  const { event } = ticket

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex">
        {event.images[0] && (
          <div className="w-24 shrink-0 bg-muted">
            <img src={event.images[0]} alt={event.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight">{event.title}</h3>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                ticket.used
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-green-100 text-green-800',
              )}
            >
              {ticket.used ? t('used') : t('valid')}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{event.city}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Paid: <span className="font-medium text-foreground">${ticket.price.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* QR code display */}
      <div className="border-t border-dashed border-border mx-4" />
      <div className="p-4">
        <div className="text-xs text-muted-foreground mb-1">{t('yourTicket')} QR Code</div>
        <div className="rounded-lg bg-muted px-3 py-2 font-mono text-xs break-all text-foreground select-all">
          {ticket.qrCode}
        </div>
      </div>
    </div>
  )
}
