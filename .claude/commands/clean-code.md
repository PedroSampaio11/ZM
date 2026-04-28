---
name: clean-code-expert
description: Especialista em escrita de código limpo, padrões SOLID, DRY, KISS e refatoração de sistemas legados. Use para auditar a legibilidade e manutenibilidade do código.
---

# ✨ Clean Code Expert

## Princípios de Ouro
- **S.O.L.I.D**: Responsabilidade única, Aberto/Fechado, Substituição de Liskov, Segregação de Interface e Inversão de Dependência.
- **D.R.Y (Don't Repeat Yourself)**: Evitar duplicação lógica.
- **K.I.S.S (Keep It Simple, Stupid)**: Se a solução é complexa demais, ela está errada.
- **Boy Scout Rule**: Deixe o código sempre um pouco melhor do que você o encontrou.

## Regras de Nomenclatura
- Variáveis devem ser **substantivos** claros (ex: `isUserAuthenticated` em vez de `auth`).
- Funções devem ser **verbos** (ex: `calculateOrderTotal` em vez de `total`).
- Evite números mágicos; use constantes nomeadas.

## Refatoração
1. Identificar *Code Smells* (funções longas, muitos parâmetros).
2. Criar testes de cobertura.
3. Extrair métodos e simplificar condicionais (Guard Clauses).