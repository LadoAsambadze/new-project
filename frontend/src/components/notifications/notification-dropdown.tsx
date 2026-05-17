'use client'

import { useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { MY_NOTIFICATIONS_QUERY } from '@/graphql/notifications/queries'
import {
  MARK_READ_MUTATION,
  MARK_ALL_READ_MUTATION,
} from '@/graphql/notifications/mutations'
import type { NotificationType } from '@/graphql/notifications/types'

interface NotificationsData {
  myNotifications: NotificationType[]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface Props {
  onClose: () => void
  onRead: () => void
}

export function NotificationDropdown({ onClose, onRead }: Props) {
  const t = useTranslations('notifications')
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  const { data, refetch } = useQuery<NotificationsData>(MY_NOTIFICATIONS_QUERY, {
    fetchPolicy: 'network-only',
  })

  const [markRead] = useMutation(MARK_READ_MUTATION)
  const [markAllRead] = useMutation(MARK_ALL_READ_MUTATION)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const notifications = data?.myNotifications ?? []

  const handleClick = async (n: NotificationType) => {
    if (!n.read) {
      await markRead({ variables: { id: n.id } })
      await refetch()
      onRead()
    }
    if (n.link) {
      router.push(n.link as Parameters<typeof router.push>[0])
      onClose()
    }
  }

  const handleMarkAll = async () => {
    await markAllRead()
    await refetch()
    onRead()
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-border bg-background shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-semibold">{t('title')}</span>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={() => void handleMarkAll()}
            className="text-xs text-primary hover:underline"
          >
            {t('markAllRead')}
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            {t('noNotifications')}
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => void handleClick(n)}
              className={`w-full px-4 py-3 text-left transition-colors hover:bg-secondary ${
                !n.read ? 'bg-primary/5' : ''
              }`}
            >
              <div className={`text-sm ${!n.read ? 'font-semibold' : 'font-normal'}`}>
                {n.title}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {n.body}
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {timeAgo(n.createdAt)}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
