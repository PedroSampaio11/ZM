import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleDetailsClient } from './vehicle-details-client';

export const revalidate = 60; // ISR

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    select: { brand: true, model: true, version: true }
  });

  if (!vehicle) return { title: 'Veículo não encontrado | Motorz' };

  return {
    title: `${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} | Motorz`,
    description: `Confira os detalhes deste ${vehicle.brand} ${vehicle.model} na Motorz. Transparência total e tecnologia de ponta.`,
  };
}

export default async function VehiclePage({ params }: Props) {
  const rawVehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: {
      partner: {
        select: {
          name: true,
          city: true,
          state: true,
        }
      }
    }
  });

  if (!rawVehicle) {
    notFound();
  }

  // Convert Decimal to number for the client
  const vehicle: Vehicle & { partner: { name: string; city: string; state: string } } = {
    ...rawVehicle,
    price: Number(rawVehicle.price),
  };

  // Determine if it's "especial" (for demonstration, we fetch the 3 newest vehicles and see if it's one of them)
  const newestVehicles = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true }
  });

  const isFeatured = newestVehicles.some(v => v.id === vehicle.id);

  return (
    <VehicleDetailsClient vehicle={vehicle} isFeatured={isFeatured} />
  );
}
