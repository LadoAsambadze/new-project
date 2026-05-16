import { EventCard } from './event-card'
import { EventCardSkeleton } from './event-card-skeleton'
import type { EventType } from '@/graphql/events/types'

interface EventGridProps {
  events: EventType[]
  loading?: boolean
  onEventClick?: (event: EventType) => void
  skeletonCount?: number
}

export function EventGrid({ events, loading, onEventClick, skeletonCount = 6 }: EventGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onClick={onEventClick} />
      ))}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, i) => <EventCardSkeleton key={i} />)}
    </div>
  )
}
