'use client'

import { DesignCard } from './design-card'
import { DesignCardSkeleton } from './design-card-skeleton'
import type { DesignType } from '@/graphql/designs/types'

interface DesignGridProps {
  designs: DesignType[]
  loading?: boolean
  onDesignClick?: (design: DesignType) => void
  isAuthenticated?: boolean
  skeletonCount?: number
}

export function DesignGrid({
  designs,
  loading,
  onDesignClick,
  isAuthenticated,
  skeletonCount = 8,
}: DesignGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {designs.map((design) => (
        <DesignCard
          key={design.id}
          design={design}
          onClick={onDesignClick}
          isAuthenticated={isAuthenticated}
        />
      ))}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, i) => (
          <DesignCardSkeleton key={i} />
        ))}
    </div>
  )
}
