import type { InventoryAdapter, AdapterFetchConfig } from './adapter-registry';

/**
 * Motor21 — Plataforma integradora de DMS
 * API REST com autenticação via clientId + clientSecret (OAuth2 client_credentials).
 * Endpoint base: https://api.motor21.com.br/
 * Documentação: https://docs.motor21.com.br — solicitar acesso em contato@motor21.com.br
 */
export class Motor21Adapter implements InventoryAdapter {
  readonly providerName = 'Motor21';

  private async getToken(clientId: string, clientSecret: string): Promise<string> {
    const res = await fetch('https://api.motor21.com.br/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) {
      throw new Error(`Motor21: falha na autenticação OAuth2 (${res.status})`);
    }

    const data = await res.json() as { access_token?: string };
    if (!data?.access_token) throw new Error('Motor21: access_token não retornado');
    return data.access_token;
  }

  async fetchVehicles(fetchConfig: AdapterFetchConfig): Promise<Record<string, unknown>[]> {
    const { credentials } = fetchConfig;
    const clientId     = credentials?.clientId     as string | undefined;
    const clientSecret = credentials?.clientSecret as string | undefined;

    if (!clientId || !clientSecret) {
      throw new Error('Motor21: informe clientId e clientSecret nas credenciais.');
    }

    const token = await this.getToken(clientId, clientSecret);

    const res = await fetch('https://api.motor21.com.br/v1/veiculos?status=DISPONIVEL&per_page=500', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Motor21 API erro ${res.status}: ${await res.text()}`);
    }

    const data = await res.json() as { veiculos?: Record<string, unknown>[] };
    const veiculos = data?.veiculos ?? [];

    return veiculos.map((v) => ({
      externalId:   String(v['id'] ?? ''),
      brand:        String(v['marca'] ?? ''),
      model:        String(v['modelo'] ?? ''),
      version:      (v['versao'] as string) || null,
      year:         Number(v['ano_modelo'] ?? 0),
      mileage:      Number(v['quilometragem'] ?? 0),
      price:        Number(v['preco_venda'] ?? v['preco'] ?? 0),
      fuel:         (v['tipo_combustivel'] as string) || null,
      transmission: (v['tipo_cambio'] as string) || null,
      color:        (v['cor'] as string) || null,
      description:  (v['observacoes'] as string) || null,
      images:       Array.isArray(v['fotos'])
        ? (v['fotos'] as Array<{ url?: string }>).map((f) => f?.url ?? '').filter(Boolean)
        : [],
      videoUrl:     (v['url_video'] as string) || null,
    }));
  }
}
