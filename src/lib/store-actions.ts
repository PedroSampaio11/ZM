'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { CreateStoreSchema, UpdateStoreSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

export async function createStore(formData: FormData) {
  try {
    const raw = {
      name:     formData.get('name')      as string,
      slug:     formData.get('slug')      as string,
      document: (formData.get('document') as string) || undefined,
      plan:     (formData.get('plan')     as string) || 'STARTER',
    }
    const input = CreateStoreSchema.parse(raw)

    const existing = await prisma.store.findUnique({ where: { slug: input.slug } })
    if (existing) return { error: `Slug '${input.slug}' já está em uso` }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await prisma.store.create({
      data: {
        name:     input.name,
        slug:     input.slug,
        document: input.document ?? null,
        plan:     input.plan,
        isActive: true,
        ownerId:  user?.id ?? null,
      },
    })

    revalidatePath('/admin/stores')
    return { success: true }
  } catch {
    return { error: 'Erro ao criar loja. Verifique os dados.' }
  }
}

export async function updateStore(id: string, formData: FormData) {
  try {
    const raw = {
      name:     (formData.get('name')     as string) || undefined,
      plan:     (formData.get('plan')     as string) || undefined,
      document: (formData.get('document') as string) || undefined,
    }
    const input = UpdateStoreSchema.parse(raw)

    await prisma.store.update({ where: { id }, data: input })

    revalidatePath('/admin/stores')
    return { success: true }
  } catch {
    return { error: 'Erro ao atualizar loja.' }
  }
}

export async function toggleStoreActive(id: string, isActive: boolean) {
  await prisma.store.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/stores')
}
