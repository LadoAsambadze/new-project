'use client'

import { use } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { Link } from '@/i18n/navigation'
import { ServiceDetail } from '@/components/services/service-detail'
import { SERVICE_QUERY } from '@/graphql/services/queries'
import type { ServiceType } from '@/graphql/services/types'

interface ServiceData {
  service: ServiceType
}

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default function ServiceDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const t = useTranslations('services')
  const { user } = useAuth()

  const { data, loading } = useQuery<ServiceData>(SERVICE_QUERY, {
    variables: { id },
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const service = data?.service
  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Service not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4">
        <Link
          href="/services"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('title')}
        </Link>

        <ServiceDetail
          service={service}
          currentUserId={user?.id}
          currentUserRole={user?.role}
        />
      </div>
    </div>
  )
}
