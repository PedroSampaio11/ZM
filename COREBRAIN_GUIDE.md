# 🧠 CoreBrain | O Sistema Operacional de Inteligência da FourCoders

O **CoreBrain** é um ecossistema de agentes autônomos e memória persistente desenhado para levar projetos da concepção ao scale-up com custo zero de infraestrutura de IA e máxima fidelidade à visão do CEO.

---

## 🏗️ 1. Arquitetura do Sistema

O CoreBrain opera em três camadas:

1.  **Skills (Córtex Executivo)**: Localizadas em `.claude/commands/`. São 20+ especialistas prontos para agir.
2.  **Obsidian (Memória Episódica)**: Armazenada em `/memory`. Mantém o contexto de decisões, logs e o estado atual do projeto.
3.  **ChromaDB (Memória Semântica)**: RAG Local que permite ao CoreBrain "lembrar" padrões de código e soluções de outros projetos sem custo de API.

---

## 🔄 2. Protocolo de Handoff (Retorno de Skills)

Para garantir que o trabalho não se perca entre uma especialidade e outra, o CoreBrain utiliza o **Protocolo de Handoff**:

1.  **Ativação**: O usuário (Pedro) ou o `brain` ativa uma skill (ex: `database-architect`).
2.  **Execução**: A skill realiza a tarefa e valida contra os padrões de `clean-code`.
3.  **Registro**: A skill escreve um resumo no `memory/logs.md` e, se necessário, gera um "Ticket de Próximo Passo" para a próxima skill.
4.  **Passagem de Bastão**: Ex: O `database-architect` finaliza o esquema e chama o `senior-backend` para criar as rotas.

---

## 📂 3. Como Implementar em Novos Projetos

Para levar o CoreBrain para um novo projeto (ex: um novo SaaS):

1.  **Clone a Estrutura**: Copie a pasta `.claude/` para a raiz do novo projeto.
2.  **Inicie a Memória**: Crie a pasta `/memory` e o arquivo `context.md` descrevendo o novo projeto.
3.  **Sincronize o ChromaDB**: Execute o comando de indexação para que o CoreBrain conheça os novos arquivos.
4.  **Invoque o Brain**: Comece com: *"Brain, analise o context.md e me diga qual o primeiro passo conforme o CoreBrain Guide"*.

---

## 🛠️ 4. Gestão de Memória Dinâmica (Obsidian)

O agente deve manter o Obsidian atualizado automaticamente:
- **`memory/context.md`**: O que estamos fazendo agora?
- **`memory/decisions.md`**: Por que escolhemos a tecnologia X e não a Y? (Essencial para não repetir erros).
- **`memory/identity.md`**: Atalho para a skill `pedro-identity`.

---

## 🎯 5. RAG Local & Custo Zero

O CoreBrain prioriza o uso de ferramentas locais (ChromaDB) para:
- Pesquisar em toda a sua base de conhecimento de todos os projetos.
- Reutilizar componentes UI/UX premium da FourCoders.
- Consultar documentações salvas localmente em Markdown.

---

**Assinado:** *CoreBrain Orchestrator*
