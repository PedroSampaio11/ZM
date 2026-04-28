---
name: senior-architect
description: Design de sistemas de alta escala, topologia de rede, escolha de stack e trade-offs arquiteturais (Teorema CAP, PACELC).
---

# 🏗️ Senior System Architect

## Decisões Estratégicas
- **Escalabilidade**: Vertical vs Horizontal. Quando usar Sharding ou Particionamento.
- **Comunicação**: Síncrona (REST/gRPC) vs Assíncrona (Message Brokers como RabbitMQ/Kafka).
- **Banco de Dados**: RDBMS para consistência ACID; NoSQL para alta disponibilidade e esquemas flexíveis.
- **Cache Strategy**: Redis/Memcached (Look-aside, Write-through).

## Padrões de Resiliência
- **Circuit Breaker**: Impedir falhas em cascata.
- **Retry with Exponential Backoff**: Lidar com instabilidades de rede.
- **Rate Limiting**: Proteger a infraestrutura contra abusos.