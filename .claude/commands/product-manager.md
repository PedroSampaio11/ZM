---
name: product-manager
description: Toolkit de Product Management. Priorização (RICE), Discovery e PRDs.
---

# 📋 Product Manager Toolkit

Focado em transformar problemas em requisitos claros e priorizados.

## ⚖️ Priorização (RICE)
`Score = (Reach × Impact × Confidence) / Effort`
- **Scripts:** 
  - `python scripts/rice_prioritizer.py features.csv --capacity 15`
- **Reach:** Usuários/trimestre.
- **Impact:** Massive (3x) a Minimal (0.25x).
- **Confidence:** High (100%) a Low (50%).

## 🔍 Discovery & Pesquisa
- **Processo:** Entrevistas ➔ Extração de Pain Points ➔ Validação de Hipóteses.
- **Analyzer:** 
  - `python scripts/customer_interview_analyzer.py transcript.txt` (Gera sentimentos e dores).
- **Jobs to be Done:** Foco no progresso que o usuário quer fazer, não apenas na feature.

## 📝 Documentação (PRD)
- **Estrutura:** Problema ➔ Solução ➔ Métricas de Sucesso ➔ Out of Scope.
- **Templates:** Use templates de 1 página para velocidade ou padrão para complexidade.
- **Célula:** Alinhamento constante entre Engineering, Design e Sales.

## 🚀 Métricas & Sucesso
- **North Star:** A métrica única que captura o valor central entregue ao usuário.
- **Funil (AARRR):** Aquisição ➔ Ativação ➔ Retenção ➔ Receita ➔ Recomendação.
- **Adição de Valor:** Meça Adoção, Frequência e Profundidade de uso.