import type { Metadata } from 'next'
import { FeedClient } from './feed-client'

export const metadata: Metadata = {
  title: 'Design Feed',
  description: 'Browse wedding and event designs from Georgian designers',
}

export default function FeedPage() {
  return <FeedClient />
}
