# CoreBrain Export — gera arquivos de regras para Cursor, Windsurf e outros
# Uso: .\scripts\cb-export.ps1 (rode na pasta raiz do projeto)

$SkillsPath = ".claude\commands"

if (!(Test-Path $SkillsPath)) {
    Write-Host "Erro: rode este script na raiz de um projeto com CoreBrain." -ForegroundColor Red
    exit 1
}

# Lê nomes das skills
$skills = (Get-ChildItem "$SkillsPath\*.md" | ForEach-Object { $_.BaseName }) -join ", "

# Lê contexto do projeto se existir
$projectName = Split-Path -Leaf (Get-Location)
$projectDesc = "Ver memory/context.md"
if (Test-Path "memory\context.md") {
    $firstLines = Get-Content "memory\context.md" -TotalCount 5 | Where-Object { $_ -match "Objetivo|objetivo" }
    if ($firstLines) { $projectDesc = ($firstLines | Select-Object -First 1) -replace "##\s*", "" }
}

$rules = @"
# CoreBrain — Regras do Projeto: $projectName

Você e um assistente expert. Antes de agir, leia memory/context.md.

## Contexto
$projectDesc

## Arquivos de Memoria
- memory/context.md   — objetivo, stack e escopo (LEIA PRIMEIRO)
- memory/decisions.md — decisoes arquiteturais (adicione, nunca edite)
- memory/logs.md      — log de execucao da sessao atual

## Skills Disponiveis
$skills

## Regras de Codigo
- TypeScript obrigatorio. Nunca use o tipo `any`.
- UI: sempre Tailwind CSS + shadcn/ui. Sem CSS puro.
- Backend: Node/Express ou Next.js API routes. Valide inputs nas bordas.
- Banco: PostgreSQL com schemas tipados. Sem queries raw sem validacao.

## Fluxo de Trabalho
1. Leia memory/context.md para entender o projeto
2. Para tarefas complexas, liste os passos antes de executar
3. Registre decisoes importantes em memory/decisions.md
4. Ao final de cada sessao, atualize memory/logs.md com o que foi feito
"@

# Escreve os arquivos
Set-Content -Path ".cursorrules"       -Value $rules -Encoding UTF8
Set-Content -Path ".windsurfrules"     -Value $rules -Encoding UTF8
Set-Content -Path ".antigravityrules"  -Value $rules -Encoding UTF8
Set-Content -Path "SYSTEM_PROMPT.md"   -Value $rules -Encoding UTF8

Write-Host ""
Write-Host "  Arquivos gerados:" -ForegroundColor Cyan
Write-Host "  .cursorrules       -> Cursor (ativo automaticamente)" -ForegroundColor White
Write-Host "  .windsurfrules     -> Windsurf (ativo automaticamente)" -ForegroundColor White
Write-Host "  .antigravityrules  -> Antigravity (ativo automaticamente)" -ForegroundColor White
Write-Host "  SYSTEM_PROMPT.md   -> Cole como system prompt em qualquer outra ferramenta" -ForegroundColor White
Write-Host ""
