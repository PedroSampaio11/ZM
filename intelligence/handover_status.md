# Handover Status — motorz
**Data**: 2026-05-07 | **Sessão**: 4 | **TypeScript**: 0 erros ✅

---

## O Que É Este Projeto

Marketplace automotivo B2B/B2C asset-light.
- Pedro cadastra lojas parceiras (concessionárias), configura o DMS delas
- Sistema sincroniza estoque automaticamente
- Pedro vende os carros e recebe comissão por venda

**Sócios**: Pedro (Tech), Vitor (Growth), Lico (Operações/Bancário)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, Server Components + Server Actions) |
| Linguagem | TypeScript 5.7 estrito |
| Banco | PostgreSQL via Supabase (Prisma ORM) |
| Auth | Supabase Auth (`createClient` server-side) |
| UI | Tailwind CSS + shadcn/ui via `cn()` |
| Validação | Zod em `src/lib/schemas.ts` |
| DMS Adapters | AutoCerto ✅, Cockpit ✅, Revenda Mais ✅, Motor21 ✅, Manual ✅ |
| Segurança | AES-256-GCM para credenciais, rate limiting, auth guard |

---

## Páginas Admin (todas funcionando)

| Rota | Arquivo | O que faz |
|---|---|---|
| `/admin` | `admin/page.tsx` | Overview: stats reais, leads recentes, status de sync |
| `/admin/inventory` | `admin/inventory/page.tsx` | Grid de veículos, filtros, tabs por status |
| `/admin/inventory/[id]` | `admin/inventory/[id]/page.tsx` | Detalhe do veículo, alterar status, leads vinculados |
| `/admin/lojas` | `admin/lojas/page.tsx` | Cadastrar parceiros, configurar DMS, sincronizar |
| `/admin/financeiro` | `admin/financeiro/page.tsx` | Portfólio por loja, metas, receita, ranking |
| `/admin/leads` | `admin/leads/page.tsx` | Lista de leads |
| `/admin/leads/[id]` | `admin/leads/[id]/page.tsx` | Detalhe, timeline, status, interações |

---

## Arquivos Críticos

### Helpers principais
- `src/lib/get-store.ts` — `getActiveStore()`: lê storeId do Supabase Auth user_metadata, fallback findFirst
- `src/lib/inventory-sync/credentials.ts` — `encryptCredentials()` / `decryptCredentials()` (AES-256-GCM)

### Server Actions
- `src/lib/partner-actions.ts` — `createLoja`, `syncPartnerNow`, `updateLoja`, `deleteLoja`, `updatePartnerFinancial`
- `src/lib/vehicle-actions.ts` — `createVehicle`, `updateVehicleStatus`, `archiveVehicle`
- `src/lib/lead-actions.ts` — `createLead`
- `src/lib/store-actions.ts` — `createStore`, `updateStore`

### DMS Integration
- `src/lib/inventory-sync/adapter-registry.ts` — registry com todos os adapters
- `src/lib/inventory-sync/engine.ts` — `syncPartner()`, `syncStore()`
- `src/lib/inventory-sync/autocerto-adapter.ts` — AutoCerto OAuth2 (testado ✅)
- `src/lib/inventory-sync/cockpit-adapter.ts` — Cockpit (implementado, não testado)
- `src/lib/inventory-sync/revenda-mais-adapter.ts` — Revenda Mais (implementado, não testado)
- `src/lib/inventory-sync/motor21-adapter.ts` — Motor21 (implementado, não testado)

### Schema
- `prisma/schema.prisma` — v2.1: Partner tem `monthlyGoal Decimal?`
- `src/lib/schemas.ts` — Zod schemas

---

## Fluxo Principal (funcionando com AutoCerto real)

1. `/admin/lojas` → "Adicionar Loja" → preenche dados + seleciona DMS + credenciais
2. `createLoja()` cria `Partner` + `IntegrationConfig` com credenciais **criptografadas**
3. Card → "Sincronizar agora" → `syncPartnerNow()` → decripta credenciais → adapter → upsert veículos
4. Veículos em `/admin/inventory` com filtros
5. `/admin/financeiro` → definir comissão % e meta mensal → sistema calcula projeções

---

## Segurança Implementada

- Credenciais DMS: AES-256-GCM. Chave em `CREDENTIALS_ENCRYPTION_KEY` (.env.local)
- Auth guard: `src/lib/auth-guard.ts`
- Rate limiting: `src/lib/rate-limit.ts`
- Store isolation: `getActiveStore()` garante que cada admin vê só sua store
- RLS SQL pronto em `intelligence/rls_setup.sql` — **Pedro ainda precisa executar no Supabase Dashboard**

---

## Variáveis de Ambiente Necessárias (.env.local)

```
DATABASE_URL=...
DIRECT_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
CREDENTIALS_ENCRYPTION_KEY=<64 hex chars — gerar: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
AUTOCERTO_API_BASE_URL=https://integracao.autocerto.com
```

---

## Próximos Passos (por prioridade)

1. **Vitrine pública** `src/app/(platform)/` — listagem + detalhe de veículo + formulário de lead
2. **AddLojaDialog — campos dinâmicos por DMS** — Cockpit precisa apiKey+empresaId, não usuário+senha
3. **Testar Cockpit/Revenda Mais/Motor21** com credenciais reais de parceiros
4. **Sidebar widget de meta** — substituir valor hardcoded por dados reais do banco
5. **RLS no Supabase** — executar `intelligence/rls_setup.sql`

---

## Como Rodar

```bash
npm run dev          # http://localhost:3000
npm run typecheck    # deve dar 0 erros
npx prisma studio    # UI do banco
```

**Login**: Supabase Dashboard → Authentication → Users → Add user
**Dados de teste**: Via Brasil Multimarcas (AutoCerto real, sync testado ✅)
