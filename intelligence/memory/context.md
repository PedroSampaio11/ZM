# Contexto: motorz

**Data de Início**: 2026-04-30
**Última Atualização**: 2026-05-07 (Sessão 4)
**Status**: 🟢 Em Desenvolvimento Ativo — Painel Admin completo, Financeiro implementado
**Stack Principal**: Next.js 15 (App Router), TypeScript 5.7, Prisma, PostgreSQL (Supabase), Tailwind CSS, Zod.

---

## Objetivo

Marketplace automotivo B2B/B2C no modelo asset-light. Função principal:
1. Cadastrar lojas parceiras (concessionárias) e configurar a integração com o DMS delas
2. Sincronizar o estoque automaticamente via adapters (AutoCerto, Cockpit, Revenda Mais, Motor21)
3. Exibir veículos no site público e no painel interno com filtros e controle total
4. Controlar metas de receita por parceiro e projetar faturamento

---

## Arquitetura Multi-Tenant (ADR-005)

```
Store (tenant)
  └── Partner (loja parceira / concessionária)
        ├── IntegrationConfig (adapter + credentials criptografadas por parceiro)
        ├── Vehicle (estoque)
        └── Lead (contatos)
```

**Invariante**: Toda query filtra por `storeId`. Usar `getActiveStore()` em `src/lib/get-store.ts`.
**Credenciais**: Criptografadas com AES-256-GCM em `src/lib/inventory-sync/credentials.ts`. Chave: `CREDENTIALS_ENCRYPTION_KEY` (64 hex chars) no `.env.local`.

---

## Adapter Registry (ADR-006)

Adapters implementados: `AUTOCERTO` ✅, `COCKPIT` ✅, `REVENDA_MAIS` ✅, `MOTOR21` ✅, `MANUAL` ✅
Estrutura pronta (sem API real): `WEBMOTORS`, `OLX_AUTOS`, `MOBIAUTO`, `ICARROS`, `REPASSE`

Para adicionar novo DMS: implementar `InventoryAdapter` em `src/lib/inventory-sync/` → registrar no `ADAPTER_REGISTRY`.

---

## Painel Admin — Navegação Atual

```
Geral        → /admin              (overview: stats reais + sync status)
Estoque      → /admin/inventory   (grid de veículos + filtros + tabs de status)
             → /admin/inventory/[id]  (detalhe: specs, alterar status, leads)
Lojas        → /admin/lojas       (cadastrar parceiros + DMS + sync)
Financeiro   → /admin/financeiro  (portfólio, metas, receita projetada, ranking)
Leads        → /admin/leads       (lista de leads)
             → /admin/leads/[id]  (detalhe: timeline, status, interações)
```

---

## Schema v2.1 (atual)

Arquivo: `prisma/schema.prisma`

Modelos: Store, Partner (+ `monthlyGoal`), Vehicle, Lead, IntegrationConfig, Interaction, Simulation

Campo novo na Sessão 4: `Partner.monthlyGoal Decimal? @db.Decimal(12,2)`

---

## Padrões Obrigatórios

- TypeScript estrito — sem `any`, sem `as any`
- Store lookup: sempre via `getActiveStore()` em `src/lib/get-store.ts` (nunca `prisma.store.findFirst` direto)
- Credenciais: sempre `encryptCredentials()` ao salvar, `decryptCredentials()` ao ler
- UI: Tailwind + `cn()` — dark theme `bg-zinc-900`, bordas `border-white/5`
- Cores: `text-primary` (azul), `text-motorz-gold`, `text-motorz-cyan`
- Mutations: Server Actions em `src/lib/*-actions.ts`
- Validação: Zod em `src/lib/schemas.ts`
- Soft deletes: Partner `isActive=false`, Vehicle `status=ARCHIVED`
