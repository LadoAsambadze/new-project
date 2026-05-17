import { gql } from '@apollo/client/core'

export const NOTIFICATION_RECEIVED_SUBSCRIPTION = gql`
  subscription NotificationReceived {
    notificationReceived {
      id
      title
      body
      read
      link
      createdAt
    }
  }
`
