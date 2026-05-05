import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { UpdateIntegrationSchema } from '@/lib/schemas';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

type Params = { params: Promise<{ storeId: string; integrationId: string }> };

// PATCH /api/admin/stores/[storeId]/integrations/[integrationId]
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { storeId, integrationId } = await params;

  try {
    const body  = await req.json();
    const input = UpdateIntegrationSchema.parse(body);

    const existing = await prisma.integrationConfig.findUnique({
      where:  { id: integrationId },
      select: { storeId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 });
    }
    if (existing.storeId !== storeId) {
      return NextResponse.json({ error: 'Integração não pertence a esta store' }, { status: 403 });
    }

    const integration = await prisma.integrationConfig.update({
      where: { id: integrationId },
      data:  {
        ...(input.isActive    !== undefined ? { isActive:    input.isActive }                                  : {}),
        ...(input.credentials !== undefined ? { credentials: input.credentials as Prisma.InputJsonValue }      : {}),
        ...(input.config      !== undefined ? { config:      input.config      as Prisma.InputJsonValue }      : {}),
      },
      select: {
        id: true, adapter: true, isActive: true, config: true,
        lastSyncAt: true, lastSyncStatus: true,
        partner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ integration });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    console.error('[PATCH /api/admin/stores/.../integrations/...]', err);
    return NextResponse.json({ error: 'Erro ao atualizar integração' }, { status: 500 });
  }
}

// DELETE /api/admin/stores/[storeId]/integrations/[integrationId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { storeId, integrationId } = await params;

  const existing = await prisma.integrationConfig.findUnique({
    where:  { id: integrationId },
    select: { storeId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 });
  }
  if (existing.storeId !== storeId) {
    return NextResponse.json({ error: 'Integração não pertence a esta store' }, { status: 403 });
  }

  await prisma.integrationConfig.delete({ where: { id: integrationId } });

  return NextResponse.json({ success: true });
}
