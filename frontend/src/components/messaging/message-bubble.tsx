'use client'

import type { MessageType } from '@/graphql/messaging/types'

function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

interface Props {
  message: MessageType
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: Props) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm bg-secondary text-secondary-foreground'
        }`}
      >
        <p className="text-sm">{message.body}</p>
        <p
          className={`mt-1 text-[10px] ${
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
