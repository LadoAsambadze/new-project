import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { ApolloClientProvider } from '@/lib/apollo/provider'
import { AuthProvider } from '@/lib/auth/auth-context'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: { default: 'Evently — Georgian Events Platform', template: '%s | Evently' },
    description: 'Discover events, designers, venues, bands and event managers in Georgia. Buy tickets, book services, share your designs.',
    keywords: ['events', 'Georgia', 'Tbilisi', 'wedding', 'designers', 'tickets', 'ღონისძიება', 'თბილისი'],
    openGraph: {
      type: 'website',
      locale: locale === 'ka' ? 'ka_GE' : 'en_US',
      siteName: 'Evently',
    },
  }
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ApolloClientProvider>
        <AuthProvider>{children}</AuthProvider>
      </ApolloClientProvider>
    </NextIntlClientProvider>
  )
}
