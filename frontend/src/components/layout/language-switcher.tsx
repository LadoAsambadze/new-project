'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const toggle = () => {
    const next = locale === 'en' ? 'ka' : 'en'
    router.replace(pathname, { locale: next })
  }

  return (
    <button
      onClick={toggle}
      className="flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors uppercase"
      aria-label="Switch language"
    >
      {locale === 'en' ? 'KA' : 'EN'}
    </button>
  )
}
