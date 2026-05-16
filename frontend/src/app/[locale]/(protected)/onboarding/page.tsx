'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from '@/i18n/navigation'
import { COMPLETE_VENDOR_ONBOARDING_MUTATION } from '@/graphql/users/mutations'
import type { UserProfile } from '@/graphql/types'
import { cn } from '@/lib/utils'

interface CompleteVendorOnboardingData {
  completeVendorOnboarding: UserProfile
}

interface VendorTypeOption {
  value: string
  emoji: string
  labelKey: 'designer' | 'venue' | 'band' | 'manager'
}

const VENDOR_TYPE_OPTIONS: VendorTypeOption[] = [
  { value: 'DESIGNER', emoji: '🎨', labelKey: 'designer' },
  { value: 'VENUE', emoji: '🏛️', labelKey: 'venue' },
  { value: 'BAND', emoji: '🎸', labelKey: 'band' },
  { value: 'EVENT_MANAGER', emoji: '📋', labelKey: 'manager' },
]

export default function OnboardingPage() {
  const t = useTranslations('roles')
  const router = useRouter()
  const { user, loading, refetch } = useAuth()
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (user.role !== 'VENDOR' || user.vendorType) {
        router.push('/dashboard')
      }
    }
  }, [user, loading, router])

  const [completeOnboarding, { loading: mutating }] = useMutation<
    CompleteVendorOnboardingData
  >(COMPLETE_VENDOR_ONBOARDING_MUTATION, {
    onCompleted: async () => {
      await refetch()
      router.push('/dashboard')
    },
  })

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const handleSelect = async (value: string) => {
    setSelected(value)
    await completeOnboarding({ variables: { vendorType: value } })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">{t('onboarding')}</h1>
        <p className="text-muted-foreground">{t('selectVendorType')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {VENDOR_TYPE_OPTIONS.map(({ value, emoji, labelKey }) => (
          <button
            key={value}
            type="button"
            disabled={mutating}
            onClick={() => void handleSelect(value)}
            className={cn(
              'flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-sm font-medium transition-colors',
              selected === value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/50',
            )}
          >
            <span className="text-4xl">{emoji}</span>
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
