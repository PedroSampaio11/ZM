---
name: ckm:design-system
description: Arquitetura de Tokens e Slides. Primitivos, Semânticos e Componentes.
---

# 📐 Design System Architecture

Especialista em design sistemático e apresentações baseadas em dados.

## 💎 Estrutura de Tokens (3 Camadas)
1. **Primitive:** Valores brutos (ex: `--blue-600: #2563EB`).
2. **Semantic:** Propósito (ex: `--color-primary: var(--blue-600)`).
3. **Component:** Uso específico (ex: `--button-bg: var(--color-primary)`).

## 📊 Slide System (HTML/JS)
- **Engine:** Usa design tokens + Chart.js para apresentações persuasivas.
- **Search:** `python scripts/search-slides.py "investor pitch"`
- **Regras:**
  - Importe sempre `design-tokens.css`.
  - Use `var()` para todas as cores/fontes.
  - Alinhamento central e foco em conversão.

## 🛠️ Scripts & Validação
- **Generate:** `node scripts/generate-tokens.cjs` (JSON ➔ CSS).
- **Validate:** `node scripts/validate-tokens.cjs` (Detecta hex hardcoded).
- **Compliance:** Slides sem tokens são rejeitados.
