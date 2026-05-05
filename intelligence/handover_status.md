# Handover Status — Super Loja 2026
**Data**: 2026-05-05 | **Sessão**: 3 | **TypeScript**: 0 erros ✅

---

## O Que É Este Projeto

Marketplace automotivo B2B/B2C. A função principal é:
1. Cadastrar lojas parceiras (concessionárias/revendas) no painel
2. Configurar a API do sistema de gestão delas (AutoCerto, Cockpit, etc.)
3. Sincronizar o estoque automaticamente
4. Exibir tudo no site público e no painel interno

**Sócios**: Pedro (Tech), Vitor (Growth), Lico (Operações/Bancário)

---

## Stack

| Camada       | Tecnologia |
|---|---|
| Framework    | Next.js 15 (App Router, Server Components + Server Actions) |
| Linguagem    | TypeScript 5.7 estrito (sem `any`) |
| Banco        | PostgreSQL via Supabase (Prisma ORM) |
| Auth         | Supabase Auth (`createClient` server-side) |
| UI           | Tailwind CSS + shadcn/ui via `cn()` de `@/lib/utils` |
| Validação    | Zod em `src/lib/schemas.ts` |
| DMS Adapter  | AutoCerto (ativo), Cockpit/Revenda Mais/Motor21/Manual (em breve) |

---

## Arquitetura Multi-Tenant (ADR-005)

```
Store (tenant)
  └── Partner (loja parceira)
        ├── IntegrationConfig (credentials + DMS adapter)
        ├── Vehicle (estoque — status: AVAILABLE|RESERVED|SOLD|ARCHIVED)
        └── Lead (contatos)
```

- `storeId` denormalizado em todas as tabelas de negócio
- Admin pages usam `findFirst({ where: { isActive: true } })` como fallback (User→Store mapping pendente)
- Soft deletes: Partner usa `isActive: false`, Vehicle usa `status: ARCHIVED`

---

## Painel Admin — Estado Atual

### Sidebar (navegação)
```
Geral     → /admin           (overview/home)
Estoque   → /admin/inventory (todos os veículos, filtros, busca)
Lojas     → /admin/lojas     (PÁGINA PRINCIPAL — cadastrar + DMS + sync)
Leads     → /admin/leads     (lista de leads — não prioritário agora)
```

### Páginas implementadas ✅
| Rota | Arquivo | Status |
|---|---|---|
| `/admin` | `admin/page.tsx` | ✅ básico |
| `/admin/inventory` | `admin/inventory/page.tsx` | ✅ com filtros |
| `/admin/lojas` | `admin/lojas/page.tsx` | ✅ completo |
| `/admin/leads` | `admin/leads/page.tsx` | ✅ lista |
| `/admin/leads/[id]` | `admin/leads/[id]/page.tsx` | ✅ detalhe |
| `/admin/stores` | `admin/stores/page.tsx` | ✅ existe (fora do nav) |
| `/admin/partners` | `admin/partners/page.tsx` | ✅ existe (fora do nav) |

---

## Fluxo Principal (Funcionando)

### Adicionar loja + configurar DMS + sincronizar
1. `/admin/lojas` → clica "Adicionar Loja"
2. `AddLojaDialog`: preenche Nome, CNPJ, Cidade, Estado
3. Seleciona DMS: **AutoCerto** → preenche usuário + senha
4. Submit → `createLoja()` (server action) cria `Partner` + `IntegrationConfig` com credentials no banco
5. Card da loja aparece → clica **"Sincronizar agora"** → `SyncLojaButton` chama `syncPartnerNow(integrationId)`
6. `syncPartner()` usa `AutoCertoAdapter.fetchVehicles(config)` que lê credentials do banco (não do .env)
7. Veículos aparecem em `/admin/inventory`

### Inventário com filtros
- Busca por texto (marca/modelo/versão) — debounce 400ms
- Filtro por loja parceira (dropdown dinâmico)
- Filtro por marca (populado do banco)
- Filter tabs por status (Disponível / Reservado / Vendido / Arquivado)
- Badge da loja em cada card

---

## Arquivos Críticos

