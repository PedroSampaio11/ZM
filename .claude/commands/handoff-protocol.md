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

## 2. Marcas de Rastreabilidade (Traceability)
Para garantir a fidelidade da informação, cada ponto crítico do handoff deve ser marcado com:
- 🟢 **CONFIRMED**: Informação extraída diretamente do código ou documentos (sempre que possível, citar o arquivo e linha).
- 🟡 **INFERRED**: Dedução lógica baseada em padrões, mas não validada explicitamente.
- 🔴 **GAP**: Ponto de dúvida ou informação faltante que requer validação humana (Pedro).

## 3. A Gravação em Memória
- Escrever o status no arquivo `memory/logs.md`.
- Se for uma decisão arquitetural, usar o template de ADR em `memory/decisions.md`.
- Manter o `memory/context.md` atualizado com o progresso macro.

## 4. A Chamada do Próximo
A skill atual deve terminar sua resposta sugerindo a próxima ação:
*"Tarefa de Banco de Dados concluída. Recomendo ativar agora a skill **senior-backend** para implementar as rotas CRUD baseadas neste esquema."*

