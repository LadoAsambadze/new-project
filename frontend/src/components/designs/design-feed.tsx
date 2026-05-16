'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { DesignGrid } from './design-grid'
import { DesignDetailModal } from './design-detail-modal'
import { FEED_QUERY } from '@/graphql/designs/queries'
import type { DesignType, DesignFeedResult } from '@/graphql/designs/types'

interface FeedData {
  feed: DesignFeedResult
}

interface DesignFeedProps {
  category?: string
  userId?: string
  isForSale?: boolean
  isAuthenticated?: boolean
}

export function DesignFeed({ category, userId, isForSale, isAuthenticated }: DesignFeedProps) {
  const t = useTranslations('feed')
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [selectedDesign, setSelectedDesign] = useState<DesignType | null>(null)
  const [allDesigns, setAllDesigns] = useState<DesignType[]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const { data, loading, fetchMore } = useQuery<FeedData>(FEED_QUERY, {
    variables: { category, userId, isForSale, limit: 12 },
    notifyOnNetworkStatusChange: true,
  })

  // Sync state when initial data arrives or filters change
  useEffect(() => {
    if (data?.feed) {
      setAllDesigns(data.feed.items as DesignType[])
      setCursor(data.feed.nextCursor)
      setHasMore(data.feed.hasMore ?? false)
    }
  }, [data])

  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingMore || loading) return
    setIsFetchingMore(true)
    try {
      const result = await fetchMore({
        variables: { category, userId, isForSale, cursor, limit: 12 },
      })
      if (result.data?.feed) {
        const newFeed = result.data.feed
        setAllDesigns((prev) => [...prev, ...(newFeed.items as DesignType[])])
        setCursor(newFeed.nextCursor)
        setHasMore(newFeed.hasMore ?? false)
      }
    } finally {
      setIsFetchingMore(false)
    }
  }, [hasMore, isFetchingMore, loading, fetchMore, category, userId, isForSale, cursor])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !isFetchingMore) {
          void loadMore()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, isFetchingMore, loadMore])

  const isInitialLoading = loading && allDesigns.length === 0

  return (
    <>
      <DesignGrid
        designs={allDesigns}
        loading={isInitialLoading || isFetchingMore}
        onDesignClick={setSelectedDesign}
        isAuthenticated={isAuthenticated}
        skeletonCount={isInitialLoading ? 12 : 4}
      />

      {!loading && !isFetchingMore && allDesigns.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">{t('noDesigns')}</div>
      )}

      {/* Sentinel div for IntersectionObserver */}
      <div ref={sentinelRef} className="h-4 w-full" />

      {selectedDesign && (
        <DesignDetailModal
          design={selectedDesign}
          isAuthenticated={isAuthenticated}
          onClose={() => setSelectedDesign(null)}
        />
      )}
    </>
  )
}
