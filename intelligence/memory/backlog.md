# Backlog Mestre — Super Loja 2026

**Status Global**: 🟢 Painel Admin funcional — próximo: testes reais + Geral melhorado
**Última Atualização**: 2026-05-05 (Sessão 3)

---

## ✅ Fase 0: Multi-Tenant + Adapter Registry — CONCLUÍDO

- [x] ADR-005: Store como tenant top-level, `storeId` em todas as tabelas
- [x] ADR-006: `ADAPTER_REGISTRY` + `IntegrationConfig` por parceiro
- [x] Schema v2.0: Store, Partner, Vehicle, Lead, IntegrationConfig, enums
- [x] API Routes: Stores CRUD, Integrations CRUD, Sync atualizado
- [x] `syncStore(storeId)` itera automaticamente todos os IntegrationConfigs ativos
- [x] Seed com 2 partners, veículos e leads fictícios

---

## ✅ Fase 1: Fundação & Segurança — CONCLUÍDO

- [x] Schema inicial, boilerplate Next.js 15, Supabase SSR
- [x] Security hardening: SQL injection fix, auth guard, security headers, rate limiting
- [x] Zod schemas em `src/lib/schemas.ts`
- [x] Prisma singleton em `src/lib/prisma.ts`

---

## ✅ Fase 2: Inventory Engine — CONCLUÍDO

- [x] `SyncEngine`: `syncPartner()` com dry-run, deduplicação por `externalId`
- [x] `AutoCertoAdapter`: OAuth2 password grant, token cache **por usuário** (Map), retry 401
- [x] Credenciais por parceiro: lê de `IntegrationConfig.credentials` (fallback para .env)
- [x] `ExternalVehicleSchema`: validação Zod antes do upsert
- [x] `syncStore(storeId)`: sync automático de todas as integrações ativas

---

## ✅ Fase UI Admin — CONCLUÍDO (Sessão 3)

- [x] Sidebar: Geral / Estoque / Lojas / Leads (sem Inteligência)
- [x] `/admin/lojas`: cards por loja, stats, SyncLojaButton, AddLojaDialog
- [x] `AddLojaDialog`: formulário único — Partner + DMS + credentials
- [x] `SyncLojaButton`: client component, chama `syncPartnerNow`, mostra resultado
- [x] `createLoja()`: server action — cria Partner + IntegrationConfig em um passo
- [x] `/admin/inventory`: filtros por texto/loja/marca, badge de loja nos cards, status tabs
- [x] `InventoryFilters`: client component, debounce 400ms, URLSearchParams
- [x] `/admin/leads/[id]`: detalhe completo (timeline, status actions, simulações)
- [x] Forms: `NewStoreDialog`, `NewPartnerDialog`, `NewVehicleDialog`, `SyncConfigDialog`

---

## 🔴 Alta Prioridade — Próximas Ações

- [ ] **Testar fluxo real completo**:
  - Adicionar loja com credenciais AutoCerto reais
  - Clicar "Sincronizar agora"
  - Confirmar que veículos aparecem em `/admin/inventory`
  - Verificar se filtros funcionam corretamente

- [ ] **Melhorar página Geral (`/admin`)**:
  - Stats reais: total de veículos disponíveis, leads novos hoje, lojas ativas, último sync
  - Atividade recente (últimas interações / leads)

- [ ] **User→Store mapping**:
  - Hoje: todas as admin pages usam `findFirst({ where: { isActive: true } })` — funciona com 1 store
  - Opção A: `user_metadata.storeId` no Supabase Auth (mais simples)
  - Opção B: `StoreUser` junction table no Prisma (mais flexível para multi-admin)
  - Decisão pendente com Pedro

---

## 🟡 Média Prioridade

- [ ] **Criptografar IntegrationConfig.credentials**:
  - Atualmente: JSON puro no banco
  - Precisa: AES-256-GCM na camada de aplicação antes do GA
  - Arquivo: `src/lib/inventory-sync/credentials.ts` (criar)

- [ ] **RLS policies no Supabase**:
  - Executar SQL no Supabase dashboard para Vehicle, Lead, Partner
  - Filtrar por `current_setting('app.current_store_id')`
  - Arquivo: `src/lib/prisma-rls.ts` já tem o helper

- [ ] **Vehicle detail page**:
  - `/admin/inventory/[id]` — editar status, ver leads vinculados, histórico

- [ ] **Adicionar adapter Cockpit/Revenda Mais**:
  - Só precisa implementar `InventoryAdapter` e registrar no `ADAPTER_REGISTRY`
  - Zero mudança no engine ou nas rotas

---

## 🟢 Fase 3: Lead Engine & IA — Pausado

- [ ] Evolution API client + webhook WhatsApp (`POST /api/webhooks/whatsapp`)
- [ ] Agente de qualificação Claude com RAG no estoque real
- [ ] Dashboard de leads melhorado (métricas, funil)

---

## 🟢 Fase 4: F&I — Pausado

- [ ] Integração banco parceiro (simulação de financiamento real)
- [ ] Fluxo de handoff para Lico

---

## 🧹 Limpeza Técnica

- [ ] Remover rotas legadas CoreBrain: `/api/export`, `/api/memory`, `/api/skills`, `/api/state`, `/api/agents`
- [ ] Revisar e limpar `/admin/partners` (substituído por `/admin/lojas`)
- [ ] Revisar e limpar `/admin/stores` (fora do nav, pode virar Settings)
