'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery, useMutation } from '@apollo/client/react'
import { useRouter } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import {
  ADMIN_STATS_QUERY,
  ADMIN_USERS_QUERY,
  ADMIN_VENDORS_QUERY,
  ADMIN_SERVICES_QUERY,
  ADMIN_EVENTS_QUERY,
} from '@/graphql/admin/queries'
import {
  BAN_USER_MUTATION,
  UNBAN_USER_MUTATION,
  SET_FEATURED_MUTATION,
  ADMIN_DELETE_EVENT_MUTATION,
  ADMIN_DELETE_SERVICE_MUTATION,
} from '@/graphql/admin/mutations'
import { StatsCard } from '@/components/admin/stats-card'
import { AdminTable } from '@/components/admin/admin-table'

interface AdminStats {
  totalUsers: number
  totalVendors: number
  totalCustomers: number
  totalDesigns: number
  totalEvents: number
  totalBookings: number
  totalTickets: number
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  vendorType?: string
  city?: string
  banned?: boolean
}

interface AdminService {
  id: string
  title: string
  city: string
  isFeatured: boolean
  isAvailable: boolean
  user: { id: string; name: string }
}

interface AdminEvent {
  id: string
  title: string
  city: string
  date: string
  status: string
  isFeatured: boolean
  user: { id: string; name: string }
}

type Tab = 'users' | 'vendors' | 'services' | 'events'

export default function AdminPage() {
  const t = useTranslations('admin')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('users')

  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const { data: statsData, loading: statsLoading } = useQuery<{ adminStats: AdminStats }>(
    ADMIN_STATS_QUERY,
    { skip: user?.role !== 'ADMIN' },
  )

  const { data: usersData, refetch: refetchUsers } = useQuery<{ adminUsers: AdminUser[] }>(
    ADMIN_USERS_QUERY,
    { skip: user?.role !== 'ADMIN' || activeTab !== 'users' },
  )

  const { data: vendorsData } = useQuery<{ adminVendors: AdminUser[] }>(
    ADMIN_VENDORS_QUERY,
    { skip: user?.role !== 'ADMIN' || activeTab !== 'vendors' },
  )

  const { data: servicesData, refetch: refetchServices } = useQuery<{
    adminServices: AdminService[]
  }>(ADMIN_SERVICES_QUERY, { skip: user?.role !== 'ADMIN' || activeTab !== 'services' })

  const { data: eventsData, refetch: refetchEvents } = useQuery<{ adminEvents: AdminEvent[] }>(
    ADMIN_EVENTS_QUERY,
    { skip: user?.role !== 'ADMIN' || activeTab !== 'events' },
  )

  const [banUser] = useMutation(BAN_USER_MUTATION)
  const [unbanUser] = useMutation(UNBAN_USER_MUTATION)
  const [setFeatured] = useMutation(SET_FEATURED_MUTATION)
  const [deleteEvent] = useMutation(ADMIN_DELETE_EVENT_MUTATION)
  const [deleteService] = useMutation(ADMIN_DELETE_SERVICE_MUTATION)

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (user?.role !== 'ADMIN') return null

  const stats = statsData?.adminStats
  const users = usersData?.adminUsers ?? []
  const vendors = vendorsData?.adminVendors ?? []
  const services = servicesData?.adminServices ?? []
  const events = eventsData?.adminEvents ?? []

  const TABS: Tab[] = ['users', 'vendors', 'services', 'events']

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      {/* Stats row */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-muted-foreground">{t('stats')}</h2>
        {statsLoading ? (
          <div className="text-muted-foreground">Loading stats...</div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            <StatsCard label={`${t('total')} ${t('users')}`} value={stats.totalUsers} />
            <StatsCard label={t('vendors')} value={stats.totalVendors} />
            <StatsCard label="Customers" value={stats.totalCustomers} />
            <StatsCard label="Designs" value={stats.totalDesigns} />
            <StatsCard label={t('events')} value={stats.totalEvents} />
            <StatsCard label="Bookings" value={stats.totalBookings} />
            <StatsCard label="Tickets" value={stats.totalTickets} />
          </div>
        ) : null}
      </section>

      {/* Tabs */}
      <section>
        <div className="flex gap-2 border-b border-border mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {activeTab === 'users' && (
          <AdminTable
            columns={[
              { header: 'Name', key: 'name' },
              { header: 'Email', key: 'email' },
              { header: 'Role', key: 'role' },
              { header: 'Status', key: 'status' },
              { header: 'Actions', key: 'actions' },
            ]}
          >
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">
                  {u.banned ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      {t('banned')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.banned ? (
                    <button
                      onClick={async () => {
                        await unbanUser({ variables: { id: u.id } })
                        await refetchUsers()
                      }}
                      className="rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                    >
                      {t('unban')}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await banUser({ variables: { id: u.id } })
                        await refetchUsers()
                      }}
                      className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                    >
                      {t('ban')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </AdminTable>
        )}

        {/* Vendors tab */}
        {activeTab === 'vendors' && (
          <AdminTable
            columns={[
              { header: 'Name', key: 'name' },
              { header: 'Type', key: 'type' },
              { header: 'City', key: 'city' },
            ]}
          >
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{v.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.vendorType ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.city ?? '—'}</td>
              </tr>
            ))}
          </AdminTable>
        )}

        {/* Services tab */}
        {activeTab === 'services' && (
          <AdminTable
            columns={[
              { header: 'Title', key: 'title' },
              { header: 'Vendor', key: 'vendor' },
              { header: 'City', key: 'city' },
              { header: 'Featured', key: 'featured' },
              { header: 'Actions', key: 'actions' },
            ]}
          >
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{s.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.city}</td>
                <td className="px-4 py-3">
                  {s.isFeatured ? (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                      {t('featured')}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={async () => {
                      await setFeatured({
                        variables: { type: 'service', id: s.id, featured: !s.isFeatured },
                      })
                      await refetchServices()
                    }}
                    className="rounded bg-secondary px-2 py-1 text-xs hover:bg-secondary/80"
                  >
                    {s.isFeatured ? 'Unfeature' : t('featured')}
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Delete this service?')) {
                        await deleteService({ variables: { id: s.id } })
                        await refetchServices()
                      }
                    }}
                    className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                  >
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}

        {/* Events tab */}
        {activeTab === 'events' && (
          <AdminTable
            columns={[
              { header: 'Title', key: 'title' },
              { header: 'Organizer', key: 'organizer' },
              { header: 'City', key: 'city' },
              { header: 'Date', key: 'date' },
              { header: 'Featured', key: 'featured' },
              { header: 'Actions', key: 'actions' },
            ]}
          >
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{e.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.city}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(e.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {e.isFeatured ? (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                      {t('featured')}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={async () => {
                      await setFeatured({
                        variables: { type: 'event', id: e.id, featured: !e.isFeatured },
                      })
                      await refetchEvents()
                    }}
                    className="rounded bg-secondary px-2 py-1 text-xs hover:bg-secondary/80"
                  >
                    {e.isFeatured ? 'Unfeature' : t('featured')}
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Delete this event?')) {
                        await deleteEvent({ variables: { id: e.id } })
                        await refetchEvents()
                      }
                    }}
                    className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                  >
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </section>
    </div>
  )
}
