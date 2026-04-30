import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { syncEngine } from '@/lib/inventory-sync/engine';
import { prisma } from '@/lib/prisma';
import { ZodError, z } from 'zod';

const SyncRequestSchema = z.object({
  partnerId: z.string().cuid('partnerId deve ser um CUID válido'),
  adapterKey: z.string().min(1, 'adapterKey é obrigatório'),
  dryRun: z.boolean().default(true), // true por padrão — seguro para testes
});

// POST /api/admin/sync — Dispara a sincronização de estoque de um parceiro
export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const { partnerId, adapterKey, dryRun } = SyncRequestSchema.parse(body);

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true, scrapingUrl: true, isActive: true },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }

    if (!partner.isActive) {
      return NextResponse.json({ error: 'Parceiro está inativo' }, { status: 400 });
    }

    if (!partner.scrapingUrl) {
      return NextResponse.json(
        { error: 'Parceiro não possui URL de scraping configurada' },
        { status: 400 }
      );
    }

    const result = await syncEngine.syncPartner(partnerId, adapterKey, partner.scrapingUrl, { dryRun });

    return NextResponse.json({
      success: true,
      partner: partner.name,
      ...result,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[POST /api/admin/sync]', err);
    return NextResponse.json({ error: 'Erro ao sincronizar inventário' }, { status: 500 });
  }
}

// GET /api/admin/sync — Lista adaptadores disponíveis
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  return NextResponse.json({
    adapters: syncEngine.getAdapterKeys(),
  });
}
