'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { BookingCard } from '@/components/services/booking-card'
import { MY_BOOKINGS_QUERY, VENDOR_BOOKINGS_QUERY } from '@/graphql/services/queries'
import { UPDATE_BOOKING_STATUS_MUTATION } from '@/graphql/services/mutations'
import type { BookingType } from '@/graphql/services/types'

interface MyBookingsData {
  myBookings: BookingType[]
}

interface VendorBookingsData {
  vendorBookings: BookingType[]
}

type Tab = 'my' | 'incoming'

export default function BookingsPage() {
  const t = useTranslations('services')
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('my')

  const { data: myData, loading: myLoading, refetch: refetchMy } = useQuery<MyBookingsData>(
    MY_BOOKINGS_QUERY,
    { fetchPolicy: 'cache-and-network', skip: !user },
  )

  const { data: vendorData, loading: vendorLoading, refetch: refetchVendor } =
    useQuery<VendorBookingsData>(VENDOR_BOOKINGS_QUERY, {
      fetchPolicy: 'cache-and-network',
      skip: !user || user.role !== 'VENDOR',
    })

  const [updateStatus, { loading: statusLoading }] = useMutation(UPDATE_BOOKING_STATUS_MUTATION, {
    onCompleted: () => {
      void refetchVendor()
    },
  })

  const handleConfirm = (bookingId: string) => {
    void updateStatus({ variables: { bookingId, status: 'CONFIRMED' } })
  }

  const handleCancel = (bookingId: string) => {
    void updateStatus({ variables: { bookingId, status: 'CANCELLED' } })
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const myBookings = myData?.myBookings ?? []
  const vendorBookings = vendorData?.vendorBookings ?? []
  const isVendor = user.role === 'VENDOR'

  const tabs: { key: Tab; label: string }[] = [
    { key: 'my', label: t('myBookings') },
    ...(isVendor ? [{ key: 'incoming' as Tab, label: t('incomingRequests') }] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="mb-6 text-2xl font-bold">{t('myBookings')}</h1>

        {/* Tabs */}
        {isVendor && (
          <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my' && (
          <>
            {myLoading && myBookings.length === 0 ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
                ))}
              </div>
            ) : myBookings.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-muted-foreground">{t('noBookings')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {myBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isVendorView={false} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Incoming Requests Tab (vendor only) */}
        {activeTab === 'incoming' && isVendor && (
          <>
            {vendorLoading && vendorBookings.length === 0 ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
                ))}
              </div>
            ) : vendorBookings.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-muted-foreground">{t('noBookings')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {vendorBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isVendorView
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    actionLoading={statusLoading}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
