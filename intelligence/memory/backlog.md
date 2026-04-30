# 📋 Backlog Mestre: Super Loja 2026

**Status Global**: 🟢 Fase 1 100% Concluída — Iniciando Fase 2 (Inventory)  
**Última Atualização**: 2026-04-30  
**Responsável**: Brain (Orchestrator)

---

## 🏗️ Fase 1: Fundação & Infra (The Core) — [100%] ✅
*Foco: Estabelecer a base sólida para evitar retrabalho.*

- [x] **Task 1.1**: Definição do Master Schema (Eschema) - `Vehicles`, `Partners`, `Leads`. [2026-04-30]
- [x] **Task 1.2**: Setup do Boilerplate Next.js 15 com estrutura de diretórios modular (`/modules`). [2026-04-30]
- [x] **Task 1.3**: Configuração de variáveis de ambiente e Integração Supabase (SSR). [2026-04-30]
- [x] **Task 1.4**: Implementação do Layout Base (Sidebar Premium + Modular Admin). [2026-04-30]
- [x] **Task 1.5**: Instalação e Configuração de Design System (shadcn/ui + Zod). [2026-04-30]
- [x] **Task 1.6**: Execução do `prisma db push` + Prisma Client gerado. [2026-04-30] ✅

## 🕵️ Fase 2: Inventory Intelligence (Scraping) — [0%]
*Foco: Garantir que o ativo (estoque) seja automatizado e confiável.*

- [ ] **Task 2.1**: Criação da Engine de Scraping Genérica (Interface para múltiplos lojistas).
- [ ] **Task 2.2**: Implementação do primeiro Adaptador de Scraping (Lojista Âncora 1).
- [ ] **Task 2.3**: Sistema de Validação de Dados e Deduplicação.
- [x] **Task 2.4**: UI de Gestão de Inventário conectada ao Prisma (dados reais + seed). [2026-04-30]

## 🤖 Fase 3: Lead Engine & IA (Expert Layer) — [10%]
*Foco: Conversão e qualificação automática.*

- [x] **Task 3.1**: Backend de Captura de Leads (API Endpoints implementados). [2026-04-30]
- [ ] **Task 3.2**: Setup da Evolution API + Webhooks para WhatsApp.
- [ ] **Task 3.3**: Agente de Qualificação (Prompting + RAG básico de estoque).
- [x] **Task 3.4**: Dashboard de Leads conectado ao Prisma (dados reais + groupBy status). [2026-04-30]

## 💳 Fase 4: F&I Engine (Finance) — [10%]
*Foco: Rentabilização e parceria bancária.*

- [x] **Task 4.1**: Desenvolver o Calculador de Financiamento Modular (Lógica e API prontas). [2026-04-30]
- [ ] **Task 4.2**: Integração com API de Bureau de Crédito (Simulação).
- [ ] **Task 4.3**: Fluxo de Handoff para o correspondente bancário (Lico).

---

## 📝 Notas de Versão e Mudanças
- **2026-04-30**: Criação do Backlog inicial.
- **2026-04-30**: Atualização massiva após implementação da infraestrutura Pro-Grade (shadcn, prisma, zod, supabase, admin UI).
