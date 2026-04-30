# 🗄️ Master Schema: Super Loja 2026

**Status**: 🟢 Definido (Pronto para Implementação)  
**Stack**: PostgreSQL + Prisma ORM  
**Versão**: 1.0

---

## 🏗️ Modelagem de Dados

### 1. Núcleo de Parceiros (Partners)
Gerencia as lojas e concessionárias parceiras.

```prisma
model Partner {
  id            String    @id @default(cuid())
  name          String    // Nome da Loja
  document      String    @unique // CNPJ
  email         String?
  phone         String?
  address       String?
  city          String
  state         String
  commission    Float     @default(0.0) // Taxa negociada (Success Fee)
  isActive      Boolean   @default(true)
  scrapingUrl   String?   // URL base para o robô de inventário
  vehicles      Vehicle[]
  leads         Lead[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 2. Núcleo de Inventário (Vehicles)
Onde o estoque sincronizado reside. Note a estrutura modular para aceitar outros nichos.

```prisma
model Vehicle {
  id            String    @id @default(cuid())
  partnerId     String
  partner       Partner   @relation(fields: [partnerId], references: [id])
  
  // Dados Gerais
  brand         String    // Marca
  model         String    // Modelo
  version       String?   // Versão/Trim
  year          Int       // Ano Fabricação/Modelo
  mileage       Int       // Quilometragem
  price         Decimal   @db.Decimal(12, 2)
  fuel          String?   // Flex, Diesel, Elétrico
  transmission  String?   // Manual, Automático
  color         String?
  
  // Conteúdo & Mídia
  description   String?   @db.Text
  images        String[]  // Array de URLs das fotos
  videoUrl      String?   
  
  // Status & Controle
  status        VehicleStatus @default(AVAILABLE)
  externalId    String?   @unique // ID na loja original para sync
  lastSyncAt    DateTime  @default(now())
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum VehicleStatus {
  AVAILABLE
  RESERVED
  SOLD
  ARCHIVED
}
```

### 3. Núcleo de Leads & Conversão
O coração da operação do Vitor e do Pedro.

```prisma
model Lead {
  id            String    @id @default(cuid())
  name          String
  phone         String    // WhatsApp
  email         String?
  origin        String?   // Facebook Ads, Google, Orgânico
  
  // Contexto de Interesse
  vehicleId     String?
  vehicle       Vehicle?  @relation(fields: [vehicleId], references: [id])
  partnerId     String?
  partner       Partner?  @relation(fields: [partnerId], references: [id])
  
  // Qualificação (Agente IA)
  status        LeadStatus @default(NEW)
  score         Int       @default(0) // 0-100 (Potencial de Crédito/Interesse)
  summary       String?   @db.Text // Resumo da conversa da IA
  
  interactions  Interaction[]
  simulations   Simulation[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum LeadStatus {
  NEW
  AI_QUALIFYING
  QUALIFIED
  HANDOFF_HUMAN
  LOST
  CONVERTED
}
```

### 4. Núcleo de F&I (Finance)
Lógica de financiamento e simulações.

```prisma
model Simulation {
  id            String    @id @default(cuid())
  leadId        String
  lead          Lead      @relation(fields: [leadId], references: [id])
  
  downPayment   Decimal   @db.Decimal(12, 2) // Entrada
  installments  Int       // Número de parcelas
  monthlyRate   Float     // Taxa aplicada
  totalValue    Decimal   @db.Decimal(12, 2)
  bankName      String?
  
  status        SimulationStatus @default(PENDING)
  createdAt     DateTime  @default(now())
}

enum SimulationStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## 📍 Notas de Arquitetura
1. **Escalabilidade**: Para adicionar "Imóveis", basta criar um novo model `Property` seguindo o padrão de relação com `Partner` e `Lead`.
2. **Sync**: O campo `externalId` no `Vehicle` é crucial para que o robô de scraping não duplique carros.
3. **Traceability**: O campo `score` no `Lead` será alimentado pelo agente de IA após a triagem.
