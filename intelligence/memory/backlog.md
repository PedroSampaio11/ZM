# Backlog — motorz
**Sessão**: 6 | **Data**: 2026-05-08 | **TypeScript**: 0 erros ✅

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

### 1. ~~Vincular Store ao Pedro~~ ✅ FEITO (Sessão 6)
- SQL executado: `UPDATE "Store" SET "ownerId" = 'da3a4523-2d30-401f-b95c-2fa470c1c8d8' WHERE slug = 'motorz';`
- Fallback inseguro removido de `getActiveStore()` — agora retorna `null` se não achar store do usuário
- Isolamento multi-tenant agora é real

### 2. Testar adapters Cockpit / Revenda Mais / Motor21
- Adapters implementados mas **nunca testados com API real**
- Precisa: credenciais reais de um parceiro com cada DMS
- Arquivos: `src/lib/inventory-sync/cockpit-adapter.ts`, `revenda-mais-adapter.ts`, `motor21-adapter.ts`

### 3. OG Image — criar imagem para compartilhamento social
- Metadata referencia `/assets/brand/og-image.png` mas o arquivo **não existe ainda**
- Dimensões: 1200×630px
- Sem ela, links compartilhados no WhatsApp/Instagram mostram preview em branco
- Criar em Canva ou Figma e salvar em `public/assets/brand/og-image.png`

---

## 🟡 Média Prioridade

### 4. Domínio e metadataBase
- `metadataBase` no layout aponta para `https://motorz.com.br`
- Quando o domínio real for definido (pode ser diferente), atualizar em:
  - `src/app/(platform)/layout.tsx` linha 27
  - `src/app/sitemap.ts` variável `base`
  - `src/app/robots.ts`

### 5. ~~Remover fallback perigoso do getActiveStore()~~ ✅ FEITO (Sessão 6)

### 6. URL params para filtros do estoque
- Filtros rodam 100% client-side sem refletir na URL
- Impacto SEO: `/estoque?marca=Honda&preco=ate300k` não funciona
- Benefício: usuário pode compartilhar/bookmarkar filtros

---

## 🟢 Fase 3 — Lead Engine & IA (pausado, não priorizar)

- Evolution API webhook WhatsApp (`POST /api/webhooks/whatsapp`)
- Agente de qualificação Claude com RAG no estoque
- Funil de leads: métricas de conversão

---

## 🟢 Fase 4 — F&I (pausado)

- Simulação de financiamento real com banco parceiro
- Fluxo de handoff para Lico
