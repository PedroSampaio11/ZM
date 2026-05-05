# Super Loja 2026 — Fundação Backend

**Data**: 2026-05-05 | **Stack**: Next.js 15 · Prisma · PostgreSQL (Supabase) · TypeScript 5.7 · Zod

---

## Status Geral

| Camada | Status |
|---|---|
| Schema & Banco | ✅ Completo |
| Multi-Tenant (Store/RLS) | ✅ Completo |
| Adapter Registry | ✅ Completo |
| Inventory Engine (AutoCerto) | ✅ Completo |
| Partners CRUD | ✅ Completo |
| Vehicles CRUD (admin + público) | ✅ Completo |
| Leads CRUD + Interações | ✅ Completo |
| Simulações F&I | ✅ Completo |
| Auth (Supabase) | ✅ Completo |
| Rate Limiting | ✅ Completo |
| Security Headers + Zod | ✅ Completo |
| **WhatsApp (Evolution API)** | ❌ Pendente |
| **Agente IA (Claude + RAG)** | ❌ Pendente |
| **RLS Policies no Supabase** | ❌ Pendente |
| **User → Store mapping** | ❌ Pendente |
| **Credentials encryption** | ❌ Pendente |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUPER LOJA 2026                                    │
│                  Marketplace Automotivo Asset-Light                          │
│                  Multi-Tenant · Shared Instance · RLS                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   VITRINE PÚBLICA (/platform)                                               │
│   ├── GET  /api/vehicles            Lista estoque disponível (filtros)      │
│   ├── GET  /api/vehicles/[id]       Detalhe de veículo                      │
│   ├── POST /api/leads               Captura lead (rate-limited)             │
│   └── POST /api/simulations         Simula financiamento                    │
│                                                                             │
│   ADMIN PANEL (/admin) — requer Auth                                        │
│   ├── Stores (Tenants)                                                      │
│   │   ├── GET  /api/admin/stores                Lista lojas                 │
│   │   ├── POST /api/admin/stores                Cria loja                   │
│   │   ├── GET  /api/admin/stores/[id]           Detalhe + parceiros         │
│   │   └── PATCH /api/admin/stores/[id]          Atualiza loja               │
│   │                                                                         │
│   ├── Integrations (por Store)                                              │
│   │   ├── GET  /api/admin/stores/[id]/integrations    Lista                 │
│   │   ├── POST /api/admin/stores/[id]/integrations    Conecta sistema       │
│   │   ├── PATCH /api/admin/stores/[id]/integrations/[iid]  Atualiza        │
│   │   └── DELETE /api/admin/stores/[id]/integrations/[iid] Remove          │
│   │                                                                         │
│   ├── Partners (por Store)                                                  │
│   │   ├── GET  /api/admin/partners?storeId=    Lista parceiros              │
│   │   ├── POST /api/admin/partners             Cria parceiro                │
│   │   ├── GET  /api/admin/partners/[id]        Detalhe                      │
│   │   ├── PATCH /api/admin/partners/[id]       Atualiza                     │
│   │   └── DELETE /api/admin/partners/[id]      Desativa (soft)             │
│   │                                                                         │
│   ├── Vehicles (admin)                                                      │
│   │   ├── GET  /api/admin/vehicles?storeId=    Lista todos status           │
│   │   ├── POST /api/admin/vehicles             Cadastro manual              │
│   │   ├── GET  /api/admin/vehicles/[id]        Detalhe                      │
│   │   ├── PATCH /api/admin/vehicles/[id]       Atualiza                     │
│   │   └── DELETE /api/admin/vehicles/[id]      Arquiva (soft)               │
│   │                                                                         │
│   ├── Leads                                                                 │
│   │   ├── GET  /api/leads                      Lista (filtros, paginação)   │
│   │   ├── GET  /api/leads/[id]                 Detalhe + interações + sims  │
│   │   ├── PATCH /api/leads/[id]                Atualiza status/score        │
│   │   ├── DELETE /api/leads/[id]               Remove                       │
│   │   ├── GET  /api/leads/[id]/interactions    Lista interações             │
│   │   └── POST /api/leads/[id]/interactions    Registra interação           │
│   │                                                                         │
│   ├── Simulations                                                           │
│   │   ├── POST /api/simulations                Cria simulação               │
│   │   ├── GET  /api/simulations/[id]           Detalhe                      │
│   │   └── PATCH /api/simulations/[id]          Aprova/Rejeita               │
│   │                                                                         │
│   └── Sync Engine                                                           │
│       ├── POST /api/admin/sync   { storeId }          Sync toda a loja      │
│       ├── POST /api/admin/sync   { integrationConfigId } Sync específico   │
│       └── GET  /api/admin/sync?storeId=               Lista adapters/status │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INVENTORY ENGINE                                                          │
│   ├── adapter-registry.ts      ADAPTER_REGISTRY + getAdapter(type)         │
│   ├── engine.ts                syncPartner() + syncStore()                  │
│   ├── autocerto-adapter.ts     ✅ OAuth2, retry 401, token cache            │
│   ├── cockpit-adapter.ts       ⬜ A implementar                             │
│   └── revenda-mais-adapter.ts  ⬜ A implementar                             │
│                                                                             │
│   Adapters disponíveis no enum:                                             │
│   AUTOCERTO · COCKPIT · REVENDA_MAIS · MOTOR21 · WEBMOTORS                 │
│   OLX_AUTOS · MOBIAUTO · ICARROS · REPASSE · MANUAL                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   LEAD ENGINE — Fase 3 (PENDENTE)                                           │
│   ├── POST /api/webhooks/whatsapp   ⬜ Webhook Evolution API                │
│   ├── Evolution API Client          ⬜ Envio de mensagens                   │
│   └── Claude AI Agent              ⬜ Qualificação + RAG no estoque         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   F&I ENGINE — Fase 4 (PARCIAL)                                             │
│   ├── calculateInstallment()   ✅ Fórmula Price (juros compostos)           │
│   ├── POST /api/simulations    ✅ Cálculo + persistência                    │
│   ├── Bureau de Crédito        ⬜ Integração simulada                       │
│   └── Handoff Bancário (Lico)  ⬜ Fluxo de correspondente                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Schema do Banco (v2.0)

