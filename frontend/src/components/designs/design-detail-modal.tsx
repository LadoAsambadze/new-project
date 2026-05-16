'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { X, ChevronLeft, ChevronRight, Heart, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { TOGGLE_LIKE_MUTATION, TOGGLE_SAVE_MUTATION } from '@/graphql/designs/mutations'
import type { DesignType } from '@/graphql/designs/types'

interface DesignDetailModalProps {
  design: DesignType
  isAuthenticated?: boolean
  onClose: () => void
}

export function DesignDetailModal({ design, isAuthenticated, onClose }: DesignDetailModalProps) {
  const t = useTranslations('feed')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [optimisticLiked, setOptimisticLiked] = useState(design.likedByMe)
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(design.likesCount)
  const [optimisticSaved, setOptimisticSaved] = useState(design.savedByMe)

  const [toggleLike] = useMutation(TOGGLE_LIKE_MUTATION)
  const [toggleSave] = useMutation(TOGGLE_SAVE_MUTATION)

  const prevImage = () => {
    setCurrentImageIndex((i) => (i === 0 ? design.images.length - 1 : i - 1))
  }

  const nextImage = () => {
    setCurrentImageIndex((i) => (i === design.images.length - 1 ? 0 : i + 1))
  }

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-y-auto rounded-2xl bg-background shadow-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-1.5 shadow hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image section */}
          <div className="relative md:w-1/2 bg-muted">
            <div className="aspect-square relative overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
              {design.images[currentImageIndex] ? (
                <img
                  src={design.images[currentImageIndex]}
                  alt={design.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            {design.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow hover:bg-muted transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow hover:bg-muted transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {design.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info section */}
          <div className="flex flex-col gap-4 p-6 md:w-1/2">
            <div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                {design.category}
              </span>
            </div>

            <h2 className="text-xl font-bold">{design.title}</h2>

            {design.description && (
              <p className="text-sm text-muted-foreground">{design.description}</p>
            )}

            {/* Designer info */}
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Avatar src={design.user.avatar} name={design.user.name} size="md" />
              <div>
                <p className="font-medium text-sm">{design.user.name}</p>
                {design.user.vendorType && (
                  <p className="text-xs text-muted-foreground">{design.user.vendorType}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
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
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
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

            {/* Price and request */}
            {design.isForSale && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                {design.price != null && (
                  <p className="text-lg font-bold text-green-700 mb-2">
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
