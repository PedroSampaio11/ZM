import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { syncStore, syncPartner, ADAPTER_DISPLAY_NAMES } from '@/lib/inventory-sync/engine';
import { prisma } from '@/lib/prisma';
import { ZodError, z } from 'zod';

// Aceita sync por loja inteira OU por integração específica
const SyncByStoreSchema = z.object({
  storeId: z.string().cuid(),
  dryRun:  z.boolean().default(true),
});

const SyncByIntegrationSchema = z.object({
  integrationConfigId: z.string().cuid(),
  dryRun:              z.boolean().default(true),
});

const SyncBodySchema = z.union([SyncByStoreSchema, SyncByIntegrationSchema]);

// POST /api/admin/sync
export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body  = await req.json();
    const input = SyncBodySchema.parse(body);

    // ── Sync por integração específica ────────────────────────────────────────
    if ('integrationConfigId' in input) {
      const integration = await prisma.integrationConfig.findUnique({
        where:  { id: input.integrationConfigId },
        select: { partnerId: true, adapter: true, credentials: true, config: true, isActive: true },
      });

      if (!integration) {
        return NextResponse.json({ error: 'IntegrationConfig não encontrada' }, { status: 404 });
      }
      if (!integration.isActive) {
        return NextResponse.json({ error: 'Integração está inativa' }, { status: 400 });
      }

      const result = await syncPartner(
        integration.partnerId,
        integration.adapter,
        {
          credentials: integration.credentials as Record<string, string>,
          config:      integration.config as Record<string, unknown>,
        },
        { dryRun: input.dryRun }
      );

      return NextResponse.json({ success: true, ...result });
    }

    // ── Sync por store (todos os parceiros ativos) ─────────────────────────────
    const store = await prisma.store.findUnique({
      where:  { id: input.storeId },
      select: { id: true, name: true, isActive: true },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store não encontrada' }, { status: 404 });
    }
    if (!store.isActive) {
      return NextResponse.json({ error: 'Store está inativa' }, { status: 400 });
    }

    const result = await syncStore(input.storeId, { dryRun: input.dryRun });
    return NextResponse.json({ success: true, ...result });

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

// GET /api/admin/sync — Lista adapters disponíveis e suas integrações ativas
export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const storeId = req.nextUrl.searchParams.get('storeId');

  const adapters = Object.entries(ADAPTER_DISPLAY_NAMES).map(([key, label]) => ({
    key,
    label,
  }));

  if (!storeId) {
    return NextResponse.json({ adapters });
  }

  const integrations = await prisma.integrationConfig.findMany({
    where:   { storeId, isActive: true },
    select:  {
      id:             true,
      adapter:        true,
      isActive:       true,
      lastSyncAt:     true,
      lastSyncStatus: true,
      partner:        { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ adapters, integrations });
}
