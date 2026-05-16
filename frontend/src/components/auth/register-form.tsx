'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { REGISTER_MUTATION } from '@/graphql/auth/mutations'
import type { AuthResponse, Role, VendorType } from '@/graphql/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { cn } from '@/lib/utils'

interface RegisterData {
  register: AuthResponse
}

interface RegisterVariables {
  input: {
    name: string
    email: string
    password: string
    role: Role
    vendorType?: VendorType
  }
}

const VENDOR_TYPES: { value: VendorType; label: string }[] = [
  { value: 'DESIGNER', label: 'designer' },
  { value: 'VENUE', label: 'venue' },
  { value: 'BAND', label: 'band' },
  { value: 'EVENT_MANAGER', label: 'manager' },
]

export function RegisterForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const auth = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('CUSTOMER')
  const [vendorType, setVendorType] = useState<VendorType | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [registerMutation, { loading }] = useMutation<
    RegisterData,
    RegisterVariables
  >(REGISTER_MUTATION, {
    onCompleted: (data) => {
      auth.login(data.register)
      router.push('/dashboard')
    },
    onError: (err) => {
      setFormError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (role === 'VENDOR' && !vendorType) {
      setFormError('Please select your vendor type')
      return
    }

    void registerMutation({
      variables: {
        input: {
          name,
          email,
          password,
          role,
          ...(role === 'VENDOR' && vendorType ? { vendorType } : {}),
        },
      },
    })
  }

  const getVendorLabel = (label: string): string => {
    const map: Record<string, string> = {
      designer: t('designer'),
      venue: t('venue'),
      band: t('band'),
      manager: t('manager'),
    }
    return map[label] ?? label
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('registerTitle')}
        </h1>
      </div>

      <OAuthButtons />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t('name')}</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Role</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setRole('CUSTOMER')
                setVendorType(null)
              }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                role === 'CUSTOMER'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <span className="text-2xl">🔍</span>
              {t('customer')}
            </button>
            <button
              type="button"
              onClick={() => setRole('VENDOR')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                role === 'VENDOR'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <span className="text-2xl">🎯</span>
              {t('vendor')}
            </button>
          </div>
        </div>

        {role === 'VENDOR' && (
          <div className="flex flex-col gap-2">
            <Label>Vendor Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {VENDOR_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVendorType(value)}
                  className={cn(
                    'rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors',
                    vendorType === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  {getVendorLabel(label)}
                </button>
              ))}
            </div>
          </div>
        )}

        {formError && (
          <p className="text-sm text-destructive">{formError}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '...' : t('register')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t('login')}
        </Link>
      </p>
    </div>
  )
}
