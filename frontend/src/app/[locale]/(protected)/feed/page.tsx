'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { DesignFilters } from '@/components/designs/design-filters'
import { DesignFeed } from '@/components/designs/design-feed'
import { CreateDesignForm } from '@/components/designs/create-design-form'
import type { DesignType } from '@/graphql/designs/types'

export default function FeedPage() {
  const t = useTranslations('feed')
  const { user } = useAuth()
  const [category, setCategory] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const isVendor = user?.role === 'VENDOR'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
        <h1 className="mb-3 text-xl font-bold">{t('title')}</h1>
        <DesignFilters selected={category} onChange={setCategory} />
      </div>

      <div className="p-4">
        <DesignFeed
          category={category || undefined}
          isAuthenticated={!!user}
        />
      </div>

      {/* Floating create button for vendors */}
      {isVendor && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label={t('upload')}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Create design modal */}
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
              onSuccess={(_design: DesignType) => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
