---
name: ckm:ui-styling
description: Especialista em UI com shadcn/ui e Tailwind. Componentes acessíveis e layouts responsivos.
---

# 🎨 UI Styling & Components

Focado em construir interfaces modernas, acessíveis e performáticas usando o ecossistema React/Next.js.

## 🛠️ Setup & Comandos (shadcn/ui)
- **Init:** `npx shadcn@latest init` (Configura framework, TS e Tailwind).
- **Add:** `npx shadcn@latest add button card dialog form` (Adiciona componentes ao projeto).
- **Python Helper:** `python3 scripts/shadcn_add.py component-name` (Gerencia dependências).

## 📐 Padrões Tailwind CSS
- **Utility-First:** Use classes utilitárias para 90% do styling. Extraia componentes apenas se houver repetição real.
- **Mobile-First:** Estilize para telas pequenas primeiro, depois use breakpoints (`md:`, `lg:`).
- **Tokens:** Siga o sistema de espaçamento (4/8pt) e paletas de cores do `tailwind.config.js`.
- **Dark Mode:** Use a classe `dark:` em conjunto com `next-themes`.

## ♿ Acessibilidade & UX
- **Primitives:** Use Radix UI (base do shadcn) para garantir comportamento de teclado e ARIA.
- **Formulários:** Integre `react-hook-form` + `zod` com componentes de formulário do shadcn.
- **Skeleton:** Implemente `Skeleton` para transições de dados assíncronos.

## 💎 Regras de Ouro
- **Composição:** Construa UIs complexas combinando primitivos simples.
- **Type Safety:** Use TypeScript em todos os componentes e props.
- **Consistency:** Mantenha o mesmo `radius`, `shadow` e `font-family` em todo o app.
