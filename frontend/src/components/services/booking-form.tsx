'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CREATE_BOOKING_MUTATION } from '@/graphql/services/mutations'
import type { BookingType } from '@/graphql/services/types'

interface BookingFormProps {
  serviceId: string
  onSuccess?: (booking: BookingType) => void
}

interface CreateBookingData {
  createBooking: BookingType
}

export function BookingForm({ serviceId, onSuccess }: BookingFormProps) {
  const t = useTranslations('services')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [createBooking, { loading }] = useMutation<CreateBookingData>(CREATE_BOOKING_MUTATION, {
    onCompleted: (data) => {
      setSuccess(true)
      onSuccess?.(data.createBooking)
    },
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!date) {
      setError(t('selectDate'))
      return
    }
    void createBooking({ variables: { input: { serviceId, date, message: message || undefined } } })
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        Booking request sent successfully!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="booking-date">{t('selectDate')}</Label>
        <input
          id="booking-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="booking-message">{t('message')}</Label>
        <textarea
          id="booking-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('message')}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {t('sendRequest')}
      </Button>
    </form>
  )
}
