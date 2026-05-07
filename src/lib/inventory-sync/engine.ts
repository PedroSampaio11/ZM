import { prisma } from '@/lib/prisma';
import { ExternalVehicleSchema } from '@/lib/schemas';
import { getAdapter } from './adapter-registry';
import { decryptCredentials } from './credentials';
import type { AdapterType } from '@prisma/client';

export interface SyncResult {
  provider: string;
  partnerId: string;
  partnerName: string;
  upserted: number;
  archived: number;
  errors: number;
  dryRun: boolean;
  preview?: Record<string, unknown>[];
}

export interface StoreSyncResult {
  storeId: string;
  storeName: string;
  results: SyncResult[];
  totalUpserted: number;
  totalArchived: number;
  totalErrors: number;
}

// ── Sync por parceiro individual ──────────────────────────────────────────────

export async function syncPartner(
  partnerId: string,
  adapterType: AdapterType,
  adapterConfig: { credentials: Record<string, string>; config: Record<string, unknown> },
  options: { dryRun?: boolean } = {}
): Promise<SyncResult> {
  const partner = await prisma.partner.findUniqueOrThrow({
    where: { id: partnerId },
    select: { id: true, name: true, storeId: true },
  });

  const adapter = getAdapter(adapterType);

  const decryptedCredentials = decryptCredentials(
    adapterConfig.credentials as Record<string, unknown>,
  );
  const externalVehicles = await adapter.fetchVehicles({
    ...adapterConfig,
    credentials: decryptedCredentials,
  });
  const result: SyncResult = {
    provider:    adapter.providerName,
    partnerId:   partner.id,
    partnerName: partner.name,
    upserted:    0,
    archived:    0,
    errors:      0,
    dryRun:      options.dryRun ?? false,
  };

  if (options.dryRun) {
    const validated = externalVehicles.map((v) => ExternalVehicleSchema.safeParse(v));
    result.upserted = validated.filter((r) => r.success).length;
    result.errors   = validated.filter((r) => !r.success).length;
    result.preview  = externalVehicles;
    console.log(`[SyncEngine][DRY-RUN] ${adapter.providerName}/${partner.name} — ${result.upserted} veículos (nada gravado)`);
    return result;
  }

  for (const v of externalVehicles) {
    const parsed = ExternalVehicleSchema.safeParse(v);
    if (!parsed.success) {
      console.warn(`[SyncEngine] Veículo inválido (externalId=${v['externalId'] ?? 'N/A'}):`, parsed.error.flatten().fieldErrors);
      result.errors++;
      continue;
    }

    const d = parsed.data;
    try {
      await prisma.vehicle.upsert({
        where:  { externalId: d.externalId },
        create: {
          storeId:      partner.storeId,
          partnerId:    partner.id,
          brand:        d.brand,
          model:        d.model,
          year:         d.year,
          mileage:      d.mileage,
          price:        d.price,
          version:      d.version      ?? null,
          fuel:         d.fuel         ?? null,
          transmission: d.transmission ?? null,
          color:        d.color        ?? null,
          description:  d.description  ?? null,
          images:       d.images,
          videoUrl:     d.videoUrl     ?? null,
          externalId:   d.externalId,
          status:       'AVAILABLE',
          lastSyncAt:   new Date(),
        },
        update: {
          brand:        d.brand,
          model:        d.model,
          year:         d.year,
          mileage:      d.mileage,
          price:        d.price,
          version:      d.version      ?? null,
          fuel:         d.fuel         ?? null,
          transmission: d.transmission ?? null,
          color:        d.color        ?? null,
          description:  d.description  ?? null,
          images:       d.images,
          videoUrl:     d.videoUrl     ?? null,
          lastSyncAt:   new Date(),
        },
      });
      result.upserted++;
    } catch (err) {
      console.error(`[SyncEngine] Erro upsert externalId=${d.externalId}:`, err);
      result.errors++;
    }
  }

  // Arquiva veículos que sumiram do feed
  const externalIds = externalVehicles
    .map((v) => v['externalId'])
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  if (externalIds.length > 0) {
    const { count } = await prisma.vehicle.updateMany({
      where: { partnerId, externalId: { not: null, notIn: externalIds }, status: 'AVAILABLE' },
      data:  { status: 'ARCHIVED', lastSyncAt: new Date() },
    });
    result.archived = count;
  }

  // Persiste resultado na config de integração
  await prisma.integrationConfig.updateMany({
    where: { partnerId, adapter: adapterType },
    data:  {
      lastSyncAt:     new Date(),
      lastSyncStatus: result.errors > 0
        ? `PARCIAL: ${result.upserted} ok, ${result.errors} erros`
        : 'OK',
    },
  });

  console.log(`[SyncEngine] ${adapter.providerName}/${partner.name}: upserted=${result.upserted}, archived=${result.archived}, errors=${result.errors}`);
  return result;
}

// ── Sync por store (todos os parceiros ativos) ────────────────────────────────

export async function syncStore(
  storeId: string,
  options: { dryRun?: boolean } = {}
): Promise<StoreSyncResult> {
  const store = await prisma.store.findUniqueOrThrow({
    where: { id: storeId },
    select: { id: true, name: true },
  });

  const integrations = await prisma.integrationConfig.findMany({
    where:  { storeId, isActive: true, adapter: { not: 'MANUAL' } },
    select: { partnerId: true, adapter: true, credentials: true, config: true },
  });

  const results: SyncResult[] = [];

  for (const integration of integrations) {
    try {
      const result = await syncPartner(
        integration.partnerId,
        integration.adapter,
        {
          credentials: decryptCredentials(integration.credentials as Record<string, unknown>),
          config:      integration.config as Record<string, unknown>,
        },
        options
      );
      results.push(result);
    } catch (err) {
      console.error(`[SyncStore] Erro no parceiro ${integration.partnerId}:`, err);
      results.push({
        provider:    String(integration.adapter),
        partnerId:   integration.partnerId,
        partnerName: integration.partnerId,
        upserted:    0,
        archived:    0,
        errors:      1,
        dryRun:      options.dryRun ?? false,
      });
    }
  }

  return {
    storeId:       store.id,
    storeName:     store.name,
    results,
    totalUpserted: results.reduce((s, r) => s + r.upserted, 0),
    totalArchived: results.reduce((s, r) => s + r.archived, 0),
    totalErrors:   results.reduce((s, r) => s + r.errors, 0),
  };
}

// ── Lista adapters disponíveis ─────────────────────────────────────────────────

export { ADAPTER_REGISTRY, ADAPTER_DISPLAY_NAMES } from './adapter-registry';
