'use server';

import { prisma } from '@/lib/prisma';
import { CreateLeadSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function createLead(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      origin: formData.get('origin') || 'ORGANIC',
      vehicleId: formData.get('vehicleId'),
      message: formData.get('message'),
    };

    const data = CreateLeadSchema.parse(rawData);

    // Verifica se lead já existe pelo telefone
    const existing = await prisma.lead.findFirst({
      where: { phone: data.phone },
    });

    if (existing) {
      return { error: 'Você já possui uma solicitação em andamento com este telefone.' };
    }

    await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        origin: data.origin,
        vehicleId: data.vehicleId,
        interactions: data.message
          ? {
              create: {
                channel: 'WHATSAPP' as const,
                direction: 'INBOUND' as const,
                content: data.message,
              },
            }
          : undefined,
      },
    });

    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error: unknown) {
    console.error('[Action createLead]', error);
    return { error: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.' };
  }
}
