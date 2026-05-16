'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery } from '@apollo/client/react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from '@/i18n/navigation'
import { ME_FULL_QUERY } from '@/graphql/users/queries'
import { UPDATE_PROFILE_MUTATION } from '@/graphql/users/mutations'
import type { UserProfile } from '@/graphql/types'
import { Avatar } from '@/components/profile/avatar'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { ProfileForm } from '@/components/profile/profile-form'
import { Button } from '@/components/ui/button'

interface MeFullData {
  me: UserProfile
}

export default function ProfilePage() {
  const t = useTranslations()
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth()

  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login')
    }
  }, [authUser, authLoading, router])

  const { data, loading } = useQuery<MeFullData>(ME_FULL_QUERY, {
    skip: !authUser,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (data?.me && !initialized) {
      setName(data.me.name)
      setBio(data.me.bio ?? '')
      setCity(data.me.city ?? '')
      setAvatar(data.me.avatar)
      setInitialized(true)
    }
  }, [data, initialized])

  const [updateProfile, { loading: saving }] = useMutation(
    UPDATE_PROFILE_MUTATION,
    {
      onCompleted: () => {
        setEditMode(false)
      },
    },
  )

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!authUser || !data?.me) return null

  const profile = data.me

  const handleSave = () => {
    void updateProfile({
      variables: {
        input: {
          name: name || undefined,
          bio: bio || undefined,
          city: city || undefined,
          avatar: avatar || undefined,
        },
      },
    })
  }

  const handleCancel = () => {
    setName(profile.name)
    setBio(profile.bio ?? '')
    setCity(profile.city ?? '')
    setAvatar(profile.avatar)
    setEditMode(false)
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 p-8">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

      <div className="flex flex-col items-center gap-4">
        {editMode ? (
          <AvatarUpload
            src={avatar}
            name={name}
            onUpload={(url) => setAvatar(url)}
          />
        ) : (
          <Avatar src={profile.avatar} name={profile.name} size="xl" />
        )}

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

      {editMode ? (
        <div className="flex flex-col gap-4">
          <ProfileForm
            name={name}
            bio={bio}
            city={city}
            onNameChange={setName}
            onBioChange={setBio}
            onCityChange={setCity}
          />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {t('profile.save')}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              {t('profile.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{t('auth.name')}</span>
            <span className="font-medium">{profile.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{t('auth.email')}</span>
            <span className="font-medium">{profile.email}</span>
          </div>
          {profile.bio && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t('profile.bio')}</span>
              <span>{profile.bio}</span>
            </div>
          )}
          {profile.city && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t('profile.city')}</span>
              <span>{profile.city}</span>
            </div>
          )}
          <Button onClick={() => setEditMode(true)}>{t('profile.edit')}</Button>
        </div>
      )}
    </div>
  )
}
