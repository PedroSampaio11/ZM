import type {
  Vehicle as PrismaVehicle,
  Partner as PrismaPartner,
  Store as PrismaStore,
  IntegrationConfig as PrismaIntegrationConfig,
  AdapterType,
  StorePlan,
} from '@prisma/client';

// Vehicle com price convertido de Decimal para number
// partnerCity é populado opcionalmente quando a query inclui { partner: { select: { city: true } } }
export type Vehicle = Omit<PrismaVehicle, 'price'> & {
  price:       number;
  partnerCity?: string | null;
};

export type Partner = Pick<
  PrismaPartner,
  'id' | 'storeId' | 'name' | 'document' | 'city' | 'state' | 'commission' | 'isActive'
>;

export type Store = Pick<
  PrismaStore,
  'id' | 'name' | 'slug' | 'document' | 'plan' | 'isActive' | 'createdAt'
>;

export type IntegrationConfig = Omit<PrismaIntegrationConfig, 'credentials'> & {
  credentials: Record<string, string>; // JSON tipado
  config:      Record<string, unknown>;
};

export type { AdapterType, StorePlan };
