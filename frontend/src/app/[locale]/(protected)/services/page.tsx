import type { Metadata } from 'next'
import { ServicesClient } from './services-client'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Find venues, bands, designers and event managers in Georgia',
}

export default function ServicesPage() {
  return <ServicesClient />
}
