import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateLeadSchema } from '@/lib/schemas';
import { requireAuth } from '@/lib/auth-guard';
import { rateLimit } from '@/lib/rate-limit';
import { LeadStatus } from '@prisma/client';
import { ZodError, z } from 'zod';

const leadStatusSchema = z.nativeEnum(LeadStatus);

// POST /api/leads — Captura um novo lead
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { maxRequests: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const data = CreateLeadSchema.parse(body);

    const existing = await prisma.lead.findFirst({
      where: { phone: data.phone },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Lead já registrado com este telefone', leadId: existing.id },
        { status: 409 }
      );
    }

    // storeId vem do body, ou cai no primeiro store ativo (dev fallback)
    let storeId = data.storeId;
    if (!storeId) {
      const defaultStore = await prisma.store.findFirst({
        where: { isActive: true },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!defaultStore) {
        return NextResponse.json({ error: 'Nenhuma store ativa encontrada' }, { status: 400 });
      }
      storeId = defaultStore.id;
    }

    const lead = await prisma.lead.create({
      data: {
        storeId,
        name:      data.name,
        phone:     data.phone,
        email:     data.email,
        origin:    data.origin,
        vehicleId: data.vehicleId,
        interactions: data.message
          ? {
              create: {
                channel:   'WHATSAPP' as const,
                direction: 'INBOUND' as const,
                content:   data.message,
              },
            }
          : undefined,
      },
      include: { interactions: true },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('[POST /api/leads]', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET /api/leads — Lista leads com filtros opcionais (requer autenticação)
export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');

    let statusFilter: LeadStatus | undefined;
    if (statusParam) {
      const parsed = leadStatusSchema.safeParse(statusParam);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
      }
      statusFilter = parsed.data;
    }

    const where = statusFilter ? { status: statusFilter } : undefined;

    const [leads, total] = await prisma.$transaction([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          vehicle: { select: { brand: true, model: true, year: true } },
          partner: { select: { name: true } },
          _count: { select: { interactions: true, simulations: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({ leads, total, page, limit });
  } catch (error) {
    console.error('[GET /api/leads]', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
