'use client'

import { use, useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Heart, Bookmark } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/auth-context'
import { Link } from '@/i18n/navigation'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DESIGN_QUERY } from '@/graphql/designs/queries'
import { TOGGLE_LIKE_MUTATION, TOGGLE_SAVE_MUTATION } from '@/graphql/designs/mutations'
import type { DesignType } from '@/graphql/designs/types'

interface DesignData {
  design: DesignType
}

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default function DesignDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const t = useTranslations('feed')
  const { user } = useAuth()

  const [imageIndex, setImageIndex] = useState(0)
  const [optimisticLiked, setOptimisticLiked] = useState(false)
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(0)
  const [optimisticSaved, setOptimisticSaved] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const { data, loading } = useQuery<DesignData>(DESIGN_QUERY, {
    variables: { id },
  })

  useEffect(() => {
    if (data?.design && !initialized) {
      setOptimisticLiked(data.design.likedByMe)
      setOptimisticLikesCount(data.design.likesCount)
      setOptimisticSaved(data.design.savedByMe)
      setInitialized(true)
    }
  }, [data, initialized])

  const [toggleLike] = useMutation(TOGGLE_LIKE_MUTATION)
  const [toggleSave] = useMutation(TOGGLE_SAVE_MUTATION)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const design = data?.design
  if (!design) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Design not found</div>
      </div>
    )
  }

  const images = design.images ?? []
  const designUser = design.user
  const isAuthenticated = !!user

  const handleLike = () => {
    if (!isAuthenticated) return
    const wasLiked = optimisticLiked
    setOptimisticLiked(!wasLiked)
    setOptimisticLikesCount(wasLiked ? optimisticLikesCount - 1 : optimisticLikesCount + 1)
    toggleLike({ variables: { designId: design.id } }).catch(() => {
      setOptimisticLiked(wasLiked)
      setOptimisticLikesCount(wasLiked ? optimisticLikesCount : optimisticLikesCount - 1)
    })
  }

  const handleSave = () => {
    if (!isAuthenticated) return
    setOptimisticSaved(!optimisticSaved)
    toggleSave({ variables: { designId: design.id } }).catch(() => {
      setOptimisticSaved(optimisticSaved)
    })
  }

  const prevImage = () =>
    setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const nextImage = () =>
    setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4">
        {/* Back link */}
        <Link
          href="/feed"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Images */}
          <div className="relative md:w-1/2">
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted relative">
              {images[imageIndex] ? (
                <Image
                  src={images[imageIndex]}
                  alt={design.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImageIndex(idx)}
                      className={cn(
                        'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                        idx === imageIndex ? 'border-primary' : 'border-border',
                      )}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 md:w-1/2">
            <div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                {design.category}
              </span>
            </div>

            <h1 className="text-2xl font-bold">{design.title}</h1>

            {design.description && (
              <p className="text-muted-foreground">{design.description}</p>
            )}

            {/* Designer */}
            {designUser && (
              <Link
                href={`/profile/${design.userId}`}
                className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent transition-colors"
              >
                <Avatar src={designUser.avatar} name={designUser.name ?? ''} size="md" />
                <div>
                  <p className="font-medium">{designUser.name}</p>
                  {designUser.vendorType && (
                    <p className="text-xs text-muted-foreground">{designUser.vendorType}</p>
                  )}
                </div>
              </Link>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                  optimisticLiked
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                  !isAuthenticated && 'cursor-default opacity-60',
                )}
              >
                <Heart className={cn('h-4 w-4', optimisticLiked && 'fill-red-500')} />
                <span>{optimisticLikesCount}</span>
                <span>{t('like')}</span>
              </button>

              <button
                onClick={handleSave}
                className={cn(
                  'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                  optimisticSaved
                    ? 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                  !isAuthenticated && 'cursor-default opacity-60',
                )}
              >
                <Bookmark className={cn('h-4 w-4', optimisticSaved && 'fill-blue-500')} />
                <span>{t('save')}</span>
              </button>
            </div>

            {/* Price */}
            {design.isForSale && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                {design.price != null && (
                  <p className="text-2xl font-bold text-green-700 mb-3">
                    ${design.price.toFixed(2)}
                  </p>
                )}
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  {t('request')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
