'use client'

import { useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useAuth } from '@/lib/auth/auth-context'
import { CONVERSATION_QUERY } from '@/graphql/messaging/queries'
import {
  SEND_MESSAGE_MUTATION,
  MARK_CONVERSATION_READ_MUTATION,
} from '@/graphql/messaging/mutations'
import type { MessageType } from '@/graphql/messaging/types'
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'

interface ConversationData {
  conversation: MessageType[]
}

interface Props {
  otherUserId: string
  otherUserName?: string
}

export function ChatWindow({ otherUserId, otherUserName }: Props) {
  const { user } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data, refetch } = useQuery<ConversationData>(CONVERSATION_QUERY, {
    variables: { otherUserId },
    fetchPolicy: 'cache-and-network',
    pollInterval: 5_000,
  })

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE_MUTATION)
  const [markRead] = useMutation(MARK_CONVERSATION_READ_MUTATION)

  const messages = [...(data?.conversation ?? [])].reverse()

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Mark as read when opening
  useEffect(() => {
    void markRead({ variables: { otherUserId } })
  }, [otherUserId, markRead])

  const handleSend = async (body: string) => {
    await sendMessage({ variables: { toUserId: otherUserId, body } })
    await refetch()
  }

  return (
    <div className="flex h-full flex-col">
      {otherUserName && (
        <div className="border-b border-border px-4 py-3">
          <span className="font-semibold">{otherUserName}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.fromUserId === user?.id}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <MessageInput onSend={handleSend} disabled={sending} />
    </div>
  )
}
