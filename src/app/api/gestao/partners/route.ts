import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { CreatePartnerSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

// GET /api/admin/partners?storeId=xxx
export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const storeId  = req.nextUrl.searchParams.get('storeId');
  const onlyActive = req.nextUrl.searchParams.get('active') !== 'false';

  if (!storeId) {
    return NextResponse.json({ error: 'storeId é obrigatório' }, { status: 400 });
  }

  const partners = await prisma.partner.findMany({
    where:   { storeId, ...(onlyActive ? { isActive: true } : {}) },
    orderBy: { name: 'asc' },
    select:  {
      id:         true,
      name:       true,
      document:   true,
      email:      true,
      phone:      true,
      city:       true,
      state:      true,
      commission: true,
      isActive:   true,
      createdAt:  true,
      _count:     { select: { vehicles: true, leads: true } },
      integrations: {
        select: { id: true, adapter: true, isActive: true, lastSyncAt: true, lastSyncStatus: true },
      },
    },
  });

  return NextResponse.json({ partners });
}

// POST /api/admin/partners
export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body  = await req.json();
    const input = CreatePartnerSchema.parse(body);

    const store = await prisma.store.findUnique({
      where:  { id: input.storeId },
      select: { id: true, isActive: true },
    });
    if (!store) {
      return NextResponse.json({ error: 'Store não encontrada' }, { status: 404 });
    }
    if (!store.isActive) {
      return NextResponse.json({ error: 'Store está inativa' }, { status: 400 });
    }

    const existing = await prisma.partner.findUnique({ where: { document: input.document } });
    if (existing) {
      return NextResponse.json({ error: `CNPJ ${input.document} já cadastrado` }, { status: 409 });
    }

    const partner = await prisma.partner.create({
      data: {
        storeId:    input.storeId,
        name:       input.name,
        document:   input.document,
        email:      input.email    ?? null,
        phone:      input.phone    ?? null,
        address:    input.address  ?? null,
        city:       input.city,
        state:      input.state,
        commission: input.commission,
        isActive:   true,
      },
    });

    return NextResponse.json({ partner }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    console.error('[POST /api/admin/partners]', err);
    return NextResponse.json({ error: 'Erro ao criar parceiro' }, { status: 500 });
  }
}
