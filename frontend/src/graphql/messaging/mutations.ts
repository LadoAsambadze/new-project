import { gql } from '@apollo/client/core'

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($toUserId: String!, $body: String!) {
    sendMessage(toUserId: $toUserId, body: $body) {
      id
      fromUserId
      fromUser {
        id
        name
        avatar
      }
      toUserId
      toUser {
        id
        name
        avatar
      }
      body
      read
      createdAt
    }
  }
`

export const MARK_CONVERSATION_READ_MUTATION = gql`
  mutation MarkConversationRead($otherUserId: String!) {
    markConversationRead(otherUserId: $otherUserId)
  }
`
