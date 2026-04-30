import { prisma } from '@/lib/prisma';
import type { Vehicle } from '@/modules/inventory/types';
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
      result.preview = externalVehicles;
      result.upserted = externalVehicles.filter((v) => !!v.externalId).length;
      result.errors = externalVehicles.filter((v) => !v.externalId).length;
      console.log(
        `[SyncEngine][DRY-RUN] ${adapter.providerName} — ${result.upserted} veículos encontrados (nada gravado)`
      );
      return result;
    }

    // ── Upsert real ───────────────────────────────────────────────────────────
    for (const v of externalVehicles) {
      if (!v.externalId) {
        result.errors++;
        continue;
      }

      try {
        await prisma.vehicle.upsert({
          where: { externalId: v.externalId },
          create: {
            partnerId,
            brand:        v.brand        ?? 'N/A',
            model:        v.model        ?? 'N/A',
            year:         v.year         ?? new Date().getFullYear(),
            mileage:      v.mileage      ?? 0,
            price:        v.price        ?? 0,
            version:      v.version,
            fuel:         v.fuel,
            transmission: v.transmission,
            color:        v.color,
            description:  v.description,
            images:       v.images       ?? [],
            videoUrl:     v.videoUrl,
            externalId:   v.externalId,
            status:       'AVAILABLE',
            lastSyncAt:   new Date(),
          },
          update: {
            brand:        v.brand        ?? 'N/A',
            model:        v.model        ?? 'N/A',
            year:         v.year         ?? new Date().getFullYear(),
            mileage:      v.mileage      ?? 0,
            price:        v.price        ?? 0,
            version:      v.version,
            fuel:         v.fuel,
            transmission: v.transmission,
            color:        v.color,
            description:  v.description,
            images:       v.images       ?? [],
            videoUrl:     v.videoUrl,
            lastSyncAt:   new Date(),
          },
        });
        result.upserted++;
      } catch (err) {
        console.error(`[SyncEngine] Erro ao upsert externalId=${v.externalId}:`, err);
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
