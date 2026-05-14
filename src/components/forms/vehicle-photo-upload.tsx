'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VehiclePhotoUploadProps {
  value:     string[]
  onChange:  (urls: string[]) => void
  folder:    string     // ex: partnerId
  maxFiles?: number
  disabled?: boolean
}

export function VehiclePhotoUpload({
  value,
  onChange,
  folder,
  maxFiles = 10,
  disabled = false,
}: VehiclePhotoUploadProps) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (rawFiles: File[]) => {
    if (uploading) return
    const available = maxFiles - value.length
    if (available <= 0) { setError(`Máximo de ${maxFiles} fotos`); return }

    const toSend = rawFiles
      .filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
      .slice(0, available)

    if (!toSend.length) { setError('Use arquivos JPG, PNG ou WebP'); return }

    setUploading(true)
    setError(null)

    const fd = new FormData()
    toSend.forEach(f => fd.append('files', f))
    fd.append('folder', folder)

    try {
      const res  = await fetch('/api/gestao/vehicles/upload', { method: 'POST', body: fd })
      const data = await res.json() as { urls: string[]; errors: string[] }
      if (data.urls?.length)  onChange([...value, ...data.urls])
      if (data.errors?.length) setError(data.errors[0])
    } catch {
      setError('Erro ao enviar fotos. Tente novamente.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [uploading, value, onChange, folder, maxFiles])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    upload(Array.from(e.dataTransfer.files))
  }, [upload])

  const remove = (url: string) => onChange(value.filter(u => u !== url))

  const full = value.length >= maxFiles

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <button
        type="button"
        disabled={disabled || uploading || full}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'w-full rounded-2xl border-2 border-dashed py-8 px-6 flex flex-col items-center gap-3 transition-all duration-150 focus-visible:outline-none',
          dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-white/10 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900',
          (disabled || full) && 'opacity-40 cursor-not-allowed',
        )}
      >
        {uploading ? (
          <Loader2 size={24} className="text-primary animate-spin" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload size={18} className="text-primary" />
          </div>
        )}
        <div className="text-center pointer-events-none">
          <p className="text-sm font-semibold text-zinc-300">
            {uploading ? 'Enviando...' : full ? `${maxFiles} fotos adicionadas` : 'Arraste ou clique para adicionar fotos'}
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            JPG, PNG ou WebP · Máx 8 MB por foto · {value.length}/{maxFiles}
          </p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => upload(Array.from(e.target.files ?? []))}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <ImageOff size={12} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {value.map((url, idx) => (
            <div
              key={url}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5"
            >
              <Image
                src={url}
                alt={`Foto ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized={!url.includes('supabase.co')}
              />

              {/* Capa badge */}
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-none">
                  Capa
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                aria-label="Remover foto"
              >
                <X size={10} className="text-white" />
              </button>

              {/* Position number */}
              <span className="absolute bottom-1 right-1.5 text-[9px] font-bold text-white/40">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
