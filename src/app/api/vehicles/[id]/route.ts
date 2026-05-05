import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/vehicles/[id] — Detalhe público de veículo (vitrine)
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id, status: 'AVAILABLE' },
    include: {
      partner: { select: { name: true, city: true, state: true, phone: true } },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ vehicle });
}
