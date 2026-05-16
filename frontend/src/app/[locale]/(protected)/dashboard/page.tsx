'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {user.role}
          </span>
          {user.vendorType && (
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              {user.vendorType}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <Button variant="outline" onClick={() => void handleLogout()}>
        Log out
      </Button>
    </div>
  )
}
