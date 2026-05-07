import type { InventoryAdapter, AdapterFetchConfig } from './adapter-registry';

/**
 * Cockpit DMS (CDK Global Brasil)
 * API REST com autenticação via API Key + empresa ID.
 * Endpoint base: https://api.cockpit.com.br/v1/
 * Documentação: solicitar ao suporte Cockpit via contato@cdkglobal.com.br
 */
export class CockpitAdapter implements InventoryAdapter {
  readonly providerName = 'Cockpit DMS';

  async fetchVehicles(fetchConfig: AdapterFetchConfig): Promise<Record<string, unknown>[]> {
    const { credentials } = fetchConfig;
    const apiKey    = credentials?.apiKey    as string | undefined;
    const empresaId = credentials?.empresaId as string | undefined;

    if (!apiKey || !empresaId) {
      throw new Error('Cockpit: credenciais incompletas. Informe apiKey e empresaId.');
    }

    const res = await fetch(
      `https://api.cockpit.com.br/v1/estoque/veiculos?empresaId=${empresaId}&status=disponivel`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type':  'application/json',
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Cockpit API erro ${res.status}: ${await res.text()}`);
    }

    const data = await res.json() as { veiculos?: Record<string, unknown>[] };
    const veiculos = data?.veiculos ?? [];

    return veiculos.map((v) => ({
      externalId:   String(v['id'] ?? v['codigo'] ?? ''),
      brand:        String(v['marca'] ?? ''),
      model:        String(v['modelo'] ?? ''),
      version:      (v['versao'] as string) || null,
      year:         Number(v['anoModelo'] ?? v['ano'] ?? 0),
      mileage:      Number(v['quilometragem'] ?? v['km'] ?? 0),
      price:        Number(v['preco'] ?? v['valorVenda'] ?? 0),
      fuel:         (v['combustivel'] as string) || null,
      transmission: (v['cambio'] as string) || null,
      color:        (v['cor'] as string) || null,
      description:  (v['observacao'] as string) || null,
      images:       Array.isArray(v['fotos']) ? (v['fotos'] as string[]) : [],
      videoUrl:     null,
    }));
  }
}
