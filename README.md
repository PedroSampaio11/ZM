# 🚗 Super Loja — Plataforma Automotiva

> Marketplace automotivo no modelo Asset-Light com IA para qualificação de leads e F&I engine.

## 🏗️ Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5.7 |
| Estilo | Tailwind CSS v3 |
| Banco de Dados | PostgreSQL via Supabase |
| ORM | Prisma v5 |
| Validação | Zod |
| WhatsApp | Evolution API |

## 📁 Estrutura

```
src/
├── app/
│   ├── (platform)/   # Vitrine pública para o cliente final
│   ├── (admin)/      # Dashboard interno (parceiros, leads, inventário)
│   └── api/          # API routes (leads, vehicles, simulations, webhooks)
├── modules/          # Domínios de negócio (inventory, leads, finance, shared)
└── lib/              # Utilitários compartilhados (prisma, schemas, utils)

intelligence/         # Infra de IA (separada do código de produto)
├── memory/           # Contexto, backlog, decisões arquiteturais
└── strategy/         # Masterplan e documentos estratégicos

prisma/
└── schema.prisma     # Schema do banco de dados
```

## 🚀 Instalação

```powershell
# 1. Clone e instale dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 3. Gere o Prisma Client
npx prisma generate

# 4. Execute as migrations (após configurar o banco)
npx prisma migrate dev --name init

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

## 👥 Equipe

| Papel | Responsável |
|---|---|
| 💻 Tecnologia | Pedro |
| 🚀 Crescimento | Vitor |
| 🤝 Operações | Lico |

---
*Confidencial — Sócios: Pedro, Vitor e Lico.*
