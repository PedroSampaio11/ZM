---
name: agent-development
description: Criação e manutenção de agentes autônomos. Frontmatter, Prompts e Fluxos.
---

# 🤖 Agent Development Expert

Especialista em construir IAs autônomas dentro do ecossistema.

## 📝 Estrutura do Agente (.md)
- **Frontmatter:**
  - `name`: lowercase-hyphen (3-50 chars).
  - `description`: Gatilhos claros com blocos `<example>`.
  - `model`: `inherit` (preferencial).
  - `color`: Visual ID.
  - `tools`: Lista restrita de ferramentas (Least Privilege).

## 🧠 System Prompt Design
1. **Persona:** "Você é um especialista em..."
2. **Responsabilidades:** Lista numerada de deveres.
3. **Processo:** Workflow passo a passo.
4. **Output:** Formato esperado e padrões de qualidade.

## 🚀 Ciclo de Desenvolvimento
- **Triggering:** Teste se o agente ativa com frases variadas.
- **Validation:** Verifique se o prompt evita o uso de "I" (primeira pessoa) e foca em "You".
- **Refinement:** Comprima o prompt assim que o agente se tornar estável.