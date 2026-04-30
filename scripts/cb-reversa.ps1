# CoreBrain Reversa Orchestrator
# Este script inicia o pipeline de engenharia reversa inspirado no framework Reversa.

param (
    [string]$Path = ".",
    [string]$Phase = "scout"
)

Write-Host "🧠 CoreBrain REVERSA Orchestrator" -ForegroundColor Cyan
Write-Host "---------------------------------"

if ($Phase -eq "scout") {
    Write-Host "[1/3] Iniciando Reconhecimento (Scout)..." -ForegroundColor Yellow
    # Aqui o script apenas prepara o terreno, o CoreBrain (LLM) faz o trabalho pesado.
    Write-Host "Comando recomendado para o Brain:" -ForegroundColor Gray
    Write-Host "  brain, use scout para mapear o projeto em: $Path" -ForegroundColor Green
} elseif ($Phase -eq "archaeologist") {
    Write-Host "[2/3] Iniciando Escavação (Archaeologist)..." -ForegroundColor Yellow
    Write-Host "Comando recomendado para o Brain:" -ForegroundColor Gray
    Write-Host "  brain, use archaeologist para analisar os módulos em: $Path" -ForegroundColor Green
}

Write-Host "`nPipeline pronto. Aguardando comando no chat." -ForegroundColor Cyan
