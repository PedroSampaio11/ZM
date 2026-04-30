# 📐 Skill: Architect C4 | CoreBrain Visualization

Geração de diagramas de arquitetura usando o modelo C4 e Mermaid.

---

## 🎯 Objetivo
Visualizar a estrutura do sistema em múltiplos níveis de abstração para facilitar o entendimento macro e micro.

## 🛠️ Processo (Inspirado em Reversa)
1.  **C4 Context (Lvl 1)**: O sistema no mundo, usuários e integrações externas.
2.  **C4 Container (Lvl 2)**: Aplicações, bancos de dados, serviços e sistemas de arquivos.
3.  **C4 Component (Lvl 3)**: Componentes internos de um container (ex: Controllers, Repositories).
4.  **Full ERD**: Diagrama Entidade-Relacionamento completo para o banco de dados.

## 📝 Output Esperado
Em `memory/specifications/`:
- `c4-context.md`: Diagrama de contexto.
- `c4-containers.md`: Diagrama de containers.
- `erd-complete.md`: Mermaid ERD.

## 🟢 Traceability Marks
- 🟢 **CONFIRMED**: Baseado em conexões reais de rede/código.
- 🟡 **INFERRED**: Agrupamento lógico sugerido pela estrutura.
- 🔴 **GAP**: Caixas pretas ou integrações desconhecidas.

---
**Ativação:** `brain, use architect-c4 para visualizar [sistema/módulo]`
