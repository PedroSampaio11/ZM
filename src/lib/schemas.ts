import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// STORES (Tenants)
// ─────────────────────────────────────────────────────────────────────────────

export const CreateStoreSchema = z.object({
  name:     z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug:     z.string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9-]+$/, 'Slug: apenas letras minúsculas, números e hífens'),
  document: z.string().regex(/^\d{14}$/, 'CNPJ: 14 dígitos sem pontuação').optional(),
  plan:     z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).default('STARTER'),
});

export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;

export const UpdateStoreSchema = CreateStoreSchema.partial().omit({ slug: true });
export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

export const AdapterTypeEnum = z.enum([
  'AUTOCERTO', 'COCKPIT', 'REVENDA_MAIS', 'MOTOR21',
  'WEBMOTORS', 'OLX_AUTOS', 'MOBIAUTO', 'ICARROS', 'REPASSE', 'MANUAL',
]);

export const CreateIntegrationSchema = z.object({
  partnerId:   z.string().cuid('partnerId deve ser um CUID válido'),
  adapter:     AdapterTypeEnum,
  credentials: z.record(z.string()).default({}),
  config:      z.record(z.unknown()).default({}),
});

export type CreateIntegrationInput = z.infer<typeof CreateIntegrationSchema>;

export const UpdateIntegrationSchema = z.object({
  isActive:    z.boolean().optional(),
  credentials: z.record(z.string()).optional(),
  config:      z.record(z.unknown()).optional(),
});

export type UpdateIntegrationInput = z.infer<typeof UpdateIntegrationSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// LEADS
// ─────────────────────────────────────────────────────────────────────────────

export const CreateLeadSchema = z.object({
  name:      z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone:     z.string().regex(/^55\d{10,11}$/, 'Telefone deve estar no formato 5511999999999'),
  email:     z.string().email('E-mail inválido').optional(),
  origin:    z.enum(['FACEBOOK_ADS', 'GOOGLE_ADS', 'ORGANIC', 'WHATSAPP', 'REFERRAL', 'PARTNER', 'PLATFORM_WEB']).optional(),
  vehicleId: z.string().cuid().optional(),
  storeId:   z.string().cuid().optional(), // pode vir do contexto da vitrine
  message:   z.string().max(1000).optional(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const SimulationSchema = z.object({
  leadId:       z.string().cuid(),
  vehiclePrice: z.number().positive('Valor do veículo deve ser positivo'),
  downPayment:  z.number().min(0, 'Entrada não pode ser negativa'),
  installments: z.enum(['12', '24', '36', '48', '60']).transform(Number),
  monthlyRate:  z.number().min(0.1).max(10).optional(),
  bankName:     z.string().optional(),
});

export type SimulationInput = z.infer<typeof SimulationSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// VEHICLES (Admin)
// ─────────────────────────────────────────────────────────────────────────────

export const CreateVehicleSchema = z.object({
  storeId:      z.string().cuid(),
  partnerId:    z.string().cuid(),
  brand:        z.string().min(1),
  model:        z.string().min(1),
  version:      z.string().optional(),
  year:         z.number().int().min(1990).max(new Date().getFullYear() + 1),
  mileage:      z.number().int().min(0),
  price:        z.number().positive(),
  fuel:         z.string().optional(),
  transmission: z.string().optional(),
  color:        z.string().optional(),
  description:  z.string().optional(),
  images:       z.array(z.string().url()).default([]),
  videoUrl:     z.string().url().optional(),
  externalId:   z.string().optional(),
});

export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// PARTNERS (Admin)
// ─────────────────────────────────────────────────────────────────────────────

export const CreatePartnerSchema = z.object({
  storeId:    z.string().cuid(),
  name:       z.string().min(2),
  document:   z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos (sem pontuação)'),
  email:      z.string().email().optional(),
  phone:      z.string().optional(),
  address:    z.string().optional(),
  city:       z.string().min(2),
  state:      z.string().length(2, 'Use a sigla do estado (ex: SP)'),
  commission: z.number().min(0).max(100).default(0),
});

export type CreatePartnerInput = z.infer<typeof CreatePartnerSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// EXTERNAL VEHICLE (validação do adapter antes do upsert no banco)
// ─────────────────────────────────────────────────────────────────────────────

export const ExternalVehicleSchema = z.object({
  externalId:   z.string().min(1, 'externalId obrigatório'),
  brand:        z.string().min(1).default('N/A'),
  model:        z.string().min(1).default('N/A'),
  version:      z.string().nullable().optional(),
  year:         z.number().int().min(1980).max(new Date().getFullYear() + 2),
  mileage:      z.number().int().min(0),
  price:        z.number().positive('Preço deve ser positivo'),
  fuel:         z.string().nullable().optional(),
  transmission: z.string().nullable().optional(),
  color:        z.string().nullable().optional(),
  description:  z.string().nullable().optional(),
  images:       z.array(z.string()).default([]),
  videoUrl:     z.string().nullable().optional(),
});

export type ExternalVehicleInput = z.infer<typeof ExternalVehicleSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SYNC (Admin)
// ─────────────────────────────────────────────────────────────────────────────

export const SyncStoreSchema = z.object({
  storeId: z.string().cuid('storeId deve ser um CUID válido'),
  dryRun:  z.boolean().default(true),
});

export const SyncPartnerSchema = z.object({
  partnerId:           z.string().cuid('partnerId deve ser um CUID válido'),
  integrationConfigId: z.string().cuid('integrationConfigId deve ser um CUID válido'),
  dryRun:              z.boolean().default(true),
});
