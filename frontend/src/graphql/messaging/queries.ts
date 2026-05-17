import { gql } from '@apollo/client/core'

export const CONVERSATIONS_QUERY = gql`
  query Conversations {
    conversations {
      otherUser {
        id
        name
        avatar
        role
        vendorType
      }
      lastMessage {
        id
        fromUserId
        toUserId
        body
        read
        createdAt
      }
      unreadCount
    }
  }
`

export const CONVERSATION_QUERY = gql`
  query Conversation($otherUserId: String!, $cursor: String) {
    conversation(otherUserId: $otherUserId, cursor: $cursor) {
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
