import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { CreateVehicleSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

type Params = { params: Promise<{ id: string }> };

const UpdateVehicleSchema = CreateVehicleSchema
  .omit({ storeId: true, partnerId: true, externalId: true })
  .partial()
  .extend({ status: CreateVehicleSchema.shape.brand.optional() }); // evita import extra

// GET /api/admin/vehicles/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where:   { id },
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

// PATCH /api/admin/vehicles/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

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
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
    }
    console.error('[PATCH /api/admin/vehicles/[id]]', err);
    return NextResponse.json({ error: 'Erro ao atualizar veículo' }, { status: 500 });
  }
}

// DELETE /api/admin/vehicles/[id] — arquiva (soft delete)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.vehicle.update({
      where: { id },
      data:  { status: 'ARCHIVED' },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
    }
    console.error('[DELETE /api/admin/vehicles/[id]]', err);
    return NextResponse.json({ error: 'Erro ao arquivar veículo' }, { status: 500 });
  }
}
