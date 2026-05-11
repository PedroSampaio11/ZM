# Backlog — motorz
**Sessão**: 7 | **Data**: 2026-05-11 | **TypeScript**: 0 erros ✅

---

## ✅ CONCLUÍDO (não reler)

- Painel Admin completo: Geral, Estoque, Lojas, Financeiro, Leads + detalhe
- Multi-DMS: AutoCerto ✅ (testado + funcionando Sessão 5), Cockpit / Revenda Mais / Motor21 (implementados, não testados)
- Segurança: AES-256-GCM nas credenciais, auth guard, rate limiting
- Financeiro: metas por parceiro, comissão %, receita projetada, ranking
- RLS Supabase: ✅ executado no Dashboard
- Rename: zmove → **motorz** (código + docs + Tailwind)
- AddLojaDialog: campos dinâmicos por DMS
- Sidebar: meta mensal real do banco
- User→Store mapping: `Store.ownerId` no schema
- Vitrine pública: layout, nav, hero, grid de veículos, bottom sheet de lead, footer
- `updateLoja` DMS-aware: merge seletivo por adapter
- Página de detalhe do veículo: `/veiculo/[id]` com galeria, specs, breadcrumbs

### ✅ Sessão 7 — Ghost Inventory + Filtros + Trust Signals + Lead Flow + Auto Sync

**Ghost Inventory Model (posicionamento como curadoria, sem expor parceiros):**
- `vehicle-card.tsx`: sem nome de parceiro, overlay CSS azul Motorz no bottom das fotos (`vehicle-img-overlay`)
- `vehicle-details-client.tsx`: exibe "Unidade Motorz + cidade/estado", sem `partner.name`
- Trust Signals na página de detalhe: card escuro "Inspeção Motorz — 30 pontos" (checklist 2 colunas) + "Garantia Motorz 90 dias" + 4 mini badges (7 dias, Preço final, Sem restrição, Test drive)

**Filtros por Região/Cidade:**
- `Vehicle` type em `types.ts`: campo `partnerCity?: string | null` adicionado
- `page.tsx` (home) e `estoque/page.tsx`: queries incluem `partner: { select: { city: true } }`, passam `cities[]` para client
- `platform-client.tsx` (home): estado `activeCity`, filtro `matchCity`, row "Região" com pills scroll horizontal — layout convertido de grid 3-col para vertical empilhado (Região → Marca → Valor)
- `estoque-client.tsx`: URL sync via `useSearchParams` + `router.replace({ scroll: false })`; filtros Região, Marca, Preço refletidos em `/estoque?cidade=...&marca=...&preco=...`

**Lead Flow corrigido (nunca mais direto ao WhatsApp):**
- `lead-actions.ts`: normaliza telefone (strip não-dígitos, prepend `55`), busca veículo para mensagem personalizada, retorna `whatsappUrl`
- `lead-bottom-sheet.tsx`: step detail → form (captura nome+telefone) → sucesso → abre WhatsApp após 1200ms
- Leads salvos no banco antes de qualquer redirect; visíveis em `/gestao/leads`

**Auto Sync (Vercel Cron):**
- `vercel.json`: cron `0 0 * * *` (meia-noite diário) → `GET /api/cron/sync` — Hobby plan só aceita diário; Pro suportaria `*/30 * * * *`
- `src/app/api/cron/sync/route.ts`: protegido por `Authorization: Bearer CRON_SECRET`, roda `syncStore()` para todas stores ativas, loga summary

**Fix deploy Vercel:**
- Next.js `15.1.6` → `16.2.6` (CVE-2025-66478 bloqueava Vercel)

**Mobile responsiveness:**
- `overflow-x: hidden` em `html, body, .platform-container`
- `min-width: 0` nas scroll rows de filtros (causa raiz do overflow lateral)

> ✅ **Sessão 7 commitada e em deploy** — commit `39f4fc2`, push para Vercel concluído em 2026-05-11.

### ✅ Sessão 6 — SEO/GEO + Performance + Segurança Admin

