import { prisma } from '@/lib/prisma';
import { Vehicle } from '@/modules/inventory/types';
import { PlatformClient } from './platform-client';

export const revalidate = 60; // ISR — revalida a cada 60s

export default async function PlatformHome() {
  // Fetch vehicles server-side
  const rawVehicles = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  const vehicles: Vehicle[] = rawVehicles.map(v => ({
    ...v,
    price: Number(v.price),
  }));

  // Stats para trust section
  const totalVehicles = await prisma.vehicle.count({ where: { status: 'AVAILABLE' } });
  const totalPartners = await prisma.partner.count({ where: { isActive: true } });

  return (
    <PlatformClient
      vehicles={vehicles}
      totalVehicles={totalVehicles}
      totalPartners={totalPartners}
    />
  );
}
