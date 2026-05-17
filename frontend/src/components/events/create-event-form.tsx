'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { X, Upload } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CREATE_EVENT_MUTATION, UPDATE_EVENT_MUTATION } from '@/graphql/events/mutations'
import type { EventType } from '@/graphql/events/types'

const CATEGORIES = ['Music', 'Art', 'Sport', 'Food', 'Tech', 'Other']

interface CreateEventFormProps {
  onSuccess?: (event: EventType) => void
  onCancel?: () => void
  initialEvent?: EventType
}

interface CreateEventData {
  createEvent: EventType
}

interface UpdateEventData {
  updateEvent: EventType
}

export function CreateEventForm({ onSuccess, onCancel, initialEvent }: CreateEventFormProps) {
  const t = useTranslations('events')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!initialEvent

  const [title, setTitle] = useState(initialEvent?.title ?? '')
  const [description, setDescription] = useState(initialEvent?.description ?? '')
  const [city, setCity] = useState(initialEvent?.city ?? '')
  const [address, setAddress] = useState(initialEvent?.address ?? '')
  const [date, setDate] = useState(
    initialEvent?.date ? new Date(initialEvent.date).toISOString().slice(0, 16) : '',
  )
  const [endDate, setEndDate] = useState(
    initialEvent?.endDate ? new Date(initialEvent.endDate).toISOString().slice(0, 16) : '',
  )
  const [category, setCategory] = useState(initialEvent?.category ?? 'Music')
  const [ticketPrice, setTicketPrice] = useState(initialEvent?.ticketPrice?.toString() ?? '0')
  const [totalTickets, setTotalTickets] = useState(initialEvent?.totalTickets?.toString() ?? '100')
  const [imageUrls, setImageUrls] = useState<string[]>(initialEvent?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [createEvent, { loading: creating }] = useMutation<CreateEventData>(CREATE_EVENT_MUTATION, {
    onCompleted: (data) => onSuccess?.(data.createEvent),
    onError: (err) => setError(err.message),
  })

  const [updateEvent, { loading: updating }] = useMutation<UpdateEventData>(UPDATE_EVENT_MUTATION, {
    onCompleted: (data) => onSuccess?.(data.updateEvent),
    onError: (err) => setError(err.message),
  })

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
      city,
      address,
      date: new Date(date).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      category,
      ticketPrice: parseFloat(ticketPrice),
      totalTickets: parseInt(totalTickets, 10),
      images: imageUrls,
    }

    if (isEditing && initialEvent) {
      void updateEvent({ variables: { input: { id: initialEvent.id, ...input } } })
    } else {
      void createEvent({ variables: { input } })
    }
  }

  const isBusy = creating || updating || uploading

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="evt-title">Title</Label>
        <Input
          id="evt-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Event title"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="evt-description">Description</Label>
        <textarea
          id="evt-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the event..."
          rows={3}
          required
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="evt-city">{t('address')}</Label>
          <Input
            id="evt-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="City"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="evt-address">{t('address')}</Label>
          <Input
            id="evt-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Street address"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="evt-date">{t('date')}</Label>
          <Input
            id="evt-date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="evt-endDate">{t('endDate')}</Label>
          <Input
            id="evt-endDate"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="evt-category">{t('category')}</Label>
        <select
          id="evt-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="evt-ticketPrice">{t('ticketPrice')} ($)</Label>
          <Input
            id="evt-ticketPrice"
            type="number"
            min="0"
            step="0.01"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="evt-totalTickets">{t('totalTickets')}</Label>
          <Input
            id="evt-totalTickets"
            type="number"
            min="1"
            step="1"
            value={totalTickets}
            onChange={(e) => setTotalTickets(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <Label>Images</Label>
        <div className="flex flex-wrap gap-2">
          {imageUrls.map((url, idx) => (
            <div
              key={idx}
              className="relative h-20 w-20 rounded-md overflow-hidden border border-border"
            >
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
          {isEditing ? 'Save Changes' : t('create')}
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
