import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { getActiveStore } from '@/lib/get-store';
import { prisma } from '@/lib/prisma';
import { CreateVehicleSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

type Params = { params: Promise<{ id: string }> };

const UpdateVehicleSchema = CreateVehicleSchema
  .omit({ storeId: true, partnerId: true, externalId: true })
  .partial()
  .extend({ status: CreateVehicleSchema.shape.brand.optional() });

// GET /api/gestao/vehicles/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const store = await getActiveStore();
  if (!store) return NextResponse.json({ error: 'Store não encontrada' }, { status: 403 });

  const { id } = await params;

  // SEC-01: verifica ownership antes de expor dados
  const vehicle = await prisma.vehicle.findFirst({
    where:   { id, storeId: store.id },
    include: {
      partner: { select: { id: true, name: true, city: true, state: true } },
      leads:   { select: { id: true, name: true, status: true, createdAt: true } },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ vehicle });
}

// PATCH /api/gestao/vehicles/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const store = await getActiveStore();
  if (!store) return NextResponse.json({ error: 'Store não encontrada' }, { status: 403 });

  const { id } = await params;

  // SEC-01: confirma ownership antes de atualizar
  const existing = await prisma.vehicle.findFirst({ where: { id, storeId: store.id } });
  if (!existing) return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });

  try {
    const body  = await req.json();
    const input = UpdateVehicleSchema.parse(body);

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data:  {
        ...(input.brand        !== undefined ? { brand:        input.brand }        : {}),
        ...(input.model        !== undefined ? { model:        input.model }        : {}),
        ...(input.version      !== undefined ? { version:      input.version }      : {}),
        ...(input.year         !== undefined ? { year:         input.year }         : {}),
        ...(input.mileage      !== undefined ? { mileage:      input.mileage }      : {}),
        ...(input.price        !== undefined ? { price:        input.price }        : {}),
        ...(input.fuel         !== undefined ? { fuel:         input.fuel }         : {}),
        ...(input.transmission !== undefined ? { transmission: input.transmission } : {}),
        ...(input.color        !== undefined ? { color:        input.color }        : {}),
        ...(input.description  !== undefined ? { description:  input.description }  : {}),
        ...(input.images       !== undefined ? { images:       input.images }       : {}),
        ...(input.videoUrl     !== undefined ? { videoUrl:     input.videoUrl }     : {}),
      },
    });

    return NextResponse.json({ vehicle });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    console.error('[PATCH /api/gestao/vehicles/[id]]', err);
    return NextResponse.json({ error: 'Erro ao atualizar veículo' }, { status: 500 });
  }
}

// DELETE /api/gestao/vehicles/[id] — arquiva (soft delete)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const store = await getActiveStore();
  if (!store) return NextResponse.json({ error: 'Store não encontrada' }, { status: 403 });

  const { id } = await params;

  // SEC-01: confirma ownership antes de arquivar
  const existing = await prisma.vehicle.findFirst({ where: { id, storeId: store.id } });
  if (!existing) return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });

  try {
    await prisma.vehicle.update({
      where: { id },
      data:  { status: 'ARCHIVED' },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/gestao/vehicles/[id]]', err);
    return NextResponse.json({ error: 'Erro ao arquivar veículo' }, { status: 500 });
  }
}
