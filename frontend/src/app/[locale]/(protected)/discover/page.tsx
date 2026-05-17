import type { Metadata } from 'next'
import { DiscoverClient } from './discover-client'

export const metadata: Metadata = {
  title: 'Discover',
  description: 'Discover local events by city across Georgia',
}

export default function DiscoverPage() {
  return <DiscoverClient />
}
