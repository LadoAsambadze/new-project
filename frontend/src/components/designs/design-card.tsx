'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { Heart, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/profile/avatar'
import { TOGGLE_LIKE_MUTATION, TOGGLE_SAVE_MUTATION } from '@/graphql/designs/mutations'
import type { DesignType } from '@/graphql/designs/types'

interface DesignCardProps {
  design: DesignType
  onClick?: (design: DesignType) => void
  isAuthenticated?: boolean
}

export function DesignCard({ design, onClick, isAuthenticated }: DesignCardProps) {
  const t = useTranslations('feed')
  const [optimisticLiked, setOptimisticLiked] = useState(design.likedByMe)
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(design.likesCount)
  const [optimisticSaved, setOptimisticSaved] = useState(design.savedByMe)

  const [toggleLike] = useMutation(TOGGLE_LIKE_MUTATION)
  const [toggleSave] = useMutation(TOGGLE_SAVE_MUTATION)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    const wasLiked = optimisticLiked
    setOptimisticLiked(!wasLiked)
    setOptimisticLikesCount(wasLiked ? optimisticLikesCount - 1 : optimisticLikesCount + 1)
    toggleLike({ variables: { designId: design.id } }).catch(() => {
      setOptimisticLiked(wasLiked)
      setOptimisticLikesCount(wasLiked ? optimisticLikesCount : optimisticLikesCount - 1)
    })
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    setOptimisticSaved(!optimisticSaved)
    toggleSave({ variables: { designId: design.id } }).catch(() => {
      setOptimisticSaved(optimisticSaved)
    })
  }

  const firstImage = design.images[0]

  return (
    <div
      className="group overflow-hidden rounded-xl border border-border bg-card cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(design)}
    >
      <div className="aspect-square relative overflow-hidden bg-muted">
        {firstImage ? (
          <img
            src={firstImage}
            alt={design.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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

      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">{design.title}</h3>

        <div className="flex items-center gap-2">
          <Avatar src={design.user.avatar} name={design.user.name} size="sm" />
          <span className="text-xs text-muted-foreground truncate">{design.user.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
            {design.category}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors',
                optimisticLiked
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !isAuthenticated && 'cursor-default opacity-60',
              )}
              aria-label={t('like')}
            >
              <Heart
                className={cn('h-3 w-3', optimisticLiked && 'fill-red-500')}
              />
              <span>{optimisticLikesCount}</span>
            </button>

            <button
              onClick={handleSave}
              className={cn(
                'flex items-center justify-center rounded-full p-1 text-xs transition-colors',
                optimisticSaved
                  ? 'text-blue-500 bg-blue-50 hover:bg-blue-100'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !isAuthenticated && 'cursor-default opacity-60',
              )}
              aria-label={t('save')}
            >
              <Bookmark className={cn('h-3 w-3', optimisticSaved && 'fill-blue-500')} />
            </button>
          </div>
        </div>

        {design.isForSale && design.price != null && (
          <div className="text-sm font-bold text-green-600">
            ${design.price.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  )
}
