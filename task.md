# 📋 Lista de Tarefas: CoreBrain V2 (Otimização & Escala)

## 🧠 Orquestração & Memória
- [x] Implementar a **Regra dos 3 (Flush de Contexto)**: Automatizar o arquivamento de `logs.md` para `decisions.md` a cada 3 tarefas concluídas via `scripts/cb-flush.py`.
- [x] Validar a sincronização do `state.json` via `scripts/cb-state.py`.
- [x] Testar a indexação semântica no ChromaDB usando o `scripts/cb-sync.py`.

## 🖥️ Dashboard (UX/UI)
- [x] Adicionar funcionalidade de **Exportação de Regras** na UI (gerar `.cursorrules` e `.antigravityrules` via Dashboard).
- [ ] Implementar um indicador visual de "Token Usage" ou "Context Density" no Overview.
- [x] Corrigir o fetch de agentes para garantir que todos os `.md` em `.claude/agents/` sejam listados.

## 🛠️ Automação & Infra
- [ ] Teste de Stress do `cb-init.ps1`: Simular a criação de um novo projeto do zero e validar se o Handoff Protocol funciona.
- [ ] Auditar as 20+ skills para garantir que nenhuma ultrapasse o limite de 2KB por arquivo (Zero-Waste).

## ✅ Concluído
- [x] Compressão de Skills (de 150KB para 30KB).
- [x] Estrutura de Memória JSON (`graph.json`, `state.json`).
- [x] Dashboard funcional com 5 abas principais.
- [x] Script `cb-init.ps1` portável.

---
*Gerado por: CoreBrain Orchestrator | PedroSampaio Ecosystem*
