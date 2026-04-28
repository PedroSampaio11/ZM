# Contexto: CoreBrain

**Data de Início**: 2026-04-01
**Status**: 🟢 Em Desenvolvimento
**Stack Principal**: Claude Code, Next.js 15, Tailwind CSS, TypeScript, ChromaDB (Python), Obsidian, PowerShell

---

## Objetivo
CoreBrain é o sistema operacional de inteligência da FourCoders Studio. Transforma o Claude em um parceiro estratégico completo com memória persistente, 20+ skills especializadas e automação de workflows de desenvolvimento.

## Escopo V1
- Agente Orquestrador central (brain.md)
- 20+ Skills especializadas em `.claude/commands/`
- Dashboard de visualização em Next.js
- Scripts de automação (cb-init, cb-sync)
- Templates de memória no Obsidian
- RAG local via ChromaDB

## Decisões Técnicas Chave
> Ver `decisions.md` para detalhes completos.

| Decisão | Alternativa | Motivo |
|---|---|---|
| Claude Code como runtime | LangChain | Zero infra, custo = 0 |
| ChromaDB local | Pinecone/Weaviate | Privacidade + custo zero |
| Next.js 15 App Router | React SPA | SSR + API routes no mesmo projeto |
| Obsidian como memória episódica | Notion | Local-first, sem dependência de cloud |

## Estado Atual
- V1.0 finalizada e funcional
- Dashboard com 4 tabs (Overview, Skills, Memória, Agentes)
- Skills validadas e com nomes corrigidos no brain.md
- cb-init.ps1 portável (sem hardcoded paths)
- cb-sync.py com suporte ChromaDB + fallback JSON

---
*Última atualização: 2026-04-28 · CoreBrain Orchestrator*
