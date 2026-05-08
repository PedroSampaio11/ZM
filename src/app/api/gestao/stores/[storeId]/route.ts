import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { UpdateStoreSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

type Params = { params: Promise<{ storeId: string }> };

// GET /api/admin/stores/[storeId]
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where:  { id: storeId },
    include: {
      _count: { select: { partners: true, vehicles: true, leads: true } },
      partners: {
        where:   { isActive: true },
        select:  { id: true, name: true, city: true, state: true, integrations: { select: { adapter: true, isActive: true, lastSyncAt: true, lastSyncStatus: true } } },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!store) {
    return NextResponse.json({ error: 'Store não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ store });
}

// PATCH /api/admin/stores/[storeId]
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { storeId } = await params;

  try {
    const body  = await req.json();
    const input = UpdateStoreSchema.parse(body);

    const store = await prisma.store.update({
      where: { id: storeId },
      data:  input,
    });

    return NextResponse.json({ store });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    console.error('[PATCH /api/admin/stores/[storeId]]', err);
    return NextResponse.json({ error: 'Erro ao atualizar store' }, { status: 500 });
  }
}
