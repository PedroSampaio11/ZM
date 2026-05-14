import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { getActiveStore } from '@/lib/get-store';
import { prisma } from '@/lib/prisma';
import { CreateVehicleSchema } from '@/lib/schemas';
import { VehicleStatus } from '@prisma/client';
import { ZodError, z } from 'zod';

const vehicleStatusSchema = z.nativeEnum(VehicleStatus);

// GET /api/gestao/vehicles?partnerId=xxx&status=xxx&page=1&limit=20
// SEC-02: storeId vem do getActiveStore(), nunca do query param
export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const store = await getActiveStore();
  if (!store) return NextResponse.json({ error: 'Store não encontrada' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const partnerId = searchParams.get('partnerId');
  const statusRaw = searchParams.get('status');
  const page      = parseInt(searchParams.get('page')  ?? '1');
  const limit     = parseInt(searchParams.get('limit') ?? '20');

  let statusFilter: VehicleStatus | undefined;
  if (statusRaw) {
    const parsed = vehicleStatusSchema.safeParse(statusRaw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }
    statusFilter = parsed.data;
  }

  const where = {
    storeId: store.id,
    ...(partnerId    ? { partnerId }            : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [vehicles, total] = await prisma.$transaction([
    prisma.vehicle.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        partner: { select: { id: true, name: true, city: true, state: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return NextResponse.json({ vehicles, total, page, limit });
}

// POST /api/gestao/vehicles — cadastro manual
// SEC-02: storeId injetado do servidor, nunca do body
export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const store = await getActiveStore();
  if (!store) return NextResponse.json({ error: 'Store não encontrada' }, { status: 403 });

  try {
    const body  = await req.json();
    const input = CreateVehicleSchema.parse({ ...body, storeId: store.id });

    const partner = await prisma.partner.findUnique({
      where:  { id: input.partnerId },
      select: { id: true, storeId: true },
    });
    if (!partner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }
    if (partner.storeId !== store.id) {
      return NextResponse.json({ error: 'Parceiro não pertence a esta store' }, { status: 403 });
    }

    if (input.externalId) {
      const dup = await prisma.vehicle.findUnique({ where: { externalId: input.externalId } });
      if (dup) {
        return NextResponse.json({ error: `externalId '${input.externalId}' já existe` }, { status: 409 });
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        storeId:      store.id,
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
        videoUrl:     input.videoUrl     ?? null,
        externalId:   input.externalId   ?? null,
        status:       'AVAILABLE',
        lastSyncAt:   new Date(),
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    console.error('[POST /api/gestao/vehicles]', err);
    return NextResponse.json({ error: 'Erro ao criar veículo' }, { status: 500 });
  }
}
