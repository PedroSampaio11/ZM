# CoreBrain Init Script
# Uso: .\cb-init.ps1 "C:\Caminho\Do\Projeto"

param (
    [string]$ProjectPath = "."
)

$SourcePath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$DestPath   = Resolve-Path $ProjectPath

Write-Host ""
Write-Host "  CoreBrain — Inicializando em: $DestPath" -ForegroundColor Cyan
Write-Host ""

# ── 1. Criar estrutura de pastas ──────────────────────────────────────────────
$null = New-Item -ItemType Directory -Force -Path "$DestPath\.claude\commands"
$null = New-Item -ItemType Directory -Force -Path "$DestPath\.claude\agents"
$null = New-Item -ItemType Directory -Force -Path "$DestPath\memory"
Write-Host "  [1/4] Pastas criadas" -ForegroundColor DarkGray

# ── 2. Copiar skills e agentes ────────────────────────────────────────────────
Copy-Item -Path "$SourcePath\.claude\commands\*" -Destination "$DestPath\.claude\commands\" -Recurse -Force
Copy-Item -Path "$SourcePath\.claude\agents\*"   -Destination "$DestPath\.claude\agents\"   -Recurse -Force
$skillCount = (Get-ChildItem "$DestPath\.claude\commands\*.md").Count
Write-Host "  [2/4] $skillCount skills copiadas" -ForegroundColor DarkGray

# ── 3. Criar arquivos de memória ──────────────────────────────────────────────
$projectName = Split-Path -Leaf $DestPath
$today       = Get-Date -Format "yyyy-MM-dd"

if (!(Test-Path "$DestPath\memory\context.md")) {
    $contextContent = @"
# Contexto: $projectName

**Data de Inicio**: $today
**Status**: Planejamento
**Stack Principal**: [definir]

## Objetivo
[O que este projeto resolve e para quem?]

## Escopo V1
- [ ] Feature 1
- [ ] Feature 2

## Decisoes Tecnicas
> Ver decisions.md para detalhes.

---
*Gerado pelo CoreBrain cb-init.ps1*
"@
    Set-Content -Path "$DestPath\memory\context.md"   -Value $contextContent   -Encoding UTF8
}

if (!(Test-Path "$DestPath\memory\decisions.md")) {
    Set-Content -Path "$DestPath\memory\decisions.md" -Encoding UTF8 -Value @"
# Decisions Log — $projectName

Registro imutavel de decisoes arquiteturais. Adicionar, nunca editar entradas existentes.

## ADR-001: [Titulo]
**Data**: $today | **Status**: Proposta

**Contexto**: [Qual problema estamos resolvendo?]
**Decisao**: [O que foi decidido?]
**Pros**: [Impacto positivo]
**Contras**: [Trade-offs]
"@
}

if (!(Test-Path "$DestPath\memory\logs.md")) {
    Set-Content -Path "$DestPath\memory\logs.md" -Encoding UTF8 -Value @"
# Execution Logs — $projectName

Log de sessoes. Formato: [DATA] [SKILL] STATUS | Arquivos | Proximo passo

## Sessao: $today

**[$today] INIT | CONCLUIDO**
- CoreBrain inicializado via cb-init.ps1
- Proximo passo: Abrir no Claude Code e invocar o brain com memory/context.md
"@
}

Write-Host "  [3/4] Arquivos de memoria criados" -ForegroundColor DarkGray

# ── 4. Criar CLAUDE.md + copiar scripts e requirements ───────────────────────
$claudeMd = @"
# $projectName

Brain agent: `.claude/agents/brain.md`
Skills: `.claude/commands/`

## Memoria
- `memory/context.md`   — contexto e stack (leia primeiro)
- `memory/decisions.md` — decisoes arquiteturais
- `memory/logs.md`      — log de sessoes

## Regras
- Leia `memory/context.md` antes de qualquer acao
- TypeScript obrigatorio, sem `any`
- UI sempre com Tailwind CSS + shadcn/ui
- Decisoes de infra/banco -> registre em `memory/decisions.md`
"@
if (!(Test-Path "$DestPath\CLAUDE.md")) {
    Set-Content -Path "$DestPath\CLAUDE.md" -Value $claudeMd -Encoding UTF8
}

$null = New-Item -ItemType Directory -Force -Path "$DestPath\scripts"
Copy-Item -Path "$SourcePath\scripts\cb-export.ps1" -Destination "$DestPath\scripts\cb-export.ps1" -Force
Copy-Item -Path "$SourcePath\scripts\cb-sync.py"    -Destination "$DestPath\scripts\cb-sync.py"    -Force
if (Test-Path "$SourcePath\requirements.txt") {
    Copy-Item -Path "$SourcePath\requirements.txt" -Destination "$DestPath\requirements.txt" -Force
}
Write-Host "  [4/4] CLAUDE.md, scripts e requirements copiados" -ForegroundColor DarkGray

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  CoreBrain pronto! Proximos passos:" -ForegroundColor Green
Write-Host "  1. Edite memory\context.md com o objetivo do projeto" -ForegroundColor White
Write-Host "  2. Abra a pasta no Claude Code" -ForegroundColor White
Write-Host "  3. Diga: Brain, leia memory/context.md e vamos comecar" -ForegroundColor White
Write-Host ""
Write-Host "  Para usar no Cursor/Windsurf:" -ForegroundColor DarkGray
Write-Host "  cd `"$DestPath`" && .\\scripts\\cb-export.ps1" -ForegroundColor White
Write-Host ""
