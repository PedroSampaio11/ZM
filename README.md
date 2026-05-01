# 🚗 Super Loja 2026 — Automotive Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

> Uma plataforma automotiva modular de alta performance, projetada para gerir inventários distribuídos, qualificar leads com IA e automatizar o fluxo de F&I (Financiamento e Seguros).

---

## 🎯 O Projeto

A **Super Loja 2026** redefine o marketplace automotivo através de um modelo *Asset-Light*. Em vez de possuir o estoque, a plataforma integra-se dinamicamente com múltiplos lojistas parceiros, centralizando a oferta e utilizando agentes de IA para qualificar compradores no WhatsApp antes mesmo da interação humana.

### Pilares Estratégicos
*   **Inventory Intelligence:** SyncEngine automático com adaptadores para APIs de mercado (AutoCerto, etc).
*   **Lead Engine:** Captura, distribuição e qualificação automática de leads via WhatsApp (Evolution API).
*   **F&I Engine:** Motor de simulação de crédito e seguros integrado ao fluxo de venda.
*   **Security First:** Arquitetura protegida com Row Level Security (RLS) e validação rigorosa via Zod.

---

## 🏗️ Arquitetura Técnica

O projeto segue uma estrutura modular para garantir escalabilidade e separação de preocupações:

```text
src/
├── app/
│   ├── (platform)/   # Vitrine pública e experiência do comprador final
│   ├── (admin)/      # Painel de controle para lojistas e administradores
│   └── api/          # Endpoints de integração, webhooks e automações
├── modules/          # Lógica de domínio (Inventory, Leads, Finance, Shared)
├── lib/              # Infraestrutura (Prisma, Schemas, Security Guards)
└── components/       # Design System baseado em shadcn/ui
```

### Componentes Chave Implementados
- **SyncEngine:** Motor de sincronização de estoque com suporte a Dry-Run e validação de esquemas externos.
- **AutoCerto Adapter:** Integração completa com OAuth2, cache de tokens e mapeamento de campos.
- **Security Guard:** Middleware de autenticação e proteção de rotas administrativas.
- **Rate Limiter:** Proteção contra spam em endpoints públicos de captura de leads.

---

## 🚦 Roadmap e Status

| Fase | Descrição | Status |
|---|---|---|
| **Fase 1** | Fundação, Infraestrutura e Design System | 🟢 100% |
| **Fase 2** | Inventory Intelligence (Scraping & Sync) | 🟡 90% |
| **Fase 3** | Lead Engine & IA Qualification | 🟠 40% |
| **Fase 4** | F&I Engine (Finance & Insurance) | 🔵 25% |

---

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+
- Instância PostgreSQL (Recomendado: Supabase)

### Instalação

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Configure o Ambiente:**
    Crie um arquivo `.env.local` baseado no `.env.example`:
    ```bash
    DATABASE_URL="postgresql://..."
    NEXTAUTH_SECRET="..."
    AUTOCERTO_CLIENT_ID="..."
    # ... outras chaves
    ```

3.  **Prepare o Banco de Dados:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Inicie o Desenvolvimento:**
    ```bash
    npm run dev
    ```

---

## 🛡️ Segurança e Padrões

- **Zero Any:** Código 100% TypeScript com tipagem estrita.
- **Zod Validation:** Todos os inputs de API e dados externos são validados.
- **Clean Code:** Lógica de negócio isolada em `/modules`.

---

## 👥 Sócios e Responsabilidades

- **Pedro (Tech):** Arquitetura, Backend e Infraestrutura.
- **Vitor (Growth):** Estratégia de Mercado e Aquisição.
- **Lico (Ops):** Operações Bancárias e F&I.

---
*Documentação gerada e mantida pela AI Intelligence Layer (Brain).*
