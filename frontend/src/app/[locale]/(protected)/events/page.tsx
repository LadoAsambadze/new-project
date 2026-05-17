import type { Metadata } from 'next'
import { EventsClient } from './events-client'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Browse and buy tickets for events in Georgia',
}

export default function EventsPage() {
  return <EventsClient />
}
