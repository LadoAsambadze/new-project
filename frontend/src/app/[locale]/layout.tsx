import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { ApolloClientProvider } from '@/lib/apollo/provider'
import { AuthProvider } from '@/lib/auth/auth-context'

export const metadata: Metadata = {
  title: 'EventHub',
  description: 'Find or offer event services',
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
