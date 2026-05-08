import { prisma, withRetry } from '@/lib/prisma';
import { Vehicle } from '@/modules/inventory/types';
import { EstoqueClient } from './estoque-client';

export const revalidate = 60;

export default async function EstoquePage() {
  const [rawVehicles, totalVehicles, totalPartners, brandsRaw] = await withRetry(() =>
    Promise.all([
      prisma.vehicle.findMany({
        where:   { status: 'AVAILABLE' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.partner.count({ where: { isActive: true } }),
      prisma.vehicle.findMany({
        where:    { status: 'AVAILABLE' },
        select:   { brand: true },
        distinct: ['brand'],
        orderBy:  { brand: 'asc' },
      }),
    ])
  );

  const vehicles: Vehicle[] = rawVehicles.map(v => ({ ...v, price: Number(v.price) }));
  const brands = brandsRaw.map(v => v.brand).filter(Boolean) as string[];

  return (
    <EstoqueClient
      vehicles={vehicles}
      totalVehicles={totalVehicles}
      totalPartners={totalPartners}
      brands={brands}
    />
  );
}
