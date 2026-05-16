export interface ServiceUserInfo {
  id: string
  name: string
  avatar?: string
}

export interface ServiceType {
  id: string
  title: string
  description: string
  category: string
  images: string[]
  priceFrom: number
  priceTo?: number
  city: string
  isAvailable: boolean
  isFeatured: boolean
  userId: string
  user: ServiceUserInfo
  createdAt: string
}

export interface BookingType {
  id: string
  serviceId: string
  service: ServiceType
  userId: string
  user: ServiceUserInfo
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  date: string
  message?: string
  createdAt: string
}

export interface ServiceFeedResult {
  items: ServiceType[]
  nextCursor?: string
  hasMore: boolean
}
