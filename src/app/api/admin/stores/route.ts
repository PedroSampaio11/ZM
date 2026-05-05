import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { CreateStoreSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

// GET /api/admin/stores — Lista todas as stores
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const stores = await prisma.store.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id:        true,
      name:      true,
      slug:      true,
      document:  true,
      plan:      true,
      isActive:  true,
      createdAt: true,
      _count: {
        select: { partners: true, vehicles: true, leads: true },
      },
    },
  });

  return NextResponse.json({ stores });
}

// POST /api/admin/stores — Cria uma nova store (tenant)
export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body  = await req.json();
    const input = CreateStoreSchema.parse(body);

    const slugTaken = await prisma.store.findUnique({ where: { slug: input.slug } });
    if (slugTaken) {
      return NextResponse.json({ error: `Slug '${input.slug}' já está em uso` }, { status: 409 });
    }

    const store = await prisma.store.create({
      data: {
        name:     input.name,
        slug:     input.slug,
        document: input.document ?? null,
        plan:     input.plan,
        isActive: true,
      },
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    console.error('[POST /api/admin/stores]', err);
    return NextResponse.json({ error: 'Erro ao criar store' }, { status: 500 });
  }
}
