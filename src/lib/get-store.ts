import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Store } from '@prisma/client'

/**
 * Retorna a Store do usuário autenticado.
 * Prioridade:
 *   1. Store onde ownerId = user.id
 *   2. user_metadata.storeId (legado — atribuição manual via Supabase Dashboard)
 * Retorna null se o usuário não tiver store vinculada.
 */
export async function getActiveStore(): Promise<Store | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  if (user.id) {
    const byOwner = await prisma.store.findFirst({ where: { ownerId: user.id, isActive: true } })
    if (byOwner) return byOwner
  }

  const storeId = user.user_metadata?.storeId as string | undefined
  if (storeId) {
    return prisma.store.findFirst({ where: { id: storeId, isActive: true } })
  }

  return null
}
