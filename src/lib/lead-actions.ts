'use server';

import { prisma } from '@/lib/prisma';
import { CreateLeadSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function createLead(formData: FormData) {
  try {
    // Normaliza telefone: remove não-dígitos e prepend 55 se necessário
    const rawPhone = (formData.get('phone') as string || '').replace(/\D/g, '');
    const phone    = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;

    const rawData = {
      name:      formData.get('name'),
      phone,
      email:     formData.get('email'),
      origin:    formData.get('origin') || 'ORGANIC',
      vehicleId: formData.get('vehicleId'),
      message:   formData.get('message'),
    };

    const data = CreateLeadSchema.parse(rawData);

    const existing = await prisma.lead.findFirst({ where: { phone: data.phone } });
    if (existing) {
      return { error: 'Você já possui uma solicitação em andamento com este número.' };
    }

    let storeId = data.storeId;
    if (!storeId) {
      const defaultStore = await prisma.store.findFirst({
        where:   { isActive: true },
        select:  { id: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!defaultStore) throw new Error('Nenhuma store ativa encontrada');
      storeId = defaultStore.id;
    }

    // Busca veículo para mensagem personalizada
    const vehicle = data.vehicleId
      ? await prisma.vehicle.findUnique({
          where:  { id: data.vehicleId },
          select: { brand: true, model: true, year: true, price: true },
        })
      : null;

    await prisma.lead.create({
      data: {
        storeId,
        name:      data.name,
        phone:     data.phone,
        email:     data.email,
        origin:    data.origin,
        vehicleId: data.vehicleId,
        interactions: data.message
          ? { create: { channel: 'WHATSAPP' as const, direction: 'INBOUND' as const, content: data.message } }
          : undefined,
      },
    });

    revalidatePath('/gestao/leads');

    // Monta URL do WhatsApp com mensagem pré-preenchida
    const waNumber = (process.env.WHATSAPP_NUMBER ?? '5511999999999').replace(/\D/g, '');
    let waMsg = `Olá! Me chamo *${data.name}* e tenho interesse em um veículo anunciado na *Motorz*.`;
    if (vehicle) {
      const fmtPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(Number(vehicle.price));
      waMsg = `Olá! Me chamo *${data.name}* e tenho interesse no *${vehicle.brand} ${vehicle.model} ${vehicle.year}* (${fmtPrice}) anunciado na *Motorz*. Podemos conversar?`;
    }

    return {
      success:      true,
      whatsappUrl:  `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`,
    };
  } catch (error: unknown) {
    console.error('[Action createLead]', error);
    return { error: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.' };
  }
}
