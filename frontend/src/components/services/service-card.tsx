'use client'

import { useTranslations } from 'next-intl'
import { MapPin } from 'lucide-react'
import { Avatar } from '@/components/profile/avatar'
import { cn } from '@/lib/utils'
import type { ServiceType } from '@/graphql/services/types'

interface ServiceCardProps {
  service: ServiceType
  onClick?: (service: ServiceType) => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const t = useTranslations('services')
  const firstImage = service.images[0]

  return (
    <div
      className="group overflow-hidden rounded-xl border border-border bg-card cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(service)}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {firstImage ? (
          <img
            src={firstImage}
            alt={service.title}
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
            service.isAvailable
              ? 'bg-green-500 text-white'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {service.isAvailable ? t('available') : t('unavailable')}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">{service.title}</h3>

        <div className="flex items-center gap-2">
          <Avatar src={service.user.avatar} name={service.user.name} size="sm" />
          <span className="text-xs text-muted-foreground truncate">{service.user.name}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
            {service.category.replace('_', ' ').toLowerCase()}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {service.city}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-primary">
            {t('priceFrom')} ${service.priceFrom.toFixed(0)}
            {service.priceTo != null && ` — $${service.priceTo.toFixed(0)}`}
          </div>
        </div>
      </div>
    </div>
  )
}
