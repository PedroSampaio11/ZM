import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { SimulationStatus } from '@prisma/client';
import { z, ZodError } from 'zod';

type Params = { params: Promise<{ id: string }> };

const UpdateSimulationSchema = z.object({
  status:   z.nativeEnum(SimulationStatus),
  bankName: z.string().optional(),
});

// GET /api/simulations/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const simulation = await prisma.simulation.findUnique({
    where:   { id },
    include: { lead: { select: { id: true, name: true, phone: true } } },
  });

  if (!simulation) {
    return NextResponse.json({ error: 'Simulação não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ simulation });
}

// PATCH /api/simulations/[id] — aprovar ou rejeitar simulação
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const body  = await req.json();
    const input = UpdateSimulationSchema.parse(body);

    const simulation = await prisma.simulation.update({
      where: { id },
      data:  {
        status:   input.status,
        ...(input.bankName !== undefined ? { bankName: input.bankName } : {}),
      },
    });

    return NextResponse.json({ simulation });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Simulação não encontrada' }, { status: 404 });
    }
    console.error('[PATCH /api/simulations/[id]]', err);
    return NextResponse.json({ error: 'Erro ao atualizar simulação' }, { status: 500 });
  }
}
