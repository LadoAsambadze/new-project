export interface EventType {
  id: string
  title: string
  description: string
  images: string[]
  city: string
  address: string
  date: string
  endDate?: string
  category: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
  isFeatured: boolean
  ticketPrice: number
  totalTickets: number
  soldTickets: number
  availableTickets: number
  userId: string
  user: { id: string; name: string; avatar?: string }
  createdAt: string
}

export interface TicketType {
  id: string
  eventId: string
  event: EventType
  userId: string
  user: { id: string; name: string; email: string; avatar?: string }
  price: number
  qrCode: string
  used: boolean
  createdAt: string
}

export interface EventFeedResult {
  items: EventType[]
  nextCursor?: string
  hasMore: boolean
}
