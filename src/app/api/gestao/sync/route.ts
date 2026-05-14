import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { getActiveStore } from '@/lib/get-store';
import { syncStore, syncPartner, ADAPTER_DISPLAY_NAMES } from '@/lib/inventory-sync/engine';
import { prisma } from '@/lib/prisma';
import { ZodError, z } from 'zod';

const SyncByStoreSchema = z.object({
  storeId: z.string().cuid(),
  dryRun:  z.boolean().default(true),
});

const SyncByIntegrationSchema = z.object({
  integrationConfigId: z.string().cuid(),
  dryRun:              z.boolean().default(true),
});

const SyncBodySchema = z.union([SyncByStoreSchema, SyncByIntegrationSchema]);

// POST /api/gestao/sync
export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  // SEC-10: resolve store do usuário no servidor — nunca confia no body para autorização
  const store = await getActiveStore();
  if (!store) return NextResponse.json({ error: 'Store não encontrada' }, { status: 403 });

  try {
    const body  = await req.json();
    const input = SyncBodySchema.parse(body);

    // ── Sync por integração específica ────────────────────────────────────────
    if ('integrationConfigId' in input) {
      const integration = await prisma.integrationConfig.findUnique({
        where:  { id: input.integrationConfigId },
        select: { partnerId: true, adapter: true, credentials: true, config: true, isActive: true, storeId: true },
      });

      if (!integration) {
        return NextResponse.json({ error: 'IntegrationConfig não encontrada' }, { status: 404 });
      }
      // SEC-10: verifica que a integração pertence à store do usuário autenticado
      if (integration.storeId !== store.id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
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

    // ── Sync por store ─────────────────────────────────────────────────────────
    // SEC-10: storeId do body deve corresponder à store do usuário autenticado
    if (input.storeId !== store.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (!store.isActive) {
      return NextResponse.json({ error: 'Store está inativa' }, { status: 400 });
    }

    const result = await syncStore(store.id, { dryRun: input.dryRun });
    return NextResponse.json({ success: true, ...result });

  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[POST /api/gestao/sync]', err);
    return NextResponse.json({ error: 'Erro ao sincronizar inventário' }, { status: 500 });
  }
}

// GET /api/gestao/sync — Lista adapters e integrações da store autenticada
export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const store = await getActiveStore();
  if (!store) return NextResponse.json({ error: 'Store não encontrada' }, { status: 403 });

  const adapters = Object.entries(ADAPTER_DISPLAY_NAMES).map(([key, label]) => ({
    key,
    label,
  }));

  const storeIdParam = req.nextUrl.searchParams.get('storeId');

  // Ignora storeId do query param — usa sempre a store do usuário autenticado
  void storeIdParam;

  const integrations = await prisma.integrationConfig.findMany({
    where:   { storeId: store.id, isActive: true },
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
