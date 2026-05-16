'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { USER_PROFILE_QUERY } from '@/graphql/users/queries'
import type { UserProfile } from '@/graphql/types'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { use } from 'react'

interface UserProfileData {
  userProfile: UserProfile
}

interface PageParams {
  id: string
}

export default function VendorProfilePage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { id } = use(params)
  const t = useTranslations()

  const { data, loading } = useQuery<UserProfileData>(USER_PROFILE_QUERY, {
    variables: { id },
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!data?.userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">User not found</div>
      </div>
    )
  }

  const profile = data.userProfile

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar src={profile.avatar} name={profile.name} size="xl" />

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          {profile.city && (
            <p className="text-sm text-muted-foreground">{profile.city}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={
              profile.role === 'VENDOR'
                ? 'rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700'
                : 'rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700'
            }
          >
            {profile.role === 'VENDOR' ? t('roles.vendor') : t('roles.customer')}
          </span>
          {profile.vendorType && (
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              {profile.vendorType}
            </span>
          )}
        </div>
      </div>

      {profile.bio && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">{t('profile.bio')}</span>
          <p>{profile.bio}</p>
        </div>
      )}

      <Button variant="outline" disabled>
        Contact (coming soon)
      </Button>
    </div>
  )
}
