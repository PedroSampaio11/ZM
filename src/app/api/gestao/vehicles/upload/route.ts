/**
 * POST /api/gestao/vehicles/upload
 * Faz upload de imagens para Supabase Storage (bucket: vehicles).
 *
 * Pré-requisito Supabase (1x, via Dashboard):
 *   Storage → New Bucket → Nome: "vehicles" → Public: ON
 *
 * Body: multipart/form-data
 *   files  : File[]   — imagens (JPEG / PNG / WebP, máx 8 MB cada)
 *   folder : string   — subpasta (ex: partnerId ou "temp")
 *
 * Response: { urls: string[], errors: string[] }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const BUCKET    = 'vehicles'

function adminStorage() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ).storage
}

export async function POST(req: NextRequest) {
  // Auth guard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await req.formData()
  const files  = formData.getAll('files') as File[]
  const folder = (formData.get('folder') as string | null)?.trim() || 'misc'

  if (!files.length) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const storage = adminStorage()
  const urls:   string[] = []
  const errors: string[] = []

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      errors.push(`${file.name}: tipo inválido (use JPG, PNG ou WebP)`)
      continue
    }
    if (file.size > MAX_BYTES) {
      errors.push(`${file.name}: muito grande (máximo 8 MB)`)
      continue
    }

    const ext  = file.type.split('/')[1].replace('jpeg', 'jpg')
    const slug = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const path = `${folder}/${slug}.${ext}`

    const { data, error } = await storage
      .from(BUCKET)
      .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false })

    if (error) {
      errors.push(`${file.name}: ${error.message}`)
      continue
    }

    const { data: { publicUrl } } = storage.from(BUCKET).getPublicUrl(data.path)
    urls.push(publicUrl)
  }

  return NextResponse.json({ urls, errors })
}
