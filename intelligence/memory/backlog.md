# Backlog — motorz
**Sessão**: 9 | **Data**: 2026-05-12 | **TypeScript**: 0 erros ✅

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

### ✅ Sessão 8 — UX/Engajamento + SEO Programático + Busca Inteligente

**Share button + Seeded views (Sessão 8 início):**
- `vehicle-details-client.tsx`: `seededViews(id, featured)` — hash do ID gera número estável (featured: 180–420, demais: 28–150)
- Botão Compartilhar: `navigator.share` nativo no mobile, clipboard fallback no desktop com toast "Link copiado!" 2.5s

**Badge NOVO + "Chegou há X dias" (`vehicle-card.tsx`):**
- Badge verde `NOVO` (bottom-right da imagem) para veículos ≤7 dias
- Texto "Chegou hoje / ontem / Há X dias" ao lado da marca para ≤30 dias (verde para novos, cinza para os demais)

**Favoritos sem cadastro (`src/hooks/use-favorites.ts` + card + `/favoritos`):**
- Hook `useFavorites`: toggle em `localStorage`, sem cadastro
- Coração no canto superior direito de cada imagem do card
- Botão de favorito na página de detalhe (topo do price card)
- Página `/favoritos`: grid de salvos, botão remover individual, estado vazio com CTA

**Visto recentemente (`src/hooks/use-recently-viewed.ts` + vehicle-details):**
- Hook `useRecentlyViewed`: salva até 8 veículos em `localStorage`
- Ao abrir `/veiculo/[id]`, rastreia automaticamente
- Seção horizontal scrollável "Vistos recentemente" no rodapé do detalhe (some se vazio)

**Você também pode gostar (`veiculo/[id]/page.tsx` + client):**
- Query no servidor: mesma marca OU faixa de preço ±25%, máx 4 veículos
- Grid de cards compactos abaixo do conteúdo principal
- Tipo `RelatedVehicle` exportado de `page.tsx`, importado no client

**Landing pages programáticas (`/comprar/[brand]/[model]/page.tsx`):**
- Rota `src/app/(platform)/comprar/[brand]/[model]/page.tsx`
- `generateStaticParams` → todas combinações marca+modelo em estoque
- URL: `/comprar/honda/hrv`, `/comprar/toyota/corolla`, etc.
- Metadata SEO + JSON-LD `ItemList` + hero com contagem e faixa de preço
- `revalidate = 3600` (revalida por hora)

**Busca inteligente local — zero custo (`estoque-client.tsx`):**
- Parser TypeScript puro com `useMemo` — sem API, sem custo, instantâneo
- Detecta: preço máximo, câmbio, combustível, marca (20+ aliases), carroceria (SUV, sedan, hatch...)
- Ativa com query ≥ 8 chars e espaço; exibe pill azul "Busca inteligente ativa · Honda · Automático · até R$ 80.000"
- API route `/api/search/semantic` removida (era paga, foi descartada)

**Fix global `@hugeicons/react`:**
- Todos os `ArrowLeft01Icon` / `ArrowRight01Icon` do pacote quebrado substituídos por `ArrowLeft` / `ArrowRight` do `lucide-react`
- Arquivos corrigidos: `platform-client.tsx`, `estoque-client.tsx`, `vehicle-details-client.tsx`, `embaixador-client.tsx`, `zm-chat.tsx`, `not-found.tsx`, `favoritos/page.tsx`

**Decisão de produto — descartadas com motivo:**
- ~~Badge FIPE~~: descartado — preços das lojas podem estar acima da FIPE, badge negativo na conversão
- ~~Simulador de parcelas~~: descartado — sem taxa/condições definidas pelos parceiros, gera expectativa errada; retomado quando Lico fechar banco parceiro (Fase 4)

> ✅ **Sessão 8 commitada** — commits `279f82e`, `069c51b`, `b3fc555` (2026-05-11/12).

### ✅ Sessão 9 — Diferenciação de Produto + UX Premium

**Tabela Comparativa (vehicle-details-client.tsx):**
- `ComparisonTable` estático: Motorz vs "Marketplace de anúncio" (sem nomear concorrentes — LGPD/CONAR safe)
- Lucide icons (Check/X/Minus), disclaimer legal no rodapé, 5 critérios selecionados a favor da Motorz