### Server Actions (mutations)
- `src/lib/partner-actions.ts` — `createLoja()`, `createPartner()`, `syncPartnerNow()`, `configureIntegration()`
- `src/lib/store-actions.ts` — `createStore()`, `updateStore()`, `toggleStoreActive()`
- `src/lib/vehicle-actions.ts` — `createVehicle()`, `updateVehicleStatus()`, `archiveVehicle()`

### DMS Integration
- `src/lib/inventory-sync/adapter-registry.ts` — `ADAPTER_REGISTRY`, `InventoryAdapter` interface
- `src/lib/inventory-sync/engine.ts` — `syncPartner()`, `syncStore()`
- `src/lib/inventory-sync/autocerto-client.ts` — OAuth2 com token cache **por usuário** (Map), fallback para env
- `src/lib/inventory-sync/autocerto-adapter.ts` — lê credentials do `AdapterFetchConfig`

### Components
- `src/components/forms/add-loja-dialog.tsx` — formulário único: Partner + IntegrationConfig
- `src/components/lojas/sync-loja-button.tsx` — botão client que chama `syncPartnerNow`
- `src/components/inventory-filters.tsx` — filtros client com `useRouter` + URLSearchParams
- `src/components/admin-sidebar.tsx` — sidebar com `startsWith` para active path

### Schema
- `prisma/schema.prisma` — Store, Partner, Vehicle, Lead, IntegrationConfig, Simulation, Interaction
- `src/lib/schemas.ts` — todos os Zod schemas (CreateStoreSchema, CreatePartnerSchema, etc.)

---

## O Que Está Pendente (Por Prioridade)

### Alta prioridade
- [ ] **Testar fluxo real**: Adicionar loja AutoCerto com credenciais reais → sync → ver veículos
- [ ] **Página Geral (`/admin`)**: Overview melhor — stats reais (total veículos, leads novos, lojas ativas)
- [ ] **User→Store mapping**: Hoje toda admin page usa `findFirst` (funciona com 1 store). Precisa: `StoreUser` junction table ou `user_metadata.storeId` no Supabase Auth

### Média prioridade
- [ ] **Criptografar credentials**: `IntegrationConfig.credentials` está em JSON puro. Precisa AES-256 antes de ir a produção
- [ ] **RLS policies**: Executar SQL no Supabase dashboard para Vehicle, Lead, Partner filtrando por `storeId`
- [ ] **Adicionar novo adapter**: Para plugar Cockpit ou Revenda Mais: implementar `InventoryAdapter` + 1 linha no `ADAPTER_REGISTRY`

### Baixa prioridade (Fase 3)
- [ ] **Evolution API + WhatsApp webhook**: `POST /api/webhooks/whatsapp`, client em `src/lib/evolution/client.ts`
- [ ] **Agente de qualificação IA**: Claude para qualificar leads com RAG no estoque
- [ ] **Leads**: melhorar dashboard (não prioritário por ora)
- [ ] **Remover rotas CoreBrain**: `/api/export`, `/api/memory`, `/api/skills`, `/api/state`, `/api/agents` — são resquícios de outro projeto

---

## Como Rodar

```bash
npm run dev          # servidor local → http://localhost:3000
npm run typecheck    # verifica tipos (deve dar 0 erros)
npx prisma studio    # UI do banco
```

**Login**: Supabase Auth → crie usuário em `supabase.com/dashboard/project/dpipnkwvcomwlldlllnx` → Authentication → Users → Add user

**Dados de teste** (seed fictício):
- Loja: Via Brasil Multimarcas
- Parceiros: Daitan Motors (AutoCerto), Euroville Premium (Manual)

---

## Padrões Obrigatórios

- TypeScript estrito — sem `any`, sem `as any`
- Toda query de dados deve filtrar por `storeId`
- UI: Tailwind + `cn()` de `@/lib/utils` — dark theme com `bg-zinc-900`, bordas `border-white/5`
- Cores da marca: `text-primary` (azul), `text-zmove-gold`, `text-zmove-cyan`
- Mutations via Server Actions (não via fetch client-side para operações simples)
- Validação de inputs externos via Zod (`src/lib/schemas.ts`)
- Soft deletes — nunca delete físico de Partner ou Vehicle
