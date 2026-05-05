import { fetchEstoque, type AutoCertoVehicle } from './autocerto-client';
import type { InventoryAdapter, AdapterFetchConfig } from './adapter-registry';

function mapVehicle(v: AutoCertoVehicle): Record<string, unknown> {
  const images = (v.Fotos ?? [])
    .sort((a, b) => a.Posicao - b.Posicao)
    .map((f) => f.URL)
    .filter(Boolean);

  return {
    externalId:   String(v.Codigo),
    brand:        v.Marca,
    model:        v.Modelo,
    version:      v.Versao    || null,
    year:         v.AnoModelo,
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

export class AutoCertoAdapter implements InventoryAdapter {
  readonly providerName = 'AutoCerto';

  async fetchVehicles(fetchConfig: AdapterFetchConfig): Promise<Record<string, unknown>[]> {
    const { credentials } = fetchConfig
    const creds = (credentials?.username as string)
      ? { username: credentials.username as string, password: credentials.password as string }
      : undefined
    const raw = await fetchEstoque(creds)
    return raw.map(mapVehicle)
  }
}
