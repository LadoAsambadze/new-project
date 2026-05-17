'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { ServiceGrid } from '@/components/services/service-grid'
import { ServiceFilters } from '@/components/services/service-filters'
import { CreateServiceForm } from '@/components/services/create-service-form'
import { SERVICES_QUERY } from '@/graphql/services/queries'
import type { ServiceFeedResult, ServiceType } from '@/graphql/services/types'

interface ServicesData {
  services: ServiceFeedResult
}

export function ServicesClient() {
  const t = useTranslations('services')
  const { user } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [city, setCity] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [allItems, setAllItems] = useState<ServiceType[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const { data, loading, fetchMore } = useQuery<ServicesData>(SERVICES_QUERY, {
    variables: {
      category: selectedCategory || undefined,
      city: city || undefined,
      cursor: undefined,
      limit: 12,
    },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => {
    if (data?.services) {
      setAllItems(data.services.items)
      setCursor(data.services.nextCursor)
      setHasMore(data.services.hasMore)
    }
  }, [data])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setAllItems([])
    setCursor(undefined)
    setHasMore(false)
  }

  const handleCityChange = (c: string) => {
    setCity(c)
    setAllItems([])
    setCursor(undefined)
    setHasMore(false)
  }

  const handleLoadMore = () => {
    if (!cursor) return
    void fetchMore({
      variables: {
        category: selectedCategory || undefined,
        city: city || undefined,
        cursor,
        limit: 12,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        const newItems = fetchMoreResult.services.items
        setAllItems((prev) => [...prev, ...newItems])
        setCursor(fetchMoreResult.services.nextCursor)
        setHasMore(fetchMoreResult.services.hasMore)
        return {
          services: {
            ...fetchMoreResult.services,
            items: [...prev.services.items, ...newItems],
          },
        }
      },
    })
  }

  const handleServiceClick = (service: ServiceType) => {
    router.push(`/services/${service.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          {user?.role === 'VENDOR' && (
            <Button onClick={() => setShowCreate(true)} className="hidden md:flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('addService')}
            </Button>
          )}
        </div>

        <div className="mb-6">
          <ServiceFilters
            selectedCategory={selectedCategory}
            city={city}
            onCategoryChange={handleCategoryChange}
            onCityChange={handleCityChange}
          />
        </div>

        {allItems.length === 0 && !loading ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{t('noServices')}</p>
          </div>
        ) : (
          <>
            <ServiceGrid
              services={allItems}
              loading={loading && allItems.length === 0}
              onServiceClick={handleServiceClick}
            />

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating action button for vendors (mobile) */}
      {user?.role === 'VENDOR' && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label={t('addService')}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Create service modal */}
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
                setAllItems([])
              }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
