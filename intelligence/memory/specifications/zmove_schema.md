# 🗄️ Master Schema: Super Loja 2026

**Status**: 🟢 V1.1 Aplicado em Produção (2026-04-30)
**Stack**: PostgreSQL + Prisma ORM + Supabase
**Versão**: 1.1

---

## 🏗️ Modelagem de Dados

### 1. Parceiros (Partners)
```prisma
model Partner {
  id          String  @id @default(cuid())
  name        String
  document    String  @unique // CNPJ (14 dígitos sem pontuação)
  email       String?
  phone       String?
  address     String?
  city        String
  state       String
  commission  Float   @default(0.0) // % success fee
  isActive    Boolean @default(true)
  scrapingUrl String?
  vehicles    Vehicle[]
  leads       Lead[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([isActive])
  @@index([state, city])
}
```

### 2. Inventário (Vehicles)
```prisma
model Vehicle {
  id           String        @id @default(cuid())
  partnerId    String
  partner      Partner       @relation(...)
  brand        String
  model        String
  version      String?
  year         Int
  mileage      Int
  price        Decimal       @db.Decimal(12, 2)
  fuel         String?
  transmission String?
  color        String?
  description  String?       @db.Text
  images       String[]
  videoUrl     String?
  status       VehicleStatus @default(AVAILABLE)
  externalId   String?       @unique  // sync deduplication
  lastSyncAt   DateTime      @default(now())
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  @@index([partnerId, status, brand, model, price, year])
}

enum VehicleStatus { AVAILABLE | RESERVED | SOLD | ARCHIVED }
```

### 3. Leads (Captura & Qualificação)
```prisma
model Lead {
  id           String      @id @default(cuid())
  name         String
  phone        String      // formato: 5511999999999
  email        String?
  origin       LeadOrigin?
  vehicleId    String?
  partnerId    String?
  status       LeadStatus  @default(NEW)
  score        Int         @default(0)  // 0–100 (IA)
  summary      String?     @db.Text
  interactions Interaction[]
  simulations  Simulation[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  @@index([status, phone, createdAt])
}

enum LeadStatus  { NEW | AI_QUALIFYING | QUALIFIED | HANDOFF_HUMAN | LOST | CONVERTED }
enum LeadOrigin  { FACEBOOK_ADS | GOOGLE_ADS | ORGANIC | WHATSAPP | REFERRAL | PARTNER | PLATFORM_WEB }
```

### 4. Interactions (Histórico)
```prisma
model Interaction {
  id        String               @id @default(cuid())
  leadId    String
  lead      Lead                 @relation(onDelete: Cascade)
  channel   InteractionChannel
  direction InteractionDirection
  content   String               @db.Text
  createdAt DateTime             @default(now())
  @@index([leadId, createdAt])
}

enum InteractionChannel   { WHATSAPP | EMAIL | PHONE | INTERNAL }
enum InteractionDirection { INBOUND | OUTBOUND }
```

### 5. Simulações F&I
```prisma
model Simulation {
  id             String           @id @default(cuid())
  leadId         String
  lead           Lead             @relation(onDelete: Cascade)
  vehiclePrice   Decimal          @db.Decimal(12, 2)
  downPayment    Decimal          @db.Decimal(12, 2)
  financedAmount Decimal          @db.Decimal(12, 2)
  installments   Int
  monthlyRate    Float
  monthlyPayment Decimal          @db.Decimal(12, 2)
  totalAmount    Decimal          @db.Decimal(12, 2)
  totalInterest  Decimal          @db.Decimal(12, 2)
  bankName       String?
  status         SimulationStatus @default(PENDING)
  createdAt      DateTime         @default(now())
  @@index([leadId])
}

enum SimulationStatus { PENDING | APPROVED | REJECTED }
```

---

## 📍 Notas de Arquitetura
1. **Vehicle.price**: Decimal no DB, convertido para `Number` na camada de aplicação (modules/inventory/types.ts).
2. **externalId**: Chave de deduplicação para o scraping engine (Task 2.1).
3. **LeadOrigin enum**: Tipado no DB — sem strings arbitrárias em produção.
4. **RLS**: `prisma-rls.ts` usa `set_config()` parametrizado (sem SQL injection). Ativar após setup das políticas Supabase.
5. **Escalabilidade**: Para "Imóveis", criar model `Property` seguindo o padrão Partner→Vehicle.

## 🔒 Notas de Segurança (ADR-2026-04-30)
- `prismaRLS`: migrado de `$executeRawUnsafe` → `$executeRaw` (parameterizado)
- API routes `/api/leads` e `/api/simulations`: precisam de auth guard (Task próxima)
- Headers de segurança: X-Frame-DENY, X-Content-Type-Options, Referrer-Policy → `next.config.mjs`
