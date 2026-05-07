import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Store } from '@prisma/client'

/**
 * Retorna a Store do usuário autenticado.
 * Prioridade:
 *   1. Store onde ownerId = user.id (set automaticamente ao criar)
 *   2. user_metadata.storeId (atribuição manual legada — Supabase Dashboard)
 *   3. Primeira store ativa (fallback de compatibilidade)
 */
export async function getActiveStore(): Promise<Store | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.id) {
      const byOwner = await prisma.store.findFirst({ where: { ownerId: user.id, isActive: true } })
      if (byOwner) return byOwner
    }

    const storeId = user?.user_metadata?.storeId as string | undefined
    if (storeId) {
      const byMeta = await prisma.store.findFirst({ where: { id: storeId, isActive: true } })
      if (byMeta) return byMeta
    }
  } catch {
    // Fora de contexto de request (ex: cron) — cai para fallback
  }

  return prisma.store.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } })
}
