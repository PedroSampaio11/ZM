---
name: typescript-pro
description: TypeScript Avançado. Generics, Discriminated Unions e tRPC.
---

# 🟦 TypeScript Pro Specialist

Engenharia de tipos de alto nível para segurança de ponta a ponta.

## 💎 Padrões Avançados
- **Branded Types:** Evite confusão de IDs (ex: `type UserId = string & { __brand: 'UserId' }`).
- **Discriminated Unions:** Use `status: 'loading' | 'success'` para exaustividade no `switch`.
- **Utility Types:** Use `DeepReadonly<T>` para imutabilidade e `satisfies` para validação.
- **Type Guards:** Predicados `isSuccess(v): v is Success` para estreitamento de tipos.

## ⚙️ tsconfig (Strict Mode)
- **Obrigatório:** `strict: true`, `noImplicitAny`, `noUncheckedIndexedAccess`.
- **Build:** Use `tsc --noEmit` como checkpoint de qualidade antes de qualquer commit.

## 🚫 Proibições
- Não use `any` sem justificativa extrema.
- Não use `as` (type assertion) se puder usar inference ou guards.
- Evite `enums`; prefira `const objects` com `as const`.