# Backlog Mestre — motorz

**Status Global**: 🟢 Sessão 4 concluída — Admin completo, Financeiro, Multi-DMS, Segurança
**Última Atualização**: 2026-05-07 (Sessão 4)

---

## ✅ Fases 0–3 UI: CONCLUÍDO

Tudo que foi construído até aqui está em `intelligence/handover_status.md`.
Não releia este bloco — vá direto ao handover para o estado atual.

---

## 🔴 Próximas Ações (Alta Prioridade)

- [ ] **Vitrine pública** `src/app/(platform)/` — página de listagem de veículos para o cliente final
  - Grid de veículos com filtros (marca, preço, ano, km)
  - Página de detalhe do veículo com formulário de interesse (cria Lead)
  - SEO básico (metadata por veículo)

- [ ] **AddLojaDialog — campos por DMS** — hoje o formulário mostra usuário/senha para qualquer DMS
  - Cockpit precisa: `apiKey` + `empresaId`
  - Motor21 precisa: `clientId` + `clientSecret`
  - Revenda Mais precisa: `username` + `password`
  - Solução: campos dinâmicos no dialog baseados no DMS selecionado

- [ ] **Testar novos adapters com credenciais reais** (Cockpit, Revenda Mais, Motor21)
  - Os adapters estão implementados mas ainda não foram testados com APIs reais
  - Ajustar field mapping quando houver acesso às APIs

---

## 🟡 Média Prioridade

- [ ] **RLS no Supabase** — executar `intelligence/rls_setup.sql` no Supabase Dashboard
  - Já gerado, Pedro só precisa colar e rodar no SQL Editor

- [ ] **Sidebar — widget de meta global real**
  - Hoje mostra "R$ 4.2M / 62%" hardcoded
  - Buscar `monthlyGoal` e `revenueThisMonth` real via `getActiveStore()` + query agregada

- [ ] **Notificações de sync** — alertar quando sync falha ou veículos somem do feed

- [ ] **Exportar dados** — CSV de estoque ou leads para planilha

---

## 🟢 Fase 3: Lead Engine & IA (Pausado)

- [ ] Evolution API client + webhook WhatsApp (`POST /api/webhooks/whatsapp`)
- [ ] Agente de qualificação Claude com RAG no estoque real
- [ ] Dashboard de leads: funil, métricas de conversão

---

## 🟢 Fase 4: F&I (Pausado)

- [ ] Integração banco parceiro (simulação de financiamento real)
- [ ] Fluxo de handoff para Lico
