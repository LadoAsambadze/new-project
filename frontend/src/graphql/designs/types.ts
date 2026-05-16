export interface DesignUserInfo {
  id: string
  name: string
  avatar?: string
  vendorType?: string
}

export interface DesignType {
  id: string
  title: string
  description?: string
  images: string[]
  category: string
  price?: number
  isForSale: boolean
  userId: string
  user: DesignUserInfo
  likesCount: number
  likedByMe: boolean
  savedByMe: boolean
  createdAt: string
}

export interface DesignFeedResult {
  items: DesignType[]
  nextCursor?: string
  hasMore: boolean
}
