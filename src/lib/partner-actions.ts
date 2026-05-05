'use server'

import { prisma } from '@/lib/prisma'
import { CreatePartnerSchema } from '@/lib/schemas'
import { syncPartner } from '@/lib/inventory-sync/engine'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export async function createPartner(formData: FormData) {
  try {
    const raw = {
      storeId:    formData.get('storeId')    as string,
      name:       formData.get('name')       as string,
      document:   formData.get('document')   as string,
      email:      (formData.get('email')     as string) || undefined,
      phone:      (formData.get('phone')     as string) || undefined,
      address:    (formData.get('address')   as string) || undefined,
      city:       formData.get('city')       as string,
      state:      formData.get('state')      as string,
      commission: parseFloat(formData.get('commission') as string) || 0,
    }
    const input = CreatePartnerSchema.parse(raw)

    const existing = await prisma.partner.findUnique({ where: { document: input.document } })
    if (existing) return { error: `CNPJ ${input.document} já cadastrado` }

    await prisma.partner.create({
      data: {
        storeId:    input.storeId,
        name:       input.name,
        document:   input.document,
        email:      input.email    ?? null,
        phone:      input.phone    ?? null,
        address:    input.address  ?? null,
        city:       input.city,
        state:      input.state,
        commission: input.commission,
        isActive:   true,
      },
    })

    revalidatePath('/admin/partners')
    return { success: true }
  } catch (err) {
    if (err instanceof Error && err.message.includes('document')) return { error: 'CNPJ inválido' }
    return { error: 'Erro ao criar parceiro. Verifique os dados.' }
  }
}

export async function togglePartnerActive(id: string, isActive: boolean) {
  await prisma.partner.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/partners')
}

export async function configureIntegration(formData: FormData) {
  try {
    const partnerId = formData.get('partnerId') as string
    const storeId   = formData.get('storeId')   as string
    const adapter   = formData.get('adapter')   as string

    const partner = await prisma.partner.findUnique({ where: { id: partnerId }, select: { storeId: true } })
    if (!partner || partner.storeId !== storeId) return { error: 'Parceiro inválido' }

    await prisma.integrationConfig.upsert({
      where:  { partnerId_adapter: { partnerId, adapter: adapter as never } },
      update: { isActive: true },
      create: {
        partnerId,
        storeId,
        adapter:     adapter as never,
        isActive:    true,
        credentials: {} as Prisma.InputJsonValue,
        config:      {} as Prisma.InputJsonValue,
      },
    })

    revalidatePath('/admin/partners')
    return { success: true }
  } catch {
    return { error: 'Erro ao configurar integração.' }
  }
}

export async function syncPartnerNow(integrationConfigId: string) {
  try {
    const integration = await prisma.integrationConfig.findUnique({
      where:  { id: integrationConfigId },
      select: { partnerId: true, adapter: true, credentials: true, config: true },
    })
    if (!integration) return { error: 'Integração não encontrada' }

    const result = await syncPartner(
      integration.partnerId,
      integration.adapter,
      {
        credentials: integration.credentials as Record<string, string>,
        config:      integration.config      as Record<string, unknown>,
      },
      { dryRun: false }
    )

    revalidatePath('/admin/lojas')
    revalidatePath('/admin/partners')
    revalidatePath('/admin/inventory')
    return { success: true, result }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao sincronizar' }
  }
}

export async function createLoja(formData: FormData) {
  try {
    const store = await prisma.store.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } })
    if (!store) return { error: 'Nenhuma loja base encontrada no sistema' }

    const name        = (formData.get('name')        as string)?.trim()
    const document    = (formData.get('document')    as string)?.replace(/\D/g, '')
    const city        = (formData.get('city')        as string)?.trim()
    const state       = (formData.get('state')       as string)?.trim()
    const dms         = (formData.get('dms')         as string) || 'MANUAL'
    const dmsUsername = (formData.get('dmsUsername') as string)?.trim() || ''
    const dmsPassword = (formData.get('dmsPassword') as string)?.trim() || ''

    if (!name || !document || !city || !state) return { error: 'Preencha todos os campos obrigatórios' }
    if (document.length !== 14) return { error: 'CNPJ deve ter 14 dígitos' }

    const existing = await prisma.partner.findUnique({ where: { document } })
    if (existing) return { error: 'CNPJ já cadastrado no sistema' }

    const partner = await prisma.partner.create({
      data: { storeId: store.id, name, document, city, state, isActive: true, commission: 0 },
    })

    const credentials: Prisma.InputJsonValue = (dms !== 'MANUAL' && dmsUsername)
      ? { username: dmsUsername, password: dmsPassword }
      : {}

    await prisma.integrationConfig.create({
      data: {
        partnerId: partner.id,
        storeId:   store.id,
        adapter:   dms as never,
        isActive:  true,
        credentials,
        config:    {} as Prisma.InputJsonValue,
      },
    })

    revalidatePath('/admin/lojas')
    revalidatePath('/admin/inventory')
    return { success: true, partnerId: partner.id }
  } catch {
    return { error: 'Erro ao cadastrar loja. Verifique os dados.' }
  }
}

export async function updateLoja(formData: FormData) {
  try {
    const partnerId   = (formData.get('partnerId')   as string)?.trim()
    const name        = (formData.get('name')        as string)?.trim()
    const city        = (formData.get('city')        as string)?.trim()
    const state       = (formData.get('state')       as string)?.trim()
    const dmsUsername = (formData.get('dmsUsername') as string)?.trim() || ''
    const dmsPassword = (formData.get('dmsPassword') as string)?.trim() || ''

    if (!partnerId || !name || !city || !state) return { error: 'Preencha todos os campos obrigatórios' }

    await prisma.partner.update({
      where: { id: partnerId },
      data:  { name, city, state },
    })

    // Atualiza credenciais da integração AutoCerto se fornecidas
    if (dmsUsername) {
      const integration = await prisma.integrationConfig.findFirst({
        where: { partnerId, adapter: 'AUTOCERTO' },
      })
      if (integration) {
        await prisma.integrationConfig.update({
          where: { id: integration.id },
          data:  {
            credentials: {
              username: dmsUsername,
              ...(dmsPassword ? { password: dmsPassword } : {}),
            } as Prisma.InputJsonValue,
          },
        })
      }
    }

    revalidatePath('/admin/lojas')
    return { success: true }
  } catch {
    return { error: 'Erro ao atualizar loja.' }
  }
}

export async function deleteLoja(partnerId: string) {
  try {
    // Deleta na ordem correta pois o schema não tem cascade em todas as relações
    await prisma.lead.deleteMany({ where: { partnerId } })
    await prisma.vehicle.deleteMany({ where: { partnerId } })
    await prisma.integrationConfig.deleteMany({ where: { partnerId } })
    await prisma.partner.delete({ where: { id: partnerId } })
    revalidatePath('/admin/lojas')
    revalidatePath('/admin/inventory')
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao remover loja.' }
  }
}
