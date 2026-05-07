import type { InventoryAdapter, AdapterFetchConfig } from './adapter-registry';

/**
 * Revenda Mais DMS
 * API REST com autenticação via usuário + senha (token JWT).
 * Endpoint base: https://app.revendamais.com.br/api/
 * Documentação: solicitar em https://revendamais.com.br/integradores
 */
export class RevendaMaisAdapter implements InventoryAdapter {
  readonly providerName = 'Revenda Mais';

  private async getToken(username: string, password: string): Promise<string> {
    const res = await fetch('https://app.revendamais.com.br/api/auth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ login: username, senha: password }),
    });

    if (!res.ok) {
      throw new Error(`Revenda Mais: falha na autenticação (${res.status})`);
    }

    const data = await res.json() as { token?: string; access_token?: string };
    const token = data?.token ?? data?.access_token;
    if (!token) throw new Error('Revenda Mais: token não retornado pela API');
    return token;
  }

  async fetchVehicles(fetchConfig: AdapterFetchConfig): Promise<Record<string, unknown>[]> {
    const { credentials } = fetchConfig;
    const username = credentials?.username as string | undefined;
    const password = credentials?.password as string | undefined;

    if (!username || !password) {
      throw new Error('Revenda Mais: informe usuário e senha nas credenciais.');
    }

    const token = await this.getToken(username, password);

    const res = await fetch('https://app.revendamais.com.br/api/estoque', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Revenda Mais API erro ${res.status}: ${await res.text()}`);
    }

    const data = await res.json() as { data?: Record<string, unknown>[]; estoque?: Record<string, unknown>[] };
    const veiculos = data?.data ?? data?.estoque ?? [];

    return veiculos.map((v) => ({
      externalId:   String(v['id'] ?? v['codigo'] ?? ''),
      brand:        String(v['marca'] ?? ''),
      model:        String(v['modelo'] ?? ''),
      version:      (v['versao'] as string) || null,
      year:         Number(v['ano_modelo'] ?? v['ano'] ?? 0),
      mileage:      Number(v['km'] ?? v['quilometragem'] ?? 0),
      price:        Number(v['preco'] ?? v['valor'] ?? 0),
      fuel:         (v['combustivel'] as string) || null,
      transmission: (v['cambio'] as string) || null,
      color:        (v['cor'] as string) || null,
      description:  (v['descricao'] as string) || null,
      images:       Array.isArray(v['imagens']) ? (v['imagens'] as string[]) : [],
      videoUrl:     (v['video_url'] as string) || null,
    }));
  }
}
