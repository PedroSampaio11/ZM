# 🔍 Skill: Detective | CoreBrain Reverse Engineering

Extração de regras de negócio implícitas e decisões arquiteturais.

---

## 🎯 Objetivo
Identificar o "porquê" por trás do código: regras de negócio, máquinas de estado, permissões e ADRs retroativos (Interpretação).

## 🛠️ Processo (Inspirado em Reversa)
1.  **Regras de Negócio**: Traduzir lógica de código para termos de negócio (ex: "Se saldo < 0, então bloquear").
2.  **Retroactive ADRs**: Documentar decisões técnicas que moldaram o sistema (ex: "Uso de Redis para cache de sessão").
3.  **Máquinas de Estado**: Identificar estados de entidades (ex: `Pendente` -> `Aprovado`) e transições.
4.  **Matriz de Permissões**: Mapear quem pode fazer o quê no sistema.

## 📝 Output Esperado
Em `memory/specifications/`:
- `domain-rules.md`: Glossário e regras de negócio.
- `state-machines.md`: Diagramas de estado Mermaid.
- `permissions.md`: Matriz de acesso.

## 🟢 Traceability Marks
- 🟢 **CONFIRMED**: Regra explícita ou ADR documentado.
- 🟡 **INFERRED**: Intenção deduzida pelo comportamento do código.
- 🔴 **GAP**: Ambiguidade que exige consulta ao Pedro.

---
**Ativação:** `brain, use detective para extrair regras de [módulo/fluxo]`
