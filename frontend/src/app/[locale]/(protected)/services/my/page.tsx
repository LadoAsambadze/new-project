'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { ServiceCardSkeleton } from '@/components/services/service-card-skeleton'
import { CreateServiceForm } from '@/components/services/create-service-form'
import { cn } from '@/lib/utils'
import { MY_SERVICES_QUERY } from '@/graphql/services/queries'
import { DELETE_SERVICE_MUTATION, TOGGLE_AVAILABILITY_MUTATION } from '@/graphql/services/mutations'
import type { ServiceType } from '@/graphql/services/types'

interface MyServicesData {
  myServices: ServiceType[]
}

export default function MyServicesPage() {
  const t = useTranslations('services')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editingService, setEditingService] = useState<ServiceType | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const { data, loading, refetch } = useQuery<MyServicesData>(MY_SERVICES_QUERY, {
    skip: !user || user.role !== 'VENDOR',
    fetchPolicy: 'cache-and-network',
  })

  const [deleteService, { loading: deleting }] = useMutation(DELETE_SERVICE_MUTATION, {
    onCompleted: () => {
      setDeleteConfirmId(null)
      void refetch()
    },
  })

  const [toggleAvailability] = useMutation(TOGGLE_AVAILABILITY_MUTATION, {
    onCompleted: () => void refetch(),
  })

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'VENDOR') {
    router.push('/dashboard')
    return null
  }

  const services = data?.myServices ?? []

  const handleDelete = (id: string) => {
    void deleteService({ variables: { id } })
  }

  const handleToggle = (id: string) => {
    void toggleAvailability({ variables: { id } })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('myServices')}</h1>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('addService')}
          </Button>
        </div>

        {loading && services.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{t('noServices')}</p>
            <Button onClick={() => setShowCreate(true)}>{t('addService')}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {service.images[0] ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                  <span
                    className={cn(
                      'absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium',
                      service.isAvailable
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {service.isAvailable ? t('available') : t('unavailable')}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{service.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1 capitalize">
                    {service.category.replace('_', ' ').toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">{service.city}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => handleToggle(service.id)}
                      title={service.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    >
                      {service.isAvailable ? (
                        <ToggleRight className="h-3 w-3 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 flex items-center gap-1"
                      onClick={() => setEditingService(service)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1"
                      onClick={() => setDeleteConfirmId(service.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-bold">{t('addService')}</h2>
            <CreateServiceForm
              onSuccess={() => {
                setShowCreate(false)
                void refetch()
              }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setEditingService(null)}
        >
          <div
            className="w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-bold">Edit Service</h2>
            <CreateServiceForm
              initialService={editingService}
              onSuccess={() => {
                setEditingService(null)
                void refetch()
              }}
              onCancel={() => setEditingService(null)}
            />
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-sm">Are you sure you want to delete this service?</p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
