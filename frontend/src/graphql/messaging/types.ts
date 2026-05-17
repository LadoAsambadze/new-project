import type { UserProfile } from '@/graphql/types'

export interface MessageType {
  id: string
  fromUserId: string
  fromUser: UserProfile
  toUserId: string
  toUser: UserProfile
  body: string
  read: boolean
  createdAt: string
}

export interface ConversationType {
  otherUser: UserProfile
  lastMessage: MessageType
  unreadCount: number
}
