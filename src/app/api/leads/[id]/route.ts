import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { LeadStatus } from '@prisma/client';
import { ZodError, z } from 'zod';

const PatchLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  score: z.number().int().min(0).max(100).optional(),
  summary: z.string().max(2000).optional(),
}).refine((d) => d.status !== undefined || d.score !== undefined || d.summary !== undefined, {
  message: 'Forneça pelo menos um campo para atualizar',
});

// PATCH /api/leads/[id] — Atualiza status, score ou summary de um lead
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const data = PatchLeadSchema.parse(body);

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.score !== undefined && { score: data.score }),
        ...(data.summary !== undefined && { summary: data.summary }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(lead);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }
    console.error(`[PATCH /api/leads/${id}]`, err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/leads/[id] — Remove um lead (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.lead.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }
    console.error(`[DELETE /api/leads/${id}]`, err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