**Performance (causa do travamento resolvida):**
- `(platform)/layout.tsx` convertido de `'use client'` → **server component** — era a causa raiz do travamento entre páginas
- Extraídos `nav-client.tsx` e `footer-client.tsx` para isolar partes client-only
- Fonts migradas de `@import CSS` (render-blocking) → `next/font/google` (Onest) + `next/font/local` (Cal Sans)
- Cal Sans baixada em `/public/fonts/CalSans-SemiBold.woff2`
- `@view-transition { navigation: auto }` no CSS → transições nativas entre páginas
- `{ passive: true }` no scroll listener do TopNav
- `next/image` em `vehicle-card.tsx` e `vehicle-details-client.tsx` com AVIF/WebP, lazy/eager por posição
- `next.config.mjs`: formatos AVIF+WebP, `minimumCacheTTL: 86400`, headers de cache para `/assets/` e `/fonts/`

**SEO + GEO (ABCD Paulista):**
- `export const metadata` em homepage, estoque e seja-parceiro
- `generateMetadata` dinâmica em `/veiculo/[id]` com preço + cidade
- JSON-LD `AutoDealer` + `WebSite` na homepage com `areaServed` para 7 cidades do ABCD
- JSON-LD `Car` + `Offer` dinâmico em cada página de veículo
- `src/app/sitemap.ts` — sitemap dinâmico com todos os veículos disponíveis
- `src/app/robots.ts` — bloqueia `/admin/` e `/api/` para crawlers
- `dynamicParams = true` + `generateStaticParams` expandido para 200 veículos
- `seja-parceiro/page.tsx` convertido para server wrapper com metadata

**Segurança Admin:**
- Middleware com 2 camadas: autenticação (→ /login) + autorização por email allowlist (→ / silencioso)
- `requireAuth()` atualizado: retorna 403 se email não está na `ADMIN_EMAILS`
- `ADMIN_EMAILS=pedrosampaio11@icloud.com` adicionado ao `.env.local` e documentado em `.env.example`

---

## 🔴 Alta Prioridade (próxima sessão)

### ~~1. Commitar sessão 7~~ ✅ FEITO — commit `39f4fc2`, push Vercel 2026-05-11

### 2. Adicionar `CRON_SECRET` na Vercel
- Env var necessária para o auto sync funcionar em produção
- Valor: qualquer string aleatória segura (ex: `openssl rand -hex 32`)
- Adicionar no painel Vercel: Settings → Environment Variables → `CRON_SECRET`

### 3. OG Image — criar imagem para compartilhamento social
- Metadata referencia `/assets/brand/og-image.png` mas o arquivo **não existe ainda**
- Dimensões: 1200×630px
- Sem ela, links compartilhados no WhatsApp/Instagram mostram preview em branco
- Criar em Canva ou Figma e salvar em `public/assets/brand/og-image.png`

### 4. ~~Vincular Store ao Pedro~~ ✅ FEITO (Sessão 6)
- SQL executado: `UPDATE "Store" SET "ownerId" = 'da3a4523-2d30-401f-b95c-2fa470c1c8d8' WHERE slug = 'motorz';`

### 5. Testar adapters Cockpit / Revenda Mais / Motor21
- Adapters implementados mas **nunca testados com API real**
- Precisa: credenciais reais de um parceiro com cada DMS
- Arquivos: `src/lib/inventory-sync/cockpit-adapter.ts`, `revenda-mais-adapter.ts`, `motor21-adapter.ts`

---

## 🟡 Média Prioridade

### 4. Domínio e metadataBase
- `metadataBase` no layout aponta para `https://motorz.com.br`
- Quando o domínio real for definido (pode ser diferente), atualizar em:
  - `src/app/(platform)/layout.tsx` linha 27
  - `src/app/sitemap.ts` variável `base`
  - `src/app/robots.ts`

### 5. ~~Remover fallback perigoso do getActiveStore()~~ ✅ FEITO (Sessão 6)

### ~~6. URL params para filtros do estoque~~ ✅ FEITO (Sessão 7)
- `estoque-client.tsx` com `useSearchParams` + `router.replace({ scroll: false })`
- Suporte a `?cidade=...&marca=...&preco=...` na URL

---

## 🟢 Fase 3 — Lead Engine & IA (pausado, não priorizar)

- Evolution API webhook WhatsApp (`POST /api/webhooks/whatsapp`)
- Agente de qualificação Claude com RAG no estoque
- Funil de leads: métricas de conversão

---

## 🟢 Fase 4 — F&I (pausado)

- Simulação de financiamento real com banco parceiro
- Fluxo de handoff para Lico
