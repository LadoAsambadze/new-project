'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { DesignCardSkeleton } from '@/components/designs/design-card-skeleton'
import { CreateDesignForm } from '@/components/designs/create-design-form'
import { MY_DESIGNS_QUERY } from '@/graphql/designs/queries'
import { DELETE_DESIGN_MUTATION } from '@/graphql/designs/mutations'
import type { DesignType } from '@/graphql/designs/types'

interface MyDesignsData {
  myDesigns: DesignType[]
}

export default function MyDesignsPage() {
  const t = useTranslations('feed')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editingDesign, setEditingDesign] = useState<DesignType | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const { data, loading, refetch } = useQuery<MyDesignsData>(MY_DESIGNS_QUERY, {
    skip: !user || user.role !== 'VENDOR',
    fetchPolicy: 'cache-and-network',
  })

  const [deleteDesign, { loading: deleting }] = useMutation(DELETE_DESIGN_MUTATION, {
    onCompleted: () => {
      setDeleteConfirmId(null)
      void refetch()
    },
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

  const designs = data?.myDesigns ?? []

  const handleDelete = (id: string) => {
    void deleteDesign({ variables: { id } })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('myDesigns')}</h1>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('upload')}
          </Button>
        </div>

        {loading && designs.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <DesignCardSkeleton key={i} />
            ))}
          </div>
        ) : designs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{t('noDesigns')}</p>
            <Button onClick={() => setShowCreate(true)}>{t('upload')}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {designs.map((design) => (
              <div key={design.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {design.images[0] ? (
                    <img
                      src={design.images[0]}
                      alt={design.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                  {design.isForSale && (
                    <span className="absolute top-2 left-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                      {t('forSale')}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{design.title}</h3>
                  <p className="text-xs text-muted-foreground capitalize mb-3">{design.category}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 flex items-center gap-1"
                      onClick={() => setEditingDesign(design)}
                    >
                      <Pencil className="h-3 w-3" />
                      {t('edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1"
                      onClick={() => setDeleteConfirmId(design.id)}
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
            <h2 className="mb-4 text-lg font-bold">{t('upload')}</h2>
            <CreateDesignForm
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
      {editingDesign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setEditingDesign(null)}
        >
          <div
            className="w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-bold">{t('edit')}</h2>
            <CreateDesignForm
              initialDesign={editingDesign}
              onSuccess={() => {
                setEditingDesign(null)
                void refetch()
              }}
              onCancel={() => setEditingDesign(null)}
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
            <p className="mb-6 text-sm">{t('confirmDelete')}</p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
              >
                {t('delete')}
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
