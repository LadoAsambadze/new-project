'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { X, Upload } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CREATE_DESIGN_MUTATION, UPDATE_DESIGN_MUTATION } from '@/graphql/designs/mutations'
import type { DesignType } from '@/graphql/designs/types'

const CATEGORIES = ['wedding', 'birthday', 'corporate', 'party', 'other']

interface CreateDesignFormProps {
  onSuccess?: (design: DesignType) => void
  onCancel?: () => void
  initialDesign?: DesignType
}

interface CreateDesignData {
  createDesign: DesignType
}

interface UpdateDesignData {
  updateDesign: DesignType
}

export function CreateDesignForm({ onSuccess, onCancel, initialDesign }: CreateDesignFormProps) {
  const t = useTranslations('feed')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!initialDesign

  const [title, setTitle] = useState(initialDesign?.title ?? '')
  const [description, setDescription] = useState(initialDesign?.description ?? '')
  const [category, setCategory] = useState(initialDesign?.category ?? 'wedding')
  const [isForSale, setIsForSale] = useState(initialDesign?.isForSale ?? false)
  const [price, setPrice] = useState(initialDesign?.price?.toString() ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(initialDesign?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [createDesign, { loading: creating }] = useMutation<CreateDesignData>(
    CREATE_DESIGN_MUTATION,
    {
      onCompleted: (data) => {
        onSuccess?.(data.createDesign)
      },
      onError: (err) => setError(err.message),
    },
  )

  const [updateDesign, { loading: updating }] = useMutation<UpdateDesignData>(
    UPDATE_DESIGN_MUTATION,
    {
      onCompleted: (data) => {
        onSuccess?.(data.updateDesign)
      },
      onError: (err) => setError(err.message),
    },
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      Array.from(files).forEach((f) => formData.append('files', f))
      const res = await fetch('/api/upload/images', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = (await res.json()) as { urls: string[] }
      setImageUrls((prev) => [...prev, ...data.urls])
    } catch {
      setError('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (imageUrls.length === 0) {
      setError('Please upload at least one image.')
      return
    }

    const input = {
      title,
      description: description || undefined,
      images: imageUrls,
      category,
      isForSale,
      price: isForSale && price ? parseFloat(price) : undefined,
    }

    if (isEditing && initialDesign) {
      void updateDesign({ variables: { input: { id: initialDesign.id, ...input } } })
    } else {
      void createDesign({ variables: { input } })
    }
  }

  const isBusy = creating || updating || uploading

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Design title"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your design..."
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="capitalize">
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isForSale"
          type="checkbox"
          checked={isForSale}
          onChange={(e) => setIsForSale(e.target.checked)}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <Label htmlFor="isForSale">{t('forSale')}</Label>
      </div>

      {isForSale && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">{t('price')} ($)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
      )}

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <Label>Images</Label>
        <div className="flex flex-wrap gap-2">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="relative h-20 w-20 rounded-md overflow-hidden border border-border">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {imageUrls.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-5 w-5" />
              <span className="text-xs">{uploading ? '...' : 'Add'}</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => void handleFileChange(e)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isBusy}>
          {isEditing ? t('edit') : t('upload')}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