```
Store (tenant)
│  id · name · slug · document · plan · isActive
│
├── Partner (lojista)
│   │  id · storeId · name · document · city · state · commission · isActive
│   │
│   ├── IntegrationConfig (como sincronizar este parceiro)
│   │      id · partnerId · storeId · adapter(enum) · isActive
│   │      credentials(Json) · config(Json) · lastSyncAt · lastSyncStatus
│   │
│   ├── Vehicle (estoque)
│   │      id · storeId · partnerId · brand · model · version
│   │      year · mileage · price · fuel · transmission · color
│   │      description · images[] · videoUrl · status(enum)
│   │      externalId(unique) · lastSyncAt
│   │
│   └── Lead (oportunidade)
│          id · storeId · partnerId? · vehicleId?
│          name · phone · email · origin(enum)
│          status(enum) · score(0-100) · summary
│          │
│          ├── Interaction
│          │      id · leadId · channel(enum) · direction(enum) · content
│          │
│          └── Simulation
│                 id · leadId · vehiclePrice · downPayment · financedAmount
│                 installments · monthlyRate · monthlyPayment
│                 totalAmount · totalInterest · bankName · status(enum)
```

### Enums

| Enum | Valores |
|---|---|
| `StorePlan` | STARTER · PROFESSIONAL · ENTERPRISE |
| `AdapterType` | AUTOCERTO · COCKPIT · REVENDA_MAIS · MOTOR21 · WEBMOTORS · OLX_AUTOS · MOBIAUTO · ICARROS · REPASSE · MANUAL |
| `VehicleStatus` | AVAILABLE · RESERVED · SOLD · ARCHIVED |
| `LeadStatus` | NEW · AI_QUALIFYING · QUALIFIED · HANDOFF_HUMAN · LOST · CONVERTED |
| `LeadOrigin` | FACEBOOK_ADS · GOOGLE_ADS · ORGANIC · WHATSAPP · REFERRAL · PARTNER · PLATFORM_WEB |
| `InteractionChannel` | WHATSAPP · EMAIL · PHONE · INTERNAL |
| `InteractionDirection` | INBOUND · OUTBOUND |
| `SimulationStatus` | PENDING · APPROVED · REJECTED |

---

## Lib / Infraestrutura

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/prisma.ts` | Singleton do Prisma Client |
| `src/lib/prisma-rls.ts` | Extensão RLS por storeId (set_config) |
| `src/lib/auth-guard.ts` | `requireAuth()` — verifica sessão Supabase |
| `src/lib/rate-limit.ts` | In-memory rate limiter por IP |
| `src/lib/schemas.ts` | Todos os Zod schemas do projeto |
| `src/lib/auth-actions.ts` | Server Actions: login() / logout() |
| `src/lib/lead-actions.ts` | Server Action: createLead() (formulários) |
| `src/lib/inventory-sync/adapter-registry.ts` | Registry de adapters + interface InventoryAdapter |
| `src/lib/inventory-sync/engine.ts` | syncPartner() + syncStore() |
| `src/lib/inventory-sync/autocerto-client.ts` | OAuth2 client AutoCerto |
| `src/lib/inventory-sync/autocerto-adapter.ts` | Adapter AutoCerto → Vehicle |
| `src/lib/supabase/` | Client SSR/client/middleware Supabase |
| `src/modules/shared/utils.ts` | formatCurrency, formatPhone, formatMileage, etc. |
| `src/modules/finance/types.ts` | calculateInstallment() + tipos F&I |
| `src/modules/inventory/types.ts` | Tipos derivados do Prisma |

---

## O que Falta (Funcional)

### Prioridade Alta — Fase 3 (Lead Engine)

#### 1. Evolution API — WhatsApp
**O que falta:**
- `src/lib/evolution/client.ts` — cliente para envio de mensagens (texto, template)
- `POST /api/webhooks/whatsapp` — recebe mensagens, cria/atualiza Lead + Interaction
- Variáveis de ambiente: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`

