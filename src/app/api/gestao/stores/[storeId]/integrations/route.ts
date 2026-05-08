import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { CreateIntegrationSchema } from '@/lib/schemas';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

type Params = { params: Promise<{ storeId: string }> };

// GET /api/admin/stores/[storeId]/integrations
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { storeId } = await params;

  const integrations = await prisma.integrationConfig.findMany({
    where:   { storeId },
    select:  {
      id:             true,
      adapter:        true,
      isActive:       true,
      config:         true,
      lastSyncAt:     true,
      lastSyncStatus: true,
      createdAt:      true,
      // credentials omitidas intencionalmente — nunca retornar na API
      partner: { select: { id: true, name: true, city: true, state: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ integrations });
}

// POST /api/admin/stores/[storeId]/integrations
export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { storeId } = await params;

  try {
    const body  = await req.json();
    const input = CreateIntegrationSchema.parse(body);

    // Garante que o parceiro pertence a esta store
    const partner = await prisma.partner.findUnique({
      where:  { id: input.partnerId },
      select: { id: true, storeId: true },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }
    if (partner.storeId !== storeId) {
      return NextResponse.json({ error: 'Parceiro não pertence a esta store' }, { status: 403 });
    }

    // Verifica duplicata (unique: partnerId + adapter)
    const existing = await prisma.integrationConfig.findUnique({
      where: { partnerId_adapter: { partnerId: input.partnerId, adapter: input.adapter } },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Integração ${input.adapter} já existe para este parceiro` },
        { status: 409 }
      );
    }

    const integration = await prisma.integrationConfig.create({
      data: {
        partnerId:   input.partnerId,
        storeId,
        adapter:     input.adapter,
        credentials: input.credentials as Prisma.InputJsonValue,
        config:      input.config      as Prisma.InputJsonValue,
        isActive:    true,
      },
      select: {
        id: true, adapter: true, isActive: true, config: true, createdAt: true,
        partner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ integration }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    console.error('[POST /api/admin/stores/[storeId]/integrations]', err);
    return NextResponse.json({ error: 'Erro ao criar integração' }, { status: 500 });
  }
}
