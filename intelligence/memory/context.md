# Contexto: Super Loja 2026

**Data de Início**: 2026-04-30
**Última Atualização**: 2026-05-05 (Sessão 3)
**Status**: 🟢 Em Desenvolvimento Ativo — Painel Admin funcional, foco em estabilidade e testes
**Stack Principal**: Next.js 15 (App Router), TypeScript 5.7, Prisma, PostgreSQL (Supabase), Tailwind CSS, Zod.

---

## Objetivo

Marketplace automotivo B2B/B2C no modelo asset-light. Função principal:
1. Cadastrar lojas parceiras (concessionárias) no painel
2. Configurar a integração com o DMS de cada loja (AutoCerto, Cockpit, etc.)
3. Sincronizar o estoque automaticamente
4. Exibir veículos no site público e no painel interno com filtros e controle total

---

## Arquitetura Multi-Tenant (ADR-005)

Instância compartilhada PostgreSQL com `storeId` denormalizado em todas as tabelas:

```
Store (tenant)
  └── Partner (loja parceira / concessionária)
        ├── IntegrationConfig (adapter + credentials por parceiro)
        ├── Vehicle (estoque)
        └── Lead (contatos)
```

**Invariante obrigatória**: Toda query de dados filtra por `storeId`. Nunca confiar em `storeId` vindo do request body — deve vir do contexto de auth.

---

## Adapter Registry (ADR-006)

Para adicionar novo DMS (ex: Cockpit):
1. Implementar `InventoryAdapter` em `src/lib/inventory-sync/`
2. Registrar no `ADAPTER_REGISTRY` em `adapter-registry.ts`
3. Não precisa tocar engine, API routes ou UI

Adapters disponíveis: `AUTOCERTO` (✅ ativo), `MANUAL` (✅), demais `COCKPIT|REVENDA_MAIS|MOTOR21|WEBMOTORS|OLX_AUTOS|MOBIAUTO|ICARROS|REPASSE` (estrutura pronta, implementação pendente).

**Credenciais**: Armazenadas por `IntegrationConfig.credentials` (JSON) — precisam de encriptação AES-256 antes do GA.

---

## Painel Admin — Navegação

```
Geral     → /admin           (home/overview)
Estoque   → /admin/inventory (todos veículos + filtros)
Lojas     → /admin/lojas     (PÁGINA PRINCIPAL — cadastrar + DMS + sync)
Leads     → /admin/leads     (não prioritário agora)
```

---

## Fluxo Principal Implementado

1. `/admin/lojas` → "Adicionar Loja" → preenche dados + seleciona DMS + credenciais
2. `createLoja()` cria `Partner` + `IntegrationConfig` em uma ação
3. Card da loja → "Sincronizar agora" → `syncPartnerNow()` → AutoCerto OAuth2 → upsert veículos
4. Veículos aparecem em `/admin/inventory` com filtros por loja/marca/busca

---

## Estado Atual dos Arquivos

**TypeScript**: 0 erros (`npm run typecheck` limpo)
**Banco**: schema v2.0 com Store, Partner, Vehicle, Lead, IntegrationConfig, Simulation, Interaction
**Seed**: dados fictícios (Via Brasil Multimarcas, Daitan Motors, Euroville Premium)

Arquivos de referência:
- `intelligence/handover_status.md` — estado detalhado atual (leia sempre primeiro)
- `intelligence/memory/backlog.md` — todas as tarefas por fase
- `intelligence/memory/decisions.md` — ADRs arquiteturais
- `prisma/schema.prisma` — schema completo do banco
- `src/lib/schemas.ts` — todos os Zod schemas

---

## Padrões Obrigatórios

- TypeScript estrito — sem `any`
- UI: Tailwind + `cn()` — dark theme `bg-zinc-900`, bordas `border-white/5`
- Cores: `text-primary` (azul), `text-zmove-gold`, `text-zmove-cyan`
- Mutations via Server Actions em `src/lib/*-actions.ts`
- Validação via Zod em `src/lib/schemas.ts`
- Soft deletes sempre (Partner: `isActive=false`, Vehicle: `status=ARCHIVED`)
- Dialog components: usar `@base-ui/react` — **sem `asChild`**, usar `className` direto no `DialogTrigger`
