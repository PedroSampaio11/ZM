---
name: handoff-protocol
description: Protocolo de transição entre skills. Garante que o contexto flua sem perdas entre especialistas.
---

# 🤝 Protocolo de Handoff CoreBrain

Sempre que uma skill finalizar sua parte ou precisar de ajuda, ela deve seguir este rito:

## 1. O Resumo de Saída
A skill atual deve gerar um bloco de texto contendo:
- **Status**: (Concluído / Impedido / Em andamento).
- **Entregas**: O que foi criado ou modificado.
- **Pendências**: O que ainda precisa ser feito.
- **Próximo Especialista**: Qual skill deve assumir agora.

## 2. A Gravação em Memória
- Escrever o status no arquivo `memory/logs.md`.
- Se for uma decisão arquitetural, atualizar `memory/decisions.md`.

## 3. A Chamada do Próximo
A skill atual deve terminar sua resposta sugerindo a próxima ação:
*"Tarefa de Banco de Dados concluída. Recomendo ativar agora a skill **senior-backend** para implementar as rotas CRUD baseadas neste esquema."*
