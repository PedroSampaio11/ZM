export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';

export interface Vehicle {
  id: string;
  partnerId: string;
  brand: string;
  model: string;
  version?: string;
  year: number;
  mileage: number;
  price: number;
  fuel?: string;
  transmission?: string;
  color?: string;
  description?: string;
  images: string[];
  videoUrl?: string;
  status: VehicleStatus;
  externalId?: string;
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Partner {
  id: string;
  name: string;
  document: string;
  city: string;
  state: string;
  commission: number;
  isActive: boolean;
  scrapingUrl?: string;
}
