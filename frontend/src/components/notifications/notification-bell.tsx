'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { UNREAD_COUNT_QUERY } from '@/graphql/notifications/queries'
import { NotificationDropdown } from './notification-dropdown'

interface UnreadCountData {
  unreadCount: number
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)

  const { data, refetch } = useQuery<UnreadCountData>(UNREAD_COUNT_QUERY, {
    fetchPolicy: 'network-only',
  })

  // Poll every 30s as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      void refetch()
    }, 30_000)
    return () => clearInterval(interval)
  }, [refetch])

  const unread = data?.unreadCount ?? 0

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          onClose={() => setOpen(false)}
          onRead={() => void refetch()}
        />
      )}
    </div>
  )
}
