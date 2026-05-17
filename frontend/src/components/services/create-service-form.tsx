'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { X, Upload } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CREATE_SERVICE_MUTATION, UPDATE_SERVICE_MUTATION } from '@/graphql/services/mutations'
import type { ServiceType } from '@/graphql/services/types'

const CATEGORIES = [
  { label: 'Designer', value: 'DESIGNER' },
  { label: 'Venue / Disco', value: 'VENUE' },
  { label: 'Musical Band', value: 'BAND' },
  { label: 'Event Manager', value: 'EVENT_MANAGER' },
]

interface CreateServiceFormProps {
  onSuccess?: (service: ServiceType) => void
  onCancel?: () => void
  initialService?: ServiceType
}

interface CreateServiceData {
  createService: ServiceType
}

interface UpdateServiceData {
  updateService: ServiceType
}

export function CreateServiceForm({ onSuccess, onCancel, initialService }: CreateServiceFormProps) {
  const t = useTranslations('services')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!initialService

  const [title, setTitle] = useState(initialService?.title ?? '')
  const [description, setDescription] = useState(initialService?.description ?? '')
  const [category, setCategory] = useState(initialService?.category ?? 'DESIGNER')
  const [city, setCity] = useState(initialService?.city ?? '')
  const [priceFrom, setPriceFrom] = useState(initialService?.priceFrom?.toString() ?? '')
  const [priceTo, setPriceTo] = useState(initialService?.priceTo?.toString() ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(initialService?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [createService, { loading: creating }] = useMutation<CreateServiceData>(
    CREATE_SERVICE_MUTATION,
    {
      onCompleted: (data) => onSuccess?.(data.createService),
      onError: (err) => setError(err.message),
    },
  )

  const [updateService, { loading: updating }] = useMutation<UpdateServiceData>(
    UPDATE_SERVICE_MUTATION,
    {
      onCompleted: (data) => onSuccess?.(data.updateService),
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
      description,
      category,
      city,
      priceFrom: parseFloat(priceFrom),
      priceTo: priceTo ? parseFloat(priceTo) : undefined,
      images: imageUrls,
    }

    if (isEditing && initialService) {
      void updateService({ variables: { input: { id: initialService.id, ...input } } })
    } else {
      void createService({ variables: { input } })
    }
  }

  const isBusy = creating || updating || uploading

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="svc-title">Title</Label>
        <Input
          id="svc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Service title"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="svc-description">Description</Label>
        <textarea
          id="svc-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your service..."
          rows={3}
          required
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="svc-category">Category</Label>
        <select
          id="svc-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="svc-city">{t('city')}</Label>
        <Input
          id="svc-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          placeholder="City"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="svc-priceFrom">{t('priceFrom')} ($)</Label>
          <Input
            id="svc-priceFrom"
            type="number"
            min="0"
            step="1"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            required
            placeholder="0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="svc-priceTo">{t('priceTo')} ($)</Label>
          <Input
            id="svc-priceTo"
            type="number"
            min="0"
            step="1"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

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
          {isEditing ? 'Save Changes' : t('addService')}
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
