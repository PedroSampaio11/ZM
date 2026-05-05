import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { ZodError, z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const CreateInteractionSchema = z.object({
  channel:   z.enum(['WHATSAPP', 'EMAIL', 'PHONE', 'INTERNAL']),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  content:   z.string().min(1).max(10000),
});

// GET /api/leads/[id]/interactions
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const interactions = await prisma.interaction.findMany({
    where:   { leadId: id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ interactions });
}

// POST /api/leads/[id]/interactions
export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id: leadId } = await params;

  try {
    const body  = await req.json();
    const input = CreateInteractionSchema.parse(body);

    const lead = await prisma.lead.findUnique({
      where:  { id: leadId },
      select: { id: true },
    });
    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    const interaction = await prisma.interaction.create({
      data: {
        leadId:    leadId,
        channel:   input.channel,
        direction: input.direction,
        content:   input.content,
      },
    });

    return NextResponse.json({ interaction }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    console.error('[POST /api/leads/[id]/interactions]', err);
    return NextResponse.json({ error: 'Erro ao registrar interação' }, { status: 500 });
  }
}
