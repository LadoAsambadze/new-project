'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { CONVERSATIONS_QUERY } from '@/graphql/messaging/queries'
import type { ConversationType } from '@/graphql/messaging/types'
import { Avatar } from '@/components/profile/avatar'

interface ConversationsData {
  conversations: ConversationType[]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

interface Props {
  selectedUserId?: string
  onSelect: (userId: string) => void
}

export function ConversationList({ selectedUserId, onSelect }: Props) {
  const t = useTranslations('messages')
  const { data } = useQuery<ConversationsData>(CONVERSATIONS_QUERY, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 10_000,
  })

  const conversations = data?.conversations ?? []

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
        {t('noConversations')}
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {conversations.map((conv) => (
        <button
          key={conv.otherUser.id}
          onClick={() => onSelect(conv.otherUser.id)}
          className={`flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary ${
            selectedUserId === conv.otherUser.id ? 'bg-secondary' : ''
          }`}
        >
          <div className="flex-shrink-0">
            <Avatar src={conv.otherUser.avatar} name={conv.otherUser.name} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{conv.otherUser.name}</span>
              <span className="flex-shrink-0 text-[10px] text-muted-foreground">
                {timeAgo(conv.lastMessage.createdAt)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <span className="truncate text-xs text-muted-foreground">
                {conv.lastMessage.body}
              </span>
              {conv.unreadCount > 0 && (
                <span className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
