# Decisions Log — CoreBrain

Registro imutável de decisões arquiteturais. Adicionar, nunca editar entradas existentes.

---

## ADR-001: Claude Code como runtime de agentes
**Data**: 2026-04-01 | **Status**: Aceita

**Contexto**: Precisávamos de um runtime para orquestrar agentes IA sem custo de infraestrutura.

**Decisão**: Usar Claude Code CLI + sistema de skills em `.claude/commands/` como agentes especializados.

**Prós**: Zero custo de infra, integração nativa com o modelo, sistema de handoff via arquivos Markdown.
**Contras**: Dependência do Claude Code CLI, não é um servidor HTTP tradicional.

---

## ADR-002: Obsidian como memória episódica
**Data**: 2026-04-01 | **Status**: Aceita

**Contexto**: Precisávamos de um sistema de memória persistente que sobrevivesse entre sessões.

**Decisão**: Usar Obsidian com arquivos Markdown na pasta `memory/` como base de conhecimento.

**Prós**: Local-first, sem dependência de cloud, suporte a links entre notas, Dataview para queries.
**Contras**: Requer sincronização manual; não há API REST nativa.

---

## ADR-003: ChromaDB para memória semântica (RAG local)
**Data**: 2026-04-15 | **Status**: Aceita

**Contexto**: Precisávamos de busca semântica nas skills sem custo de API de embeddings externo.

**Decisão**: ChromaDB local com `cb-sync.py` para indexar skills. Fallback para `vector_cache.json` se ChromaDB não instalado.

**Prós**: Custo zero, privacidade total, funciona offline.
**Contras**: Requer Python + pip install chromadb no ambiente.

---

## ADR-004: Next.js 15 App Router para o dashboard
**Data**: 2026-04-20 | **Status**: Aceita

**Contexto**: O dashboard precisa ler arquivos do filesystem (skills, memória, agentes) em tempo real.

**Decisão**: Next.js 15 com API routes no App Router para servir dados do filesystem local.

**Prós**: TypeScript nativo, Tailwind integrado, API routes no mesmo processo = sem CORS.
**Contras**: Requer `npm run dev` rodando localmente; não é deployável como SaaS sem adaptar os paths.

---
*Assine toda nova decisão: `## ADR-00N: Título | Data | Status`*

## 📦 Arquivo de Sessão (Auto-Flush)
**[2026-04-28] SETUP | ✅ CONCLUÍDO**
- Criados: brain.md, 20+ skills, templates Obsidian, cb-init.ps1, cb-sync.py
- Resultado: CoreBrain V1.0 estrutura base criada

**[2026-04-28] BUG_FIX | ✅ CONCLUÍDO**
- Corrigidos 5 gaps críticos: nomes de skills no brain.md, tool memory-compressor inexistente, cb-sync.py sem ChromaDB real, hardcoded path no cb-init.ps1, template de context ausente
- Arquivos: brain.md, cb-init.ps1, cb-sync.py, context-template.md

**[2026-04-28] DASHBOARD | ✅ CONCLUÍDO**
- Dashboard Next.js completamente reescrito com 4 tabs funcionais (Overview, Skills, Memória, Agentes)
- Bug corrigido: `endswith` → `endsWith` em api/skills/route.ts
- Nova rota: api/agents/route.ts — lê e parseia frontmatter do brain.md
- Skills route: categorias mapeadas para todos os 25+ skills
- Arquivo: dashboard/src/app/page.tsx, api/skills/route.ts, api/agents/route.ts

**[2026-04-28] MEMORY_SEED | ✅ CONCLUÍDO**
- Criados: memory/context.md, memory/decisions.md, memory/logs.md, memory/000-INDEX.md
- Obsidian vault agora tem estrutura navegável

---

**[2026-04-28] ORCHESTRATION | ✅ CONCLUÍDO**
- Analisado `context.md` e gerada a lista de tarefas V2 para otimização e escala.
- Arquivo: `task.md`
- Próximo passo: Iniciar a implementação da "Regra dos 3" para flush automático de contexto.

---

*Próxima compressão pendente (Atualmente: 1 tarefa nova neste ciclo).*


---
