'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { Avatar } from '@/components/profile/avatar'
import { cn } from '@/lib/utils'
import { BookingForm } from './booking-form'
import type { ServiceType, BookingType } from '@/graphql/services/types'

interface ServiceDetailProps {
  service: ServiceType
  currentUserId?: string
  currentUserRole?: string
  onBookingSuccess?: (booking: BookingType) => void
}

export function ServiceDetail({
  service,
  currentUserId,
  currentUserRole,
  onBookingSuccess,
}: ServiceDetailProps) {
  const t = useTranslations('services')
  const [imageIndex, setImageIndex] = useState(0)

  const images = service.images ?? []
  const isOwner = currentUserId === service.userId
  const isVendor = currentUserRole === 'VENDOR'
  const showBookingForm = !isOwner && !isVendor && !!currentUserId

  const prevImage = () => setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const nextImage = () => setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Image gallery */}
      <div className="relative md:w-1/2">
        <div className="aspect-video overflow-hidden rounded-2xl bg-muted relative">
          {images[imageIndex] ? (
            <img
              src={images[imageIndex]}
              alt={service.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <span
            className={cn(
              'absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium',
              service.isAvailable
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground border border-border',
            )}
          >
            {service.isAvailable ? t('available') : t('unavailable')}
          </span>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageIndex(idx)}
                  className={cn(
                    'h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                    idx === imageIndex ? 'border-primary' : 'border-border',
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info panel */}
      <div className="flex flex-col gap-4 md:w-1/2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
            {service.category.replace('_', ' ').toLowerCase()}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {service.city}
          </span>
        </div>

        <h1 className="text-2xl font-bold">{service.title}</h1>

        <p className="text-muted-foreground">{service.description}</p>

        {/* Vendor info */}
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <Avatar src={service.user.avatar} name={service.user.name} size="md" />
          <div>
            <p className="font-medium">{service.user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {service.category.replace('_', ' ').toLowerCase()}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('priceFrom')}</p>
          <p className="text-2xl font-bold text-primary">
            ${service.priceFrom.toFixed(0)}
            {service.priceTo != null && (
              <span className="text-lg font-normal text-muted-foreground">
                {' '}— ${service.priceTo.toFixed(0)}
              </span>
            )}
          </p>
        </div>

        {/* Booking form */}
        {showBookingForm && (
          <div className="rounded-xl border border-border p-4">
            <h2 className="font-semibold mb-4">{t('bookNow')}</h2>
            <BookingForm serviceId={service.id} onSuccess={onBookingSuccess} />
          </div>
        )}
      </div>
    </div>
  )
}