**Fix Seleção Especial + Cards Mobile:**
- Label e scroll row unificados no mesmo `maxWidth: 1400px` pai → alinhamento garantido no notebook
- Card width: `clamp(300px, 82vw, 420px)` → mais largo no mobile
- Padding interno do card: `clamp(16px, 4vw, 24px)` → menos apertado
- Footer do card: `flexWrap + flexShrink: 0` → preço e botão nunca se espremem

**Motorz Score (`src/lib/motorz-score.ts`):**
- Função pura `computeMotorzScore()` → 65–100 (base 65 = todo veículo curado começa em "Bom")
- Fórmula: ano (13pts) + km (13pts) + câmbio (6pts) + versão (3pts) + base 65
- Labels: **Bom** (ouro #FFC107) | **Muito Bom** (azul #1243B2) | **Excelente** (verde #22C55E)
- Badge circular no card + painel expandido (score, label, barra de progresso) na página de detalhe

**Nota do Curador:**
- Campo `curatorNote String? @db.Text` no schema Vehicle (migration via `db push`)
- Admin `/gestao/inventory/[id]`: card "Nota do Curador" com textarea + server action `saveCuratorNote`
- Público: card escuro com citação em itálico + "— Time Motorz" (renderiza só se preenchido)

**Chegando em Breve (INCOMING):**
- `INCOMING` adicionado ao enum `VehicleStatus` (migration aplicada)
- Status disponível no admin com badge âmbar
- Seção na home: grid de cards com imagem blurred, badge pulsante, CTA "Me avise quando chegar"
- Query em `page.tsx`, prop `incomingVehicles` no `PlatformClient`, componente `IncomingCard`

> ✅ **Sessão 9 commitada** — commit `7d183a9`, push Vercel 2026-05-12.

### ✅ Sessão 10 — Blog SEO definitivo + Live Activity inteligente + Bugfixes

**Blog `/blog/[slug]/page.tsx` — reescrita completa:**
- Removidos `onMouseEnter`/`onMouseLeave` de Server Components (erro fatal de runtime) → CSS class `.blc:hover`
- Tripla estrutura JSON-LD: `BreadcrumbList` + `FAQPage` + `ItemList` (veículos como entidade)
- HTML semântico: `<article>`, `<header>`, `<section aria-label>`, breadcrumb `<nav aria-label>`
- Dual CTA no hero: "Ver estoque" (azul) + "Falar com consultor" (WhatsApp verde)
- CTA pós-grid com copy de urgência ("Atualizado em tempo real")
- Seção "Ver também" — artigos relacionados dinâmicos (mesma cidade/outras cidades, marca/outras marcas)
- Card final de conversão 2 colunas com dois botões
- Twitter card metadata
- Filtro `autoFilter` case-insensitive para `transmission` (cobre `'AUTOMATIC'`, `'Automático'`, `'automatico'`, `'AUTO'`, `'CVT'`) — corrige "Nenhum veículo" em suv-automatico e carros-automaticos
- 4 FAQs por categoria (vs 3 antes)

**Live Activity (`src/components/live-activity.tsx`):**
- Shuffle de sessão via `Math.random()` — nomes e ordem diferentes a cada visita
- Personalização: lê `mz_recent` + `mz_favorites` do localStorage → prioriza marcas de interesse do usuário
- Bloqueia repetição do mesmo nome em exibições consecutivas
- Reshuffle automático após ciclo completo

**Navegação:**
- Blog adicionado ao TopNav desktop, menu mobile e footer (coluna Navegação)

> ✅ **Sessão 10 commitada** — commits `ac4f803`, `e847781`, `949bdd0` (2026-05-12).

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

### 1. Adicionar `CRON_SECRET` na Vercel ⚠️ BLOQUEIA SYNC EM PRODUÇÃO
- Env var necessária para o auto sync funcionar em produção
- Valor: qualquer string aleatória segura (ex: `openssl rand -hex 32`)
- Adicionar no painel Vercel: Settings → Environment Variables → `CRON_SECRET`

### 2. OG Image estática — fallback para páginas sem veículo
- `/api/og?id=` dinâmica já funciona para veículos (Sessão 9)
- Falta imagem estática `public/assets/brand/og-image.png` para home, blog index, embaixador, etc.
- Dimensões: 1200×630px — criar em Canva/Figma

### 3. Fix filtro de câmbio no Estoque (`estoque-client.tsx`)
- Mesmo problema do blog: match exato `v.transmission !== 'AUTOMATIC'` falha se DB tem `'Automático'`
- Correção: normalizar em lowercase no filter, ou adicionar variações
- Arquivo: `src/app/(platform)/estoque/estoque-client.tsx` linha 166

### 4. PWA — Instalar como app no celular (quick win)
- `next-pwa` + `manifest.json` + ícones → usuário instala a vitrine na tela inicial
- Estimativa: 2–3h. Alto impacto de retenção mobile (foco na audiência ABCD)

### 5. Testar adapters Cockpit / Revenda Mais / Motor21
- Adapters implementados mas nunca testados com API real
- Precisa: credenciais de um parceiro com cada DMS

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

## 💡 Ideias — Valor, Tech & UX (brainstorm 2026-05-11)

> Não priorizadas ainda. Discutir com Pedro/Vitor antes de implementar.

### Conversão (impacto direto no lead)
- ~~**Simulador de parcelas inline**~~ — ❌ descartado: sem taxa/condições definidas pelos parceiros. Retomar na Fase 4 (F&I) quando Lico fechar banco.
- ~~**Badge FIPE**~~ — ❌ descartado: preços dos parceiros podem estar acima da FIPE, badge seria negativo.
- **Social proof ao vivo no detalhe** — "X pessoas viram esse carro hoje / Y favoritos", seeded por hora. Já há Live Activity na home; falta na página de detalhe.
- ~~**Badge NOVO / "chegou há X dias"**~~ — ✅ implementado (Sessão 8)
- **Comparador de veículos** — botão "Comparar" nos cards → floating bar → tabela lado a lado (máx 3). Alto impacto em decisão de compra.

### Engajamento & Retenção
- ~~**Favoritos sem cadastro**~~ — ✅ implementado (Sessão 8): hook + card + página `/favoritos`
- ~~**Visto recentemente**~~ — ✅ implementado (Sessão 8): hook + seção no detalhe
- ~~**Você também pode gostar**~~ — ✅ implementado (Sessão 8): query server-side + grid no detalhe
- **PWA (Progressive Web App)** — `next-pwa` + `manifest.json` + ícones → usuário instala o site como app na tela inicial sem precisar de loja. Vitrine `/(platform)/` vira instalável; admin excluído do escopo. Estimativa: 2–4h. *(não implementado)*
- **Alerta por WhatsApp** — usuário salva perfil de busca, recebe mensagem quando novo veículo bate os critérios. Requer Evolution API (Fase 3).
- **Comparador de veículos** — botão "Comparar" nos cards → floating bar → tabela lado a lado (máx 3 veículos).

### SEO / Crescimento orgânico
- ~~**Landing pages programáticas por modelo**~~ — ✅ implementado (Sessão 8): `/comprar/[brand]/[model]` com SEO + JSON-LD

### Tecnologia / IA
- **Auto-geração de descrição com IA** — botão "Gerar com IA" no cadastro manual → Claude gera descrição pipe-formatted a partir das specs.
- ~~**Busca inteligente**~~ — ✅ implementado (Sessão 8): parser local gratuito com `useMemo`, sem API.
- **Trade-in / Avaliação do usado** — "usar meu carro como entrada" → formulário modelo/ano/km → lead qualificado para Lico.

### Negócio Interno
- **Dashboard do parceiro** — login separado, parceiro vê views/leads/conversão dos próprios carros. Justifica mensalidade.
- **Relatório semanal automático** — email toda segunda (Resend + Cron): leads da semana, top veículos, carros parados >30 dias.

---

## 🟢 Fase 3 — Lead Engine & IA (pausado, não priorizar)

- Evolution API webhook WhatsApp (`POST /api/webhooks/whatsapp`)
- Agente de qualificação Claude com RAG no estoque
- Funil de leads: métricas de conversão

---

## 🟢 Fase 4 — F&I (pausado)

- Simulação de financiamento real com banco parceiro
- Fluxo de handoff para Lico
