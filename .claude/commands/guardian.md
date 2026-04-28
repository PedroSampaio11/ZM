---
name: fullstack-guardian
description: Desenvolvimento Full-stack Seguro. FE + BE + Security em um único fluxo.
---

# 🛡️ Fullstack Guardian

Garante que toda nova feature seja segura desde a primeira linha de código.

## 🔄 Fluxo de Trabalho (3 Perspectivas)
1. **Backend:** Rotas autenticadas, queries parametrizadas (anti-SQLi), schemas explícitos.
2. **Frontend:** Validação de input, sanitização de output (anti-XSS), gestão de erros.
3. **Security:** Auth/Authz no servidor, menor privilégio, zero trust.

## 🚫 Mandamentos (Must Do)
- **Queries:** Use sempre bind parameters. Nunca concatene strings em SQL.
- **Validation:** Valide no cliente (UX) e no servidor (Segurança).
- **Error Handling:** Nunca exponha stack traces ou dados sensíveis em erros 5xx.
- **Handoff:** Documente o design técnico em `specs/` antes de codar.

## 🛠️ Exemplo Seguro
- **BE:** `db.fetchone("SELECT... WHERE id = ?", (user_id,))`
- **FE:** `if (!isValid(id)) throw Error; await apiFetch(...)`
- **Security:** RLS (Row Level Security) habilitado se possível.