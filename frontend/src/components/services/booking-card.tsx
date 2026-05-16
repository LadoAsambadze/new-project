'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { BookingType } from '@/graphql/services/types'

interface BookingCardProps {
  booking: BookingType
  isVendorView?: boolean
  onConfirm?: (id: string) => void
  onCancel?: (id: string) => void
  actionLoading?: boolean
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export function BookingCard({
  booking,
  isVendorView,
  onConfirm,
  onCancel,
  actionLoading,
}: BookingCardProps) {
  const t = useTranslations('services')

  const statusKey = booking.status.toLowerCase() as 'pending' | 'confirmed' | 'cancelled'
  const statusLabel = t(statusKey)

  const date = new Date(booking.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-1">{booking.service.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isVendorView ? `From: ${booking.user.name}` : `Vendor: ${booking.service.user.name}`}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
            STATUS_STYLES[booking.status] ?? 'bg-secondary text-secondary-foreground',
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{date}</span>
      </div>

      {booking.message && (
        <p className="text-xs text-muted-foreground border-l-2 border-border pl-2">
          {booking.message}
        </p>
      )}

      {isVendorView && booking.status === 'PENDING' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onConfirm?.(booking.id)}
            disabled={actionLoading}
          >
            {t('confirm')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => onCancel?.(booking.id)}
            disabled={actionLoading}
          >
            {t('cancel')}
          </Button>
        </div>
      )}
    </div>
  )
}
