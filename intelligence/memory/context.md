# Contexto: Super Loja 2026

**Data de Início**: 2026-04-30
**Status**: 🟢 Em Desenvolvimento Ativo (Fase 2)
**Stack Principal**: Next.js 15 (App Router), TypeScript 5.7, Prisma, PostgreSQL (Supabase), Tailwind CSS, Zod, Evolution API.

---

## Objetivo
A **Super Loja 2026** é uma plataforma marketplace automotiva projetada para operar no modelo *asset-light*. O objetivo é centralizar o estoque de múltiplos parceiros, automatizar a captura e qualificação de leads via WhatsApp com agentes de IA, e facilitar a conversão de F&I (Financiamento e Seguros).

## Escopo e Arquitetura
- **Modular Design**: Divisão clara entre `modules/` (negócio) e `lib/` (infra).
- **Inventory Engine**: Sincronização automática via adaptadores (AutoCerto, etc).
- **Lead Management**: Fluxo de captura com rate limiting e dashboard administrativo.
- **IA Layer**: Agentes Claude para qualificação de leads com RAG baseado no estoque real.
- **F&I Integration**: Calculadora de financiamento integrada.

## Decisões Técnicas Chave
> Ver `decisions.md` para detalhes completos.

| Decisão | Motivo |
|---|---|
| Next.js 15 App Router | Performance, SSR e facilidade de rotas API. |
| Prisma + Supabase | Escalabilidade, facilidade de migração e suporte nativo a RLS. |
| Adapter Pattern (Inventory) | Flexibilidade para integrar qualquer fornecedor sem mudar o core. |
| Zod everywhere | Garantia de integridade de dados do scraping até a API. |

## Estado Atual
- **Fase 1 (Fundação)** concluída com sucesso.
- **Fase 2 (Inventário)** em estágio avançado: `SyncEngine` funcional, adaptador `AutoCerto` implementado e validado com Zod.
- **Infra de Segurança**: Rate limiting e Guards de autenticação operacionais.

---
*Última atualização: 2026-05-01 · Super Loja Intelligence (Brain)*
