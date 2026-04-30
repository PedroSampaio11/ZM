import type { Vehicle as PrismaVehicle, Partner as PrismaPartner } from '@prisma/client';

export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';

// Tipo derivado do Prisma com price convertido para number (Decimal → number)
export type Vehicle = Omit<PrismaVehicle, 'price'> & { price: number };

export interface Partner {
  id: string;
  name: string;
  document: string;
  city: string;
  state: string;
  commission: number;
  isActive: boolean;
  scrapingUrl: string | null;
}
