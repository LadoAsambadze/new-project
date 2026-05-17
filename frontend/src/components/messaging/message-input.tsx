'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Send } from 'lucide-react'

interface Props {
  onSend: (body: string) => void | Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: Props) {
  const t = useTranslations('messages')
  const [value, setValue] = useState('')

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed) return
    setValue('')
    await onSend(trimmed)
  }

  return (
    <div className="flex items-center gap-2 border-t border-border p-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            void handleSend()
          }
        }}
        placeholder={t('typeMessage')}
        disabled={disabled}
        className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      />
      <button
        onClick={() => void handleSend()}
        disabled={disabled || !value.trim()}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        aria-label={t('send')}
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}
