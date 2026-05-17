'use client'

import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { CONVERSATIONS_QUERY } from '@/graphql/messaging/queries'
import type { ConversationType } from '@/graphql/messaging/types'
import { ConversationList } from '@/components/messaging/conversation-list'
import { ChatWindow } from '@/components/messaging/chat-window'

interface ConversationsData {
  conversations: ConversationType[]
}

export default function MessagesPage() {
  const t = useTranslations('messages')
  const searchParams = useSearchParams()
  const withParam = searchParams.get('with')

  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    withParam ?? undefined,
  )

  useEffect(() => {
    if (withParam) setSelectedUserId(withParam)
  }, [withParam])

  const { data } = useQuery<ConversationsData>(CONVERSATIONS_QUERY, {
    fetchPolicy: 'cache-and-network',
  })

  const selectedConv = data?.conversations.find(
    (c) => c.otherUser.id === selectedUserId,
  )

  return (
    <div className="mx-auto flex h-[calc(100vh-56px)] max-w-5xl overflow-hidden border-x border-border">
      {/* Left panel — conversation list */}
      <div className="w-72 flex-shrink-0 border-r border-border overflow-y-auto">
        <div className="border-b border-border px-4 py-3">
          <h1 className="font-semibold">{t('title')}</h1>
        </div>
        <ConversationList
          selectedUserId={selectedUserId}
          onSelect={setSelectedUserId}
        />
      </div>

      {/* Right panel — chat window */}
      <div className="flex-1 overflow-hidden">
        {selectedUserId ? (
          <ChatWindow
            otherUserId={selectedUserId}
            otherUserName={selectedConv?.otherUser.name}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {t('selectConversation')}
          </div>
        )}
      </div>
    </div>
  )
}
