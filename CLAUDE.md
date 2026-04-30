# Super Loja — CLAUDE.md

Projeto: Marketplace automotivo asset-light com IA para leads e F&I.
Sócios: Pedro (Tech), Vitor (Growth), Lico (Operações/Bancário).

## Memória
- `intelligence/memory/context.md` — contexto e stack (leia primeiro)
- `intelligence/memory/decisions.md` — decisões arquiteturais (ADRs)
- `intelligence/memory/backlog.md` — backlog por fases (Fase 1–4)
- `intelligence/memory/specifications/superloja_schema.md` — schema do banco

## Regras Obrigatórias
- Leia `intelligence/memory/context.md` antes de qualquer ação
- Consulte `intelligence/memory/backlog.md` para prioridades
- TypeScript obrigatório, **sem `any`**
- UI sempre com Tailwind CSS + shadcn/ui (via `cn()` de `@/lib/utils`)
- Validação de APIs via **Zod schemas** em `src/lib/schemas.ts`
- Banco de dados via **Prisma** (`src/lib/prisma.ts` — singleton)
- Decisões de infra/banco → registre em `intelligence/memory/decisions.md`

## Estrutura Principal
- `src/app/(platform)/` → vitrine pública para o cliente final
- `src/app/(admin)/` → painel interno para gestão
- `src/app/api/` → API routes Next.js
- `src/modules/` → tipos e lógica de domínio (inventory, leads, finance, shared)
- `src/lib/` → prisma, schemas Zod, cn(), utils

## Comandos Úteis
- `npm run dev` → servidor local
- `npm run typecheck` → verifica tipos TypeScript
- `npx prisma studio` → UI do banco de dados
- `npx prisma migrate dev` → cria e executa migrations
