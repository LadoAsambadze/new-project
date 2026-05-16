'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Avatar } from './avatar'

interface AvatarUploadProps {
  src?: string | null
  name: string
  onUpload: (url: string) => void
}

export function AvatarUpload({ src, name, onUpload }: AvatarUploadProps) {
  const t = useTranslations('profile')
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show a local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = (await res.json()) as { url: string }
      onUpload(data.url)
    } catch {
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative cursor-pointer"
        disabled={uploading}
      >
        <Avatar src={preview ?? src} name={name} size="xl" />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-xs font-medium text-white">
            {uploading ? '...' : t('changePhoto')}
          </span>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
      <span className="text-xs text-muted-foreground">
        {t('uploadAvatar')}
      </span>
    </div>
  )
}
