import { gql } from '@apollo/client/core'

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications {
    myNotifications {
      id
      title
      body
      read
      link
      createdAt
    }
  }
`

export const UNREAD_COUNT_QUERY = gql`
  query UnreadCount {
    unreadCount
  }
`
