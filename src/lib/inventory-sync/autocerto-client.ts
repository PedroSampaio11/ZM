const API_BASE = process.env.AUTOCERTO_API_BASE_URL ?? 'https://integracao.autocerto.com'

export interface AutoCertoVehicle {
  Codigo: number
  Marca: string
  Modelo: string
  Versao: string
  AnoFabricacao: number
  AnoModelo: number
  Km: number
  Preco: number
  PrecoClassificados: number
  Combustivel: string
  Cambio: string
  Cor: string
  Observacao: string
  UrlVideo: string
  Destaque: boolean
  ZeroKm: boolean
  TipoVeiculo: string
  Categoria: string
  Placa: string
  Fotos: Array<{ Codigo: number; URL: string; Posicao: number }>
  Opcionais: Array<{ Codigo: number; Descricao: string }>
  DataCadastro: string
  DataModificacao: string
}

export interface AutoCertoFilters {
  codigoUnidade?: number
  IdMarca?: number
  IdModelo?: number
  anoDe?: number
  anoAte?: number
  precoDe?: number
  precoAte?: number
}

interface TokenEntry { token: string; expiresAt: number }

const tokenCaches = new Map<string, TokenEntry>()

async function getToken(username: string, password: string): Promise<string> {
  const cached = tokenCaches.get(username)
  if (cached && cached.expiresAt > Date.now() + 5 * 60_000) return cached.token

  const res = await fetch(`${API_BASE}/oauth/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ grant_type: 'password', username, password }),
    signal:  AbortSignal.timeout(15_000),
  })

  if (!res.ok) throw new Error(`AutoCerto auth failed: ${res.status} ${res.statusText}`)

  const data = await res.json() as { access_token: string; expires_in: number }
  const entry: TokenEntry = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  tokenCaches.set(username, entry)
  return entry.token
}

async function authedFetch(path: string, username: string, password: string): Promise<Response> {
  const token    = await getToken(username, password)
  const doFetch  = (t: string) => fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    signal:  AbortSignal.timeout(30_000),
  })
  let res = await doFetch(token)
  if (res.status === 401) {
    tokenCaches.delete(username)
    res = await doFetch(await getToken(username, password))
  }
  return res
}

export async function fetchEstoque(
  credentials?: { username: string; password: string },
  filters?: AutoCertoFilters,
): Promise<AutoCertoVehicle[]> {
  const username = credentials?.username ?? process.env.AUTOCERTO_API_USERNAME ?? ''
  const password = credentials?.password ?? process.env.AUTOCERTO_API_PASSWORD ?? ''

  if (!username || !password) throw new Error('Credenciais AutoCerto não configuradas')

  const params = new URLSearchParams()
  if (filters?.codigoUnidade) params.set('codigoUnidade', String(filters.codigoUnidade))
  if (filters?.IdMarca)       params.set('IdMarca',       String(filters.IdMarca))
  if (filters?.IdModelo)      params.set('IdModelo',      String(filters.IdModelo))
  if (filters?.anoDe)         params.set('anoDe',         String(filters.anoDe))
  if (filters?.anoAte)        params.set('anoAte',        String(filters.anoAte))
  if (filters?.precoDe)       params.set('precoDe',       String(filters.precoDe))
  if (filters?.precoAte)      params.set('precoAte',      String(filters.precoAte))

  const qs  = params.toString()
  const res = await authedFetch(`/api/Veiculo/ObterEstoque${qs ? `?${qs}` : ''}`, username, password)

  if (!res.ok) throw new Error(`ObterEstoque falhou: ${res.status} ${res.statusText}`)
  return res.json() as Promise<AutoCertoVehicle[]>
}
