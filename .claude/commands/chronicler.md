# 📝 Skill: Chronicler | CoreBrain Memory Automation

Automatiza o registro de sessões, logs e mudanças no Obsidian.

---

## 🎯 Objetivo
Garantir que cada interação relevante seja registrada no `memory/logs.md` e que o estado do projeto seja mantido sem intervenção manual do usuário.

## 🛠️ Ações do Chronicler
1.  **Resumo de Sessão**: Ao final de uma tarefa, gerar um log estruturado com:
    - Data/Hora.
    - O que foi feito.
    - Arquivos impactados.
    - Nível de confiança (Traceability).
2.  **Manutenção de Contexto**: Atualizar o `memory/context.md` se uma nova feature foi concluída.
3.  **Ticket Generator**: Se houver um `🔴 GAP` identificado por outra skill, o Chronicler cria um ticket de "Ação Necessária" no log.

## 📝 Formato do Log (Exemplo)
```markdown
### [2026-04-30] Sessão de Enriquecimento Reversa
- **Ação**: Implementação das skills Scout e Archaeologist.
- **Arquivos**: `.claude/commands/scout.md`, `.claude/commands/archaeologist.md`.
- **Traceability**: 🟢 CONFIRMED (Skills criadas e validadas).
- **Próximo Passo**: Rodar Scout no Dashboard.
```

---

**Comando de Ativação:** `brain, use chronicler para registrar esta sessão`
