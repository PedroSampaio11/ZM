# Handover Status — motorz
**Sessão**: 5 | **Data**: 2026-05-07 | **TypeScript**: 0 erros ✅

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 App Router (Server Components + Server Actions) |
| Linguagem | TypeScript 5.7 estrito — sem `any` |
| Banco | PostgreSQL via Supabase · Prisma ORM v5 |
| Auth | Supabase Auth (`createClient` server-side) |
| UI Admin | Tailwind + shadcn/ui · dark theme zinc-950 · cores `motorz-gold` / `motorz-cyan` |
| UI Vitrine | CSS puro em `platform.css` · variáveis `--mz-*` · mobile-first |
| Segurança | AES-256-GCM para credenciais · rate limiting · auth guard |

---

## Arquivos Críticos — ler antes de tocar

| Arquivo | O que faz |
|---|---|
| `src/lib/get-store.ts` | `getActiveStore()` — lookup: ownerId → user_metadata → findFirst |
| `src/lib/inventory-sync/credentials.ts` | `encryptCredentials()` / `decryptCredentials()` (AES-256-GCM) |
| `src/lib/partner-actions.ts` | `createLoja` (DMS-aware) · `syncPartnerNow` · `updateLoja` · `deleteLoja` |
| `src/lib/inventory-sync/adapter-registry.ts` | Registry de todos os adapters DMS |
| `prisma/schema.prisma` | Schema v2.2 — Store tem `ownerId String? @db.Uuid` |
| `tailwind.config.ts` | Cores custom: `motorz.carbon`, `motorz.blue`, `motorz.cyan`, `motorz.gold` etc. |

---

## Páginas Admin (todas funcionando)

| Rota | Arquivo |
|---|---|
| `/admin` | overview: stats reais + leads recentes + status sync |
| `/admin/inventory` | grid de veículos + filtros + tabs por status |
| `/admin/inventory/[id]` | detalhe, alterar status, leads vinculados |
| `/admin/lojas` | cadastrar parceiro + DMS + sync manual |
| `/admin/financeiro` | metas, comissão %, receita projetada, ranking |
| `/admin/leads` | lista de leads |
| `/admin/leads/[id]` | detalhe, timeline, status, interações |

**Sidebar**: meta mensal real (soma `monthlyGoal` / receita vendas SOLD do mês via layout server component).

---

## Vitrine Pública (em desenvolvimento)

| Arquivo | Status |
|---|---|
| `src/app/(platform)/layout.tsx` | ✅ Nav top + bottom nav mobile + footer |
| `src/app/(platform)/page.tsx` | ✅ Server component — busca veículos + passa para PlatformClient |
| `src/app/(platform)/platform-client.tsx` | ✅ Hero + filtros + grid + seções |
| `src/components/vehicle-card.tsx` | ✅ Card de veículo com preço e botão WhatsApp |
| `src/components/lead-bottom-sheet.tsx` | ✅ Sheet de detalhes + formulário de lead (3 passos: detalhe → form → success) |
| `src/app/(platform)/platform.css` | ✅ CSS da vitrine (variáveis, componentes, animações) |
| `src/app/(platform)/veiculo/[id]/page.tsx` | ❌ Não existe — próxima tarefa |

---

## DMS Adapters

| Adapter | Credenciais esperadas | Status |
|---|---|---|
| `AUTOCERTO` | `username`, `password` | ✅ Testado com API real |
| `REVENDA_MAIS` | `username`, `password` | Implementado, não testado |
| `COCKPIT` | `apiKey`, `empresaId` | Implementado, não testado |
| `MOTOR21` | `clientId`, `clientSecret` | Implementado, não testado |
| `MANUAL` | — | ✅ |

**Fluxo**: `createLoja` → `encryptCredentials(rawCreds)` → salva em `IntegrationConfig.credentials` → `syncPartnerNow` → `decryptCredentials` → adapter.

---

## Schema v2.2 (atual)

Modelos: `Store` (+ `ownerId`), `Partner` (+ `monthlyGoal`), `Vehicle`, `Lead`, `IntegrationConfig`, `Interaction`, `Simulation`

**User→Store**: `Store.ownerId = user.id` (Supabase Auth UUID). Stores antigas têm `ownerId = null` → fix manual via SQL no Supabase Dashboard.

---

## Como Rodar

```bash
npm run dev       # http://localhost:3000
npm run typecheck # deve dar 0 erros
npx prisma studio # UI do banco
```

**Admin**: `/admin` — login via Supabase Auth
**Vitrine**: `/` — pública

---

## Próximas Ações (por prioridade)

1. **Fix ownerId da store existente** — SQL no Supabase: `UPDATE "Store" SET "ownerId" = '<uuid>' WHERE slug = 'via-brasil'`
2. **updateLoja DMS-aware** — `partner-actions.ts` → `updateLoja` hardcoded em AutoCerto
3. **Página de detalhe do veículo** — `src/app/(platform)/veiculo/[id]/page.tsx`
4. **Testar Cockpit/Revenda Mais/Motor21** — precisa credenciais reais
