import { ServiceCard } from './service-card'
import { ServiceCardSkeleton } from './service-card-skeleton'
import type { ServiceType } from '@/graphql/services/types'

interface ServiceGridProps {
  services: ServiceType[]
  loading?: boolean
  onServiceClick?: (service: ServiceType) => void
  skeletonCount?: number
}

export function ServiceGrid({
  services,
  loading,
  onServiceClick,
  skeletonCount = 6,
}: ServiceGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} onClick={onServiceClick} />
      ))}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
    </div>
  )
}
