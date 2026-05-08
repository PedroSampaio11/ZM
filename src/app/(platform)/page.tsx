import { prisma, withRetry } from '@/lib/prisma';
import { Vehicle } from '@/modules/inventory/types';
import { PlatformClient } from './platform-client';

export const revalidate = 60;

export default async function PlatformHome() {
  const [rawVehicles, totalVehicles, totalPartners, brandsRaw, partnersRaw] = await withRetry(() =>
    Promise.all([
      prisma.vehicle.findMany({
        where:   { status: 'AVAILABLE' },
        orderBy: { createdAt: 'desc' },
        take:    60,
      }),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.partner.count({ where: { isActive: true } }),
      prisma.vehicle.findMany({
        where:    { status: 'AVAILABLE' },
        select:   { brand: true },
        distinct: ['brand'],
        orderBy:  { brand: 'asc' },
      }),
      prisma.partner.findMany({
        where:   { isActive: true },
        select:  { name: true },
        orderBy: { name: 'asc' },
        take:    20,
      }),
    ])
  );

  const vehicles: Vehicle[] = rawVehicles.map(v => ({ ...v, price: Number(v.price) }));

  const brands = brandsRaw.map(v => v.brand).filter(Boolean) as string[];

  const partners = partnersRaw.map(p => {
    const parts = p.name.trim().split(' ');
    const initial = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
    return { name: p.name, initial };
  });

  return (
    <PlatformClient
      vehicles={vehicles}
      totalVehicles={totalVehicles}
      totalPartners={totalPartners}
      brands={brands}
      partners={partners}
    />
  );
}
