import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Store } from '@prisma/client'

/**
 * Retorna a Store do usuário autenticado.
 * Lê user_metadata.storeId do Supabase Auth — se não estiver setado,
 * cai para a primeira store ativa (compatibilidade com 1 store).
 *
 * Para setar storeId no Supabase: Dashboard → Authentication → Users → Edit user → user_metadata
 * Exemplo: { "storeId": "cl..." }
 */
export async function getActiveStore(): Promise<Store | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const storeId = user?.user_metadata?.storeId as string | undefined
    if (storeId) {
      return prisma.store.findFirst({ where: { id: storeId, isActive: true } })
    }
  } catch {
    // Fora de contexto de request (ex: cron) — cai para fallback
  }

  return prisma.store.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } })
}
