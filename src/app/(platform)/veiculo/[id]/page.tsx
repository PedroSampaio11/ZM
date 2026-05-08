import { cache } from 'react';
import { notFound } from 'next/navigation';
import { prisma, withRetry } from '@/lib/prisma';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleDetailsClient } from './vehicle-details-client';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

// React.cache deduplica: generateMetadata e VehiclePage chamam a mesma fn
// mas o Prisma só executa uma query por request
const getVehicle = cache((id: string) =>
  withRetry(() =>
    prisma.vehicle.findUnique({
      where: { id },
      include: { partner: { select: { name: true, city: true, state: true } } },
    })
  )
);

const getNewestIds = cache(() =>
  withRetry(async () => {
    const rows = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true },
    });
    return new Set(rows.map(r => r.id));
  })
);

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) return { title: 'Veículo não encontrado | Motorz' };
  return {
    title: `${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} | Motorz`,
    description: `Confira os detalhes deste ${vehicle.brand} ${vehicle.model} na Motorz. Transparência total e tecnologia de ponta.`,
  };
}

export default async function VehiclePage({ params }: Props) {
  const { id } = await params;
  const [rawVehicle, newestIds] = await Promise.all([
    getVehicle(id),
    getNewestIds(),
  ]);

  if (!rawVehicle) notFound();

  const vehicle: Vehicle & { partner: { name: string; city: string; state: string } } = {
    ...rawVehicle,
    price: Number(rawVehicle.price),
  };

  return (
    <VehicleDetailsClient vehicle={vehicle} isFeatured={newestIds.has(vehicle.id)} />
  );
}