**Fluxo:**
```
WhatsApp → Evolution API → POST /api/webhooks/whatsapp
→ findOrCreate Lead by phone
→ create Interaction (INBOUND)
→ trigger AI Agent
→ respond via Evolution API (OUTBOUND)
→ create Interaction (OUTBOUND)
```

#### 2. Agente de Qualificação (Claude AI + RAG)
**O que falta:**
- `src/lib/ai/agent.ts` — cliente Anthropic, prompt de qualificação
- RAG: busca veículos da store por interesse do lead
- Atualiza `Lead.score`, `Lead.status`, `Lead.summary` após triagem
- Variáveis de ambiente: `ANTHROPIC_API_KEY`

**Fluxo:**
```
Nova mensagem → busca veículos similares no estoque (RAG)
→ Claude analisa interesse + intenção
→ gera resposta personalizada
→ atualiza score (0-100) + status + summary
→ se score > 80 → muda para QUALIFIED → notifica vendedor
```

### Prioridade Média — Infraestrutura

#### 3. User → Store Mapping
**O que falta:**
- Definir como o usuário autenticado é vinculado a uma Store
- **Opção A (simples):** `user.user_metadata.storeId` setado no Supabase Auth ao criar usuário
- **Opção B (flexível):** modelo `StoreUser { userId, storeId, role }` no Prisma
- Atualizar `requireAuth()` para retornar também o `storeId`
- Atualizar todas as rotas admin para filtrar por `storeId` do usuário (não do body)

**Decisão pendente:** confirmar com Pedro qual modelo usar.

#### 4. RLS Policies no Supabase
**O que falta:**
- Executar no Supabase SQL Editor:
```sql
-- Habilitar RLS nas tabelas
ALTER TABLE "Vehicle"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Partner"     ENABLE ROW LEVEL SECURITY;

-- Política de isolamento por tenant
CREATE POLICY "tenant_isolation" ON "Vehicle"
  USING ("storeId" = current_setting('app.current_store_id', true));

CREATE POLICY "tenant_isolation" ON "Lead"
  USING ("storeId" = current_setting('app.current_store_id', true));

CREATE POLICY "tenant_isolation" ON "Partner"
  USING ("storeId" = current_setting('app.current_store_id', true));
```
- `prisma-rls.ts` já está atualizado com `storeId` — precisa só das policies no banco

#### 5. Credentials Encryption
**O que falta:**
- `IntegrationConfig.credentials` está em plain JSON — OK para dev, inaceitável em produção
- Implementar encriptação AES-256-GCM na camada de aplicação antes de `prisma.integrationConfig.create()`
- Chave de encriptação via `ENCRYPTION_KEY` no env (mínimo 32 bytes)

### Prioridade Baixa — Melhorias

#### 6. Scheduled Sync
- Sync automático por intervalo (usa `IntegrationConfig.config.syncIntervalMinutes`)
- Opções: Vercel Cron Jobs, Supabase Edge Functions, ou endpoint chamado por cron externo

#### 7. Implementar Adapters
- `CockpitAdapter` — REST API com token (credenciais em `IntegrationConfig.credentials`)
- `RevendaMaisAdapter` — REST API

#### 8. Rate Limiting melhorado
- Rate limit atual é in-memory — não funciona com múltiplos pods
- Substituir por Redis (Upstash) para escala horizontal

---

## Arquivos Residuais (CoreBrain — NÃO são do Super Loja)

Estes arquivos foram herdados do CoreBrain dashboard e **não têm função** no Super Loja. Podem ser removidos:

| Arquivo | Origem |
|---|---|
| `src/app/api/export/route.ts` | CoreBrain dashboard |
| `src/app/api/memory/route.ts` | CoreBrain dashboard |
| `src/app/api/skills/route.ts` | CoreBrain dashboard |
| `src/app/api/state/route.ts` | CoreBrain dashboard |
| `src/app/api/agents/route.ts` | CoreBrain dashboard |

---

## Invariantes do Sistema

1. **`storeId` obrigatório**: toda query de negócio filtra por `storeId` — vem do contexto de auth, nunca do request body
2. **Soft delete**: partners e vehicles nunca são deletados fisicamente (`isActive: false` / `status: ARCHIVED`)
3. **Deduplicação**: `Vehicle.externalId` é unique — sync nunca cria duplicatas
4. **Zod everywhere**: toda entrada de API é validada com Zod antes de tocar o banco
5. **Credentials nunca no response**: `IntegrationConfig.credentials` é sempre omitido nas respostas de API

---

## Próxima Sessão — Ordem de Implementação

```
1. Evolution API client + webhook (Fase 3 desbloqueia tudo)
2. Claude Agent (qualificação automática)
3. User→Store mapping (decisão arquitetural antes do deploy)
4. RLS policies no Supabase SQL
5. Credentials encryption
```
