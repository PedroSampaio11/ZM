import { prisma } from '@/lib/prisma';
import type { Vehicle } from '@/modules/inventory/types';
import { ExternalVehicleSchema } from '@/lib/schemas';
import { AutoCertoAdapter } from './autocerto-adapter';

export interface InventoryAdapter {
  providerName: string;
  fetchVehicles(externalUrl: string): Promise<Partial<Vehicle>[]>;
}

export interface SyncResult {
  provider: string;
  upserted: number;
  archived: number;
  errors: number;
  dryRun: boolean;
  preview?: Partial<Vehicle>[];  // somente quando dryRun=true
}

export class SyncEngine {
  private adapters: Record<string, InventoryAdapter> = {
    autocerto: new AutoCertoAdapter(),
  };

  getAdapterKeys(): string[] {
    return Object.keys(this.adapters);
  }

  async syncPartner(
    partnerId: string,
    adapterKey: string,
    url: string,
    options: { dryRun?: boolean } = {}
  ): Promise<SyncResult> {
    const adapter = this.adapters[adapterKey];
    if (!adapter) {
      throw new Error(
        `Adapter '${adapterKey}' não encontrado. Disponíveis: ${this.getAdapterKeys().join(', ')}`
      );
    }

    const externalVehicles = await adapter.fetchVehicles(url);
    const result: SyncResult = {
      provider: adapter.providerName,
      upserted: 0,
      archived: 0,
      errors: 0,
      dryRun: options.dryRun ?? false,
    };

    // ── Dry-run: retorna preview sem gravar no banco ──────────────────────────
    if (options.dryRun) {
      const validated = externalVehicles.map((v) => ExternalVehicleSchema.safeParse(v));
      result.upserted = validated.filter((r) => r.success).length;
      result.errors = validated.filter((r) => !r.success).length;
      result.preview = externalVehicles;
      console.log(
        `[SyncEngine][DRY-RUN] ${adapter.providerName} — ${result.upserted} veículos encontrados (nada gravado)`
      );
      return result;
    }

    // ── Upsert real ───────────────────────────────────────────────────────────
    for (const v of externalVehicles) {
      const parsed = ExternalVehicleSchema.safeParse(v);
      if (!parsed.success) {
        console.warn(
          `[SyncEngine] Veículo inválido (externalId=${v.externalId ?? 'N/A'}):`,
          parsed.error.flatten().fieldErrors
        );
        result.errors++;
        continue;
      }

      const d = parsed.data;
      try {
        await prisma.vehicle.upsert({
          where: { externalId: d.externalId },
          create: {
            partnerId,
            brand:        d.brand,
            model:        d.model,
            year:         d.year,
            mileage:      d.mileage,
            price:        d.price,
            version:      d.version ?? null,
            fuel:         d.fuel ?? null,
            transmission: d.transmission ?? null,
            color:        d.color ?? null,
            description:  d.description ?? null,
            images:       d.images,
            videoUrl:     d.videoUrl ?? null,
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
            version:      d.version ?? null,
            fuel:         d.fuel ?? null,
            transmission: d.transmission ?? null,
            color:        d.color ?? null,
            description:  d.description ?? null,
            images:       d.images,
            videoUrl:     d.videoUrl ?? null,
            lastSyncAt:   new Date(),
          },
        });
        result.upserted++;
      } catch (err) {
        console.error(`[SyncEngine] Erro ao upsert externalId=${d.externalId}:`, err);
        result.errors++;
      }
    }

    // ── Arquiva veículos que sumiram do feed ──────────────────────────────────
    const externalIds = externalVehicles
      .map((v) => v.externalId)
      .filter((id): id is string => !!id);

    if (externalIds.length > 0) {
      const { count } = await prisma.vehicle.updateMany({
        where: {
          partnerId,
          externalId: { not: null, notIn: externalIds },
          status: 'AVAILABLE',
        },
        data: { status: 'ARCHIVED', lastSyncAt: new Date() },
      });
      result.archived = count;
    }

    console.log(
      `[SyncEngine] ${adapter.providerName} — parceiro ${partnerId}: ` +
      `upserted=${result.upserted}, archived=${result.archived}, errors=${result.errors}`
    );
    return result;
  }
}

export const syncEngine = new SyncEngine();
