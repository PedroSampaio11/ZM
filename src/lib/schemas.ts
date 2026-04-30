import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// LEADS
// ─────────────────────────────────────────────────────────────────────────────

export const CreateLeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z
    .string()
    .regex(/^55\d{10,11}$/, 'Telefone deve estar no formato 5511999999999'),
  email: z.string().email('E-mail inválido').optional(),
  origin: z
    .enum(['FACEBOOK_ADS', 'GOOGLE_ADS', 'ORGANIC', 'WHATSAPP', 'REFERRAL', 'PARTNER', 'PLATFORM_WEB'])
    .optional(),
  vehicleId: z.string().cuid().optional(),
  message: z.string().max(1000).optional(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const SimulationSchema = z.object({
  leadId: z.string().cuid(),
  vehiclePrice: z.number().positive('Valor do veículo deve ser positivo'),
  downPayment: z.number().min(0, 'Entrada não pode ser negativa'),
  installments: z.enum(['12', '24', '36', '48', '60']).transform(Number),
  monthlyRate: z.number().min(0.1).max(10).optional(), // % ao mês
  bankName: z.string().optional(),
});

export type SimulationInput = z.infer<typeof SimulationSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// VEHICLES (Admin)
// ─────────────────────────────────────────────────────────────────────────────

export const CreateVehicleSchema = z.object({
  partnerId: z.string().cuid(),
  brand: z.string().min(1),
  model: z.string().min(1),
  version: z.string().optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0),
  price: z.number().positive(),
  fuel: z.string().optional(),
  transmission: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  videoUrl: z.string().url().optional(),
  externalId: z.string().optional(),
});

export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// PARTNERS (Admin)
// ─────────────────────────────────────────────────────────────────────────────

export const CreatePartnerSchema = z.object({
  name: z.string().min(2),
  document: z
    .string()
    .regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos (sem pontuação)'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(2),
  state: z.string().length(2, 'Use a sigla do estado (ex: SP)'),
  commission: z.number().min(0).max(100).default(0),
  scrapingUrl: z.string().url().optional(),
});

export type CreatePartnerInput = z.infer<typeof CreatePartnerSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// EXTERNAL VEHICLE (validação do adapter antes do upsert no banco)
// ─────────────────────────────────────────────────────────────────────────────

export const ExternalVehicleSchema = z.object({
  externalId: z.string().min(1, 'externalId obrigatório'),
  brand: z.string().min(1).default('N/A'),
  model: z.string().min(1).default('N/A'),
  version: z.string().nullable().optional(),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 2),
  mileage: z.number().int().min(0),
  price: z.number().positive('Preço deve ser positivo'),
  fuel: z.string().nullable().optional(),
  transmission: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  videoUrl: z.string().nullable().optional(),
});

export type ExternalVehicleInput = z.infer<typeof ExternalVehicleSchema>;
