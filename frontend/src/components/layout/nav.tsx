'use client'

import { useTranslations } from 'next-intl'
import { useRouter, Link, usePathname } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'

const NAV_LINKS = [
  { href: '/discover', labelKey: 'discover.localEvents' },
  { href: '/feed', labelKey: 'feed.title' },
  { href: '/services', labelKey: 'services.title' },
  { href: '/events', labelKey: 'events.title' },
  { href: '/bookings', labelKey: 'services.myBookings' },
  { href: '/profile', labelKey: 'profile.title' },
] as const

export function Nav() {
  const t = useTranslations()
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {t(labelKey)}
            </Link>
          ))}
        </div>
        <button
          onClick={() => void handleLogout()}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  )
}
