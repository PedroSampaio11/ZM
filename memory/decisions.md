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
