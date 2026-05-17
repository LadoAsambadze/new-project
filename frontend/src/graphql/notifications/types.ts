export interface NotificationType {
  id: string
  userId: string
  title: string
  body: string
  read: boolean
  link?: string
  createdAt: string
}
