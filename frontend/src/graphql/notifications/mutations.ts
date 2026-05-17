import { gql } from '@apollo/client/core'

export const MARK_READ_MUTATION = gql`
  mutation MarkRead($id: String!) {
    markRead(id: $id) {
      id
      read
    }
  }
`

export const MARK_ALL_READ_MUTATION = gql`
  mutation MarkAllRead {
    markAllRead
  }
`

export const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($id: String!) {
    deleteNotification(id: $id)
  }
`
