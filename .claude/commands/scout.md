# 🕵️ Skill: Scout | CoreBrain Reverse Engineering

Mapeia a superfície de um projeto desconhecido ou legado para fornecer um inventário rápido.

---

## 🎯 Objetivo
Identificar a estrutura, stack tecnológica, dependências e pontos de entrada (Reconhecimento).

## 🛠️ Processo (Inspirado em Reversa)
1.  **Estrutura de pastas**: Listar árvore de diretórios excluindo ruídos (`node_modules`, `.git`, etc).
2.  **Tecnologias**: Identificar linguagens (extensões) e frameworks principais (`package.json`, `requirements.txt`).
3.  **Pontos de entrada**: Localizar arquivos `main`, `index`, `server`, `Dockerfile`, scripts de build/start.
4.  **Dependências**: Listar bibliotecas críticas e suas versões.
5.  **Cobertura de Testes**: Identificar frameworks e arquivos de teste (`*.test.*`, `*.spec.*`).

## 📝 Output Esperado
Em `memory/specifications/`:
- `inventory.md`: Inventário completo e topologia Mermaid.
- `dependencies.md`: Lista detalhada de dependências.

## 🟢 Traceability Marks
- 🟢 **CONFIRMED**: Visto diretamente no código/config.
- 🟡 **INFERRED**: Dedução baseada em padrões.
- 🔴 **GAP**: Informação faltante (ex: "Sem arquivo de config de DB").

---
**Ativação:** `brain, use scout para mapear [path]`

