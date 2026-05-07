# Backlog — motorz
**Sessão**: 5 | **Data**: 2026-05-07 | **TypeScript**: 0 erros ✅

---

## ✅ CONCLUÍDO (não reler)

- Painel Admin completo: Geral, Estoque, Lojas, Financeiro, Leads + detalhe
- Multi-DMS: AutoCerto ✅ (testado + funcionando Sessão 5), Cockpit / Revenda Mais / Motor21 (implementados, não testados)
- Segurança: AES-256-GCM nas credenciais, auth guard, rate limiting
- Financeiro: metas por parceiro, comissão %, receita projetada, ranking
- RLS Supabase: ✅ executado no Dashboard
- Rename: zmove → **motorz** (código + docs + Tailwind)
- AddLojaDialog: campos dinâmicos por DMS (AutoCerto/RevendaMais: user+senha | Cockpit: apiKey+empresaId | Motor21: clientId+clientSecret)
- Sidebar: meta mensal **real** do banco (sem hardcode)
- User→Store mapping: `Store.ownerId` no schema, `createStore` seta, `getActiveStore` prioriza
- Vitrine pública: layout, nav, hero, grid de veículos, bottom sheet de lead, footer (CSS em `platform.css`)
- `@hugeicons/react` substituído por `lucide-react` nos 4 arquivos da vitrine
- `updateLoja` DMS-aware: merge seletivo por adapter, credenciais descriptografadas server-side antes do client

---

## 🔴 Alta Prioridade (próxima sessão)

### 1. Testar adapters Cockpit / Revenda Mais / Motor21
- Adapters implementados mas **nunca testados com API real**
- Precisa: credenciais reais de um parceiro com cada DMS
- Ajustar field mapping quando tiver acesso
- Arquivo: `src/lib/inventory-sync/cockpit-adapter.ts`, `revenda-mais-adapter.ts`, `motor21-adapter.ts`

### 2. ~~updateLoja — credenciais por DMS~~ ✅ RESOLVIDO (Sessão 5)
### 3. ~~AutoCerto sync~~ ✅ TESTADO EM PRODUÇÃO (Sessão 5)
- `updateLoja` agora lê `dms` do formData e faz merge apenas dos campos preenchidos
- `loja-actions-menu.tsx` renderiza campos corretos por adapter (AUTOCERTO/REVENDA_MAIS/COCKPIT/MOTOR21)
- `page.tsx` descriptografa credenciais server-side antes de passar ao client component

---

## 🟡 Média Prioridade

### 3. Vitrine pública — página de detalhe do veículo
- Rota: `src/app/(platform)/veiculo/[id]/page.tsx` (não existe ainda)
- Exibir specs completas, galeria de fotos, formulário de lead, SEO (metadata dinâmica)

### 4. Vitrine pública — SEO e metadata dinâmica
- `generateMetadata` por veículo para Google indexar
- OG tags para compartilhamento

### 5. Vincular Store existente ao usuário atual
- A store "Via Brasil" foi criada antes do `ownerId` existir → `ownerId` é null
- Fix: rodar no Supabase Dashboard:
  ```sql
  UPDATE "Store" SET "ownerId" = '<uuid-do-pedro>' WHERE slug = 'via-brasil';
  ```
  UUID do Pedro: Supabase Dashboard → Authentication → Users

---

## 🟢 Fase 3 — Lead Engine & IA (pausado, não priorizar)

- Evolution API webhook WhatsApp (`POST /api/webhooks/whatsapp`)
- Agente de qualificação Claude com RAG no estoque
- Funil de leads: métricas de conversão

---

## 🟢 Fase 4 — F&I (pausado)

- Simulação de financiamento real com banco parceiro
- Fluxo de handoff para Lico
