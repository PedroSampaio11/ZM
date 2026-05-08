import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { CreatePartnerSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

type Params = { params: Promise<{ id: string }> };

const UpdatePartnerSchema = CreatePartnerSchema.omit({ storeId: true, document: true }).partial();

// GET /api/admin/partners/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const partner = await prisma.partner.findUnique({
    where:   { id },
    include: {
      integrations: { select: { id: true, adapter: true, isActive: true, lastSyncAt: true, lastSyncStatus: true } },
      _count:       { select: { vehicles: true, leads: true } },
    },
  });

  if (!partner) {
    return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ partner });
}

// PATCH /api/admin/partners/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const body  = await req.json();
    const input = UpdatePartnerSchema.parse(body);

    const partner = await prisma.partner.update({
      where: { id },
      data:  input,
    });

    return NextResponse.json({ partner });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }
    console.error('[PATCH /api/admin/partners/[id]]', err);
    return NextResponse.json({ error: 'Erro ao atualizar parceiro' }, { status: 500 });
  }
}

// DELETE /api/admin/partners/[id] — desativa (soft delete)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.partner.update({
      where: { id },
      data:  { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }
    console.error('[DELETE /api/admin/partners/[id]]', err);
    return NextResponse.json({ error: 'Erro ao desativar parceiro' }, { status: 500 });
  }
}
