// Cliente OAuth2 para a API AutoCerto
// Baseado na integração de https://integracao.autocerto.com
// SOMENTE leitura — nenhum endpoint de escrita é chamado aqui.

const API_BASE = process.env.AUTOCERTO_API_BASE_URL ?? 'https://integracao.autocerto.com';
const USERNAME = process.env.AUTOCERTO_API_USERNAME ?? '';
const PASSWORD = process.env.AUTOCERTO_API_PASSWORD ?? '';

// ── Tipos AutoCerto ───────────────────────────────────────────────────────────

export interface AutoCertoVehicle {
  Codigo: number;
  Marca: string;
  Modelo: string;
  Versao: string;
  AnoFabricacao: number;
  AnoModelo: number;
  Km: number;
  Preco: number;
  PrecoClassificados: number;
  Combustivel: string;
  Cambio: string;
  Cor: string;
  Observacao: string;
  UrlVideo: string;
  Destaque: boolean;
  ZeroKm: boolean;
  TipoVeiculo: string;
  Categoria: string;
  Placa: string;
  Fotos: Array<{ Codigo: number; URL: string; Posicao: number }>;
  Opcionais: Array<{ Codigo: number; Descricao: string }>;
  DataCadastro: string;
  DataModificacao: string;
}

export interface AutoCertoFilters {
  codigoUnidade?: number;
  IdMarca?: number;
  IdModelo?: number;
  anoDe?: number;
  anoAte?: number;
  precoDe?: number;
  precoAte?: number;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

// ── Token Manager ─────────────────────────────────────────────────────────────

let tokenCache: TokenCache | null = null;

async function getToken(): Promise<string> {
  // Retorna do cache se ainda é válido (com 5 min de margem)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60_000) {
    return tokenCache.token;
  }

  if (!USERNAME || !PASSWORD) {
    throw new Error('AUTOCERTO_API_USERNAME e AUTOCERTO_API_PASSWORD não configurados no .env.local');
  }

  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'password', username: USERNAME, password: PASSWORD }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`AutoCerto auth failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.token;
}

// ── Fetcher autenticado com retry em 401 ──────────────────────────────────────

async function authedFetch(path: string): Promise<Response> {
  const token = await getToken();

  const doFetch = (t: string) =>
    fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    tokenCache = null;
    const fresh = await getToken();
    res = await doFetch(fresh);
  }

  return res;
}

// ── API pública (somente GET) ─────────────────────────────────────────────────

export async function fetchEstoque(filters?: AutoCertoFilters): Promise<AutoCertoVehicle[]> {
  const params = new URLSearchParams();
  if (filters?.codigoUnidade) params.set('codigoUnidade', String(filters.codigoUnidade));
  if (filters?.IdMarca)       params.set('IdMarca',       String(filters.IdMarca));
  if (filters?.IdModelo)      params.set('IdModelo',      String(filters.IdModelo));
  if (filters?.anoDe)         params.set('anoDe',         String(filters.anoDe));
  if (filters?.anoAte)        params.set('anoAte',        String(filters.anoAte));
  if (filters?.precoDe)       params.set('precoDe',       String(filters.precoDe));
  if (filters?.precoAte)      params.set('precoAte',      String(filters.precoAte));

  const qs = params.toString();
  const res = await authedFetch(`/api/Veiculo/ObterEstoque${qs ? `?${qs}` : ''}`);

  if (!res.ok) {
    throw new Error(`ObterEstoque falhou: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<AutoCertoVehicle[]>;
}
