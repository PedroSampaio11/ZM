'use server'

import { prisma } from '@/lib/prisma'
import { CreateVehicleSchema } from '@/lib/schemas'
import { VehicleStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// ─── Novo cadastro com imagens e status ────────────────────────────────────────
export async function createVehicleFull(data: {
  storeId:      string
  partnerId:    string
  brand:        string
  model:        string
  version?:     string
  year:         number
  mileage:      number
  price:        number
  fuel?:        string
  transmission?: string
  color?:       string
  description?: string
  images:       string[]
  status:       'AVAILABLE' | 'INCOMING'
}) {
  try {
    const input = CreateVehicleSchema.parse({ ...data, images: data.images })

    const partner = await prisma.partner.findUnique({
      where:  { id: input.partnerId },
      select: { storeId: true },
    })
    if (!partner || partner.storeId !== input.storeId) {
      return { error: 'Parceiro não pertence a esta loja' }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        storeId:      input.storeId,
        partnerId:    input.partnerId,
        brand:        input.brand,
        model:        input.model,
        version:      input.version      ?? null,
        year:         input.year,
        mileage:      input.mileage,
        price:        input.price,
        fuel:         input.fuel         ?? null,
        transmission: input.transmission ?? null,
        color:        input.color        ?? null,
        description:  input.description  ?? null,
        images:       input.images,
        status:       data.status,
        lastSyncAt:   new Date(),
      },
    })

    revalidatePath('/gestao/inventory')
    return { success: true, vehicleId: vehicle.id }
  } catch {
    return { error: 'Erro ao cadastrar veículo. Verifique os dados.' }
  }
}

export async function createVehicle(formData: FormData) {
  try {
    const raw = {
      storeId:      formData.get('storeId')      as string,
      partnerId:    formData.get('partnerId')    as string,
      brand:        formData.get('brand')        as string,
      model:        formData.get('model')        as string,
      version:      (formData.get('version')     as string) || undefined,
      year:         parseInt(formData.get('year') as string),
      mileage:      parseInt(formData.get('mileage') as string),
      price:        parseFloat(formData.get('price') as string),
      fuel:         (formData.get('fuel')         as string) || undefined,
      transmission: (formData.get('transmission') as string) || undefined,
      color:        (formData.get('color')        as string) || undefined,
      description:  (formData.get('description')  as string) || undefined,
      images:       [],
    }
    const input = CreateVehicleSchema.parse(raw)

    const partner = await prisma.partner.findUnique({
      where:  { id: input.partnerId },
      select: { storeId: true },
    })
    if (!partner || partner.storeId !== input.storeId) {
      return { error: 'Parceiro não pertence a esta loja' }
    }

    await prisma.vehicle.create({
      data: {
        storeId:      input.storeId,
        partnerId:    input.partnerId,
        brand:        input.brand,
        model:        input.model,
        version:      input.version      ?? null,
        year:         input.year,
        mileage:      input.mileage,
        price:        input.price,
        fuel:         input.fuel         ?? null,
        transmission: input.transmission ?? null,
        color:        input.color        ?? null,
        description:  input.description  ?? null,
        images:       [],
        status:       'AVAILABLE',
        lastSyncAt:   new Date(),
      },
    })

    revalidatePath('/gestao/inventory')
    return { success: true }
  } catch {
    return { error: 'Erro ao cadastrar veículo. Verifique os dados.' }
  }
}

export async function updateVehicleStatus(vehicleId: string, status: VehicleStatus) {
  await prisma.vehicle.update({ where: { id: vehicleId }, data: { status } })
  revalidatePath('/admin/inventory')
}

export async function archiveVehicle(vehicleId: string) {
  await prisma.vehicle.update({ where: { id: vehicleId }, data: { status: 'ARCHIVED' } })
  revalidatePath('/admin/inventory')
}
