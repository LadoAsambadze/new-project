'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormProps {
  name: string
  bio: string
  city: string
  onNameChange: (v: string) => void
  onBioChange: (v: string) => void
  onCityChange: (v: string) => void
}

export function ProfileForm({
  name,
  bio,
  city,
  onNameChange,
  onBioChange,
  onCityChange,
}: ProfileFormProps) {
  const t = useTranslations('profile')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-name">{t('name')}</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-bio">{t('bio')}</Label>
        <Input
          id="profile-bio"
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-city">{t('city')}</Label>
        <Input
          id="profile-city"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
        />
      </div>
    </div>
  )
}
