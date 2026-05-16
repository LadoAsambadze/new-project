'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter, Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/profile/avatar'

export default function DashboardPage() {
  const t = useTranslations()
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const isVendorWithoutType = user.role === 'VENDOR' && !user.vendorType

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      {isVendorWithoutType && (
        <div className="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-medium">{t('roles.completeProfile')}: </span>
          <Link href="/onboarding" className="underline hover:no-underline">
            {t('roles.onboarding')}
          </Link>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar src={user.avatar} name={user.name} size="lg" />

        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>

        <div className="flex items-center gap-2">
          <span
            className={
              user.role === 'VENDOR'
                ? 'rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700'
                : 'rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700'
            }
          >
            {user.role === 'VENDOR' ? t('roles.vendor') : t('roles.customer')}
          </span>
          {user.vendorType && (
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              {user.vendorType}
            </span>
          )}
        </div>

        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/feed">
          <Button variant="outline">{t('feed.title')}</Button>
        </Link>
        {user.role === 'VENDOR' && (
          <Link href="/designs/my">
            <Button variant="outline">{t('feed.myDesigns')}</Button>
          </Link>
        )}
        <Link href="/services">
          <Button variant="outline">{t('services.title')}</Button>
        </Link>
        {user.role === 'VENDOR' && (
          <Link href="/services/my">
            <Button variant="outline">{t('services.myServices')}</Button>
          </Link>
        )}
        <Link href="/bookings">
          <Button variant="outline">{t('services.myBookings')}</Button>
        </Link>
        <Link href="/events">
          <Button variant="outline">{t('events.title')}</Button>
        </Link>
        <Link href="/events/my">
          <Button variant="outline">{t('events.myEvents')}</Button>
        </Link>
        <Link href="/tickets">
          <Button variant="outline">{t('events.myTickets')}</Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline">{t('profile.edit')}</Button>
        </Link>
        <Button variant="outline" onClick={() => void handleLogout()}>
          Log out
        </Button>
      </div>
    </div>
  )
}
