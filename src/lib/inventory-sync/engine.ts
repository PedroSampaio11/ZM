import { prisma } from '@/lib/prisma';
import type { Vehicle } from '@/modules/inventory/types';

export interface InventoryAdapter {
  providerName: string;
  fetchVehicles(externalUrl: string): Promise<Partial<Vehicle>[]>;
}

export interface SyncResult {
  provider: string;
  upserted: number;
  archived: number;
  errors: number;
}

export class AutoCertoAdapter implements InventoryAdapter {
  providerName = 'Auto Certo';

  async fetchVehicles(apiUrl: string): Promise<Partial<Vehicle>[]> {
    console.log(`[${this.providerName}] Consumindo API: ${apiUrl}`);
    // TODO Task 2.2: substituir por fetch real da API do parceiro
    return [
      {
        externalId: 'AC-123',
        brand: 'Mercedes-Benz',
        model: 'C300',
        year: 2023,
        price: 350000,
        mileage: 8000,
        fuel: 'Gasolina',
        transmission: 'Automático',
        images: [],
      },
    ];
  }
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
    url: string
  ): Promise<SyncResult> {
    const adapter = this.adapters[adapterKey];
    if (!adapter) {
      throw new Error(`Adapter '${adapterKey}' não encontrado. Disponíveis: ${this.getAdapterKeys().join(', ')}`);
    }

    const externalVehicles = await adapter.fetchVehicles(url);
    const result: SyncResult = { provider: adapter.providerName, upserted: 0, archived: 0, errors: 0 };

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
            brand: v.brand ?? 'N/A',
            model: v.model ?? 'N/A',
            year: v.year ?? new Date().getFullYear(),
            mileage: v.mileage ?? 0,
            price: v.price ?? 0,
            version: v.version,
            fuel: v.fuel,
            transmission: v.transmission,
            color: v.color,
            description: v.description,
            images: v.images ?? [],
            videoUrl: v.videoUrl,
            externalId: v.externalId,
            status: 'AVAILABLE',
            lastSyncAt: new Date(),
          },
          update: {
            brand: v.brand ?? 'N/A',
            model: v.model ?? 'N/A',
            year: v.year ?? new Date().getFullYear(),
            mileage: v.mileage ?? 0,
            price: v.price ?? 0,
            version: v.version,
            fuel: v.fuel,
            transmission: v.transmission,
            color: v.color,
            description: v.description,
            images: v.images ?? [],
            videoUrl: v.videoUrl,
            lastSyncAt: new Date(),
          },
        });
        result.upserted++;
      } catch (err) {
        console.error(`[SyncEngine] Erro ao upsert externalId=${v.externalId}:`, err);
        result.errors++;
      }
    }

    // Archiva veículos que sumiram do feed externo
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

    console.log(`[SyncEngine] ${adapter.providerName} — parceiro ${partnerId}: upserted=${result.upserted}, archived=${result.archived}, errors=${result.errors}`);
    return result;
  }
}

export const syncEngine = new SyncEngine();
