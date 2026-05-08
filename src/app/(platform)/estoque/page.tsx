import type { Metadata } from 'next';
import { prisma, withRetry } from '@/lib/prisma';
import { Vehicle } from '@/modules/inventory/types';
import { EstoqueClient } from './estoque-client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Estoque Completo — Veículos no ABCD Paulista | Motorz',
  description: 'Explore centenas de veículos curados no ABCD Paulista. Filtre por marca, preço e especificações. Carros em Santo André, São Bernardo, São Caetano e Diadema com transparência total.',
  alternates: {
    canonical: 'https://motorz.com.br/estoque',
  },
  openGraph: {
    title: 'Estoque Completo — Veículos no ABCD Paulista | Motorz',
    description: 'Centenas de veículos curados no ABCD Paulista. Filtre por marca, preço e muito mais.',
    url: 'https://motorz.com.br/estoque',
  },
};

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
