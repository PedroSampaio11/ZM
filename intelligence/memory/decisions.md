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

## 📦 Arquivo de Sessão (Auto-Flush)
**[2026-04-28] AUTOMATION | ✅ CONCLUÍDO**
- Criado e executado `scripts/cb-flush.py` (Regra dos 3).
- 5 tarefas arquivadas automaticamente em `decisions.md`.
- Arquivo: `scripts/cb-flush.py`
- Próximo passo: Validar sincronização do `state.json` via `cb-state.py`.

**[2026-04-28] DASHBOARD_SYNC | ✅ CONCLUÍDO**
- Criada API `/api/state` para servir dados do `state.json`.
- Interface do Dashboard atualizada para exibir a versão do projeto e timestamp de sincronização.
- Arquivos: `dashboard/src/app/api/state/route.ts`, `dashboard/src/app/page.tsx`.
- Próximo passo: Testar indexação semântica via `cb-sync.py`.

**[2026-04-28] FULL_INTEGRATION | ✅ CONCLUÍDO**
- Instalado `chromadb` no ambiente Python e ativada a busca semântica real (RAG).
- Implementada funcionalidade de "Exportar Agora" no Dashboard para gerar `.cursorrules`, `.windsurfrules` e `.antigravityrules`.
- Corrigido e otimizado o mapeamento de agentes no Dashboard.
- Arquivos: `dashboard/src/app/api/export/route.ts`, `dashboard/src/app/page.tsx`.
- Próximo passo: Implementar indicador de densidade de contexto (Tokens) no Dashboard.

---

*Próxima compressão pendente (Atualmente: 0 tarefas novas - Auto-flush pode ser disparado em breve).*

---

## ADR-005: Multi-Tenancy com Instância Compartilhada (RLS)
**Data**: 2026-05-05 | **Status**: Aceita

**Contexto**: A plataforma precisar suportar N lojas (1 a centenas) sem reescrever o core. Avaliamos schema-por-tenant (isolamento total, complexidade alta) vs. instância compartilhada com RLS (simples, escalável, Supabase-native).

**Decisão**: Instância compartilhada no mesmo PostgreSQL/Supabase. Isolamento via `storeId` denormalizado em todas as tabelas (`Store`, `Partner`, `Vehicle`, `Lead`, `IntegrationConfig`). RLS do Supabase como última linha de defesa.

**Prós**: Queries simples por `storeId`, zero overhead operacional por novo tenant, Supabase RLS como guardrail, slugs prontos para subdomínio.
**Contras**: Todas as lojas compartilham o mesmo banco — a chave `storeId` deve sempre estar presente nas queries de negócio.

**Invariante obrigatória**: Toda query de dados deve filtrar por `storeId`. O `storeId` deve ser injetado pelo contexto de autenticação, nunca pela request body.

---

## ADR-006: Adapter Registry para Integrações de Mercado
**Data**: 2026-05-05 | **Status**: Aceita

**Contexto**: O sistema precisa suportar AutoCerto, Cockpit, Revenda Mais, Motor21, WebMotors, OLX Autos, Mobiauto, iCarros, Repasse e cadastro Manual. Cada sistema tem protocolo diferente (OAuth2, REST, XML).

**Decisão**: `ADAPTER_REGISTRY` em `src/lib/inventory-sync/adapter-registry.ts` mapeia `AdapterType` (enum Prisma) para a classe que implementa `InventoryAdapter`. Credenciais armazenadas por `IntegrationConfig` no banco (JSON, encriptar em produção). Cada `Partner` pode ter múltiplos `IntegrationConfig`.

**Para adicionar novo adapter**: implementar `InventoryAdapter`, registrar no `ADAPTER_REGISTRY`. Zero mudança no `SyncEngine` ou nas rotas.

**Prós**: Open/Closed principle — adicionar Cockpit não toca o core. `syncStore(storeId)` itera automaticamente sobre todas as integrações ativas da loja.
**Contras**: Credenciais em JSON requerem encriptação na camada de aplicação antes do GA (usar KMS ou Vault).

---

## ADR-007: Modelo de Segurança em Fases (MVP → Go-Live → Escala)
**Data**: 2026-05-13 | **Status**: Aceita

**Contexto**: Auditoria de segurança realizada em 2026-05-13 identificou a diferença entre o que é aceitável para uso interno (MVP) e o que é obrigatório antes do primeiro cliente pagante. O sistema opera em multi-tenant (ADR-005) — vazamento de dados entre stores é o risco crítico principal.

**Decisão**: Adotar modelo de segurança em 3 fases com critérios objetivos de go-live:

### Fase A — MVP (estado atual, uso interno)
Aceitável enquanto só Pedro usa o sistema:
- Auth por allowlist de email (`ADMIN_EMAILS` no middleware)
- `storeId` pode vir parcialmente do request (risco controlado com 1 usuário)
- Rate limit em memória (aceita reset a cada deploy)
- Dados de demo misturados com produção (separar antes do 1º cliente)
- Logs podem conter informações de debug

### Fase B — Pré-1º cliente (obrigatório antes de onboarding)
Implementar antes de qualquer cliente externo acessar o sistema:
1. **IDOR fix** — toda mutation verifica ownership via `storeId` (SEC-01)
2. **storeId do servidor** — remover `storeId` de request bodies, sempre via `getActiveStore()` (SEC-02)
3. **Fallback legado removido** — `user_metadata.storeId` eliminado de `get-store.ts` (SEC-03)
4. **Logs sanitizados** — credenciais DMS nunca aparecem em logs/traces (SEC-04)
5. **Rate limit persistente** — Upstash Redis ou `@vercel/kv` (SEC-05)
6. **Demo data removida** — `DELETE WHERE externalId LIKE 'DEMO-HUB-%'` (SEC-08)

### Fase C — Escala (primeiros 30 dias com clientes)
7. **Permissões por role** — `UserRole { OWNER | OPERATOR | VIEWER }` (SEC-06)
8. **RLS testado multi-tenant** — teste formal com dois tenants (SEC-07)
9. **Audit log** — tabela `AuditLog` para mutations críticas (SEC-11)
10. **Headers CSP completos** (SEC-12)
11. **Limite de storage por parceiro** (SEC-09)

**Invariantes permanentes (nunca negociáveis)**:
- `storeId` sempre injetado pelo servidor, nunca pelo cliente
- Credenciais DMS sempre encriptadas em repouso (AES-256-GCM)
- `SUPABASE_SERVICE_ROLE_KEY` e `CREDENTIALS_ENCRYPTION_KEY` nunca com prefixo `NEXT_PUBLIC_`
- Toda query de dados filtra por `storeId` (reforça ADR-005)

**Referência de implementação**: `intelligence/memory/backlog.md` seção `🔒 Segurança — Checklist Go-Live` com arquivos, linhas e fixes específicos para cada item SEC-01 a SEC-14.
