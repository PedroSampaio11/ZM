import { fetchEstoque, type AutoCertoVehicle } from './autocerto-client';
import type { InventoryAdapter } from './engine';
import type { Vehicle } from '@/modules/inventory/types';

// ── Mapeamento AutoCerto → Super Loja ─────────────────────────────────────────

function mapVehicle(v: AutoCertoVehicle): Partial<Vehicle> {
  const images = (v.Fotos ?? [])
    .sort((a, b) => a.Posicao - b.Posicao)
    .map((f) => f.URL)
    .filter(Boolean);

  return {
    externalId:   String(v.Codigo),
    brand:        v.Marca,
    model:        v.Modelo,
    version:      v.Versao    || null,
    year:         v.AnoModelo,            // ano do modelo (relevante para comprador)
    mileage:      v.Km,
    price:        v.Preco,
    fuel:         v.Combustivel  || null,
    transmission: v.Cambio       || null,
    color:        v.Cor          || null,
    description:  v.Observacao   || null,
    images,
    videoUrl:     v.UrlVideo     || null,
  };
}

// ── Adapter ───────────────────────────────────────────────────────────────────

export class AutoCertoAdapter implements InventoryAdapter {
  providerName = 'AutoCerto';

  async fetchVehicles(_url: string): Promise<Partial<Vehicle>[]> {
    const raw = await fetchEstoque();
    return raw.map(mapVehicle);
  }
}
