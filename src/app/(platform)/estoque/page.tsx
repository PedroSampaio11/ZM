import type { Metadata } from 'next';
import { prisma, withRetry } from '@/lib/prisma';
import { EstoqueClient, EstoqueVehicle } from './estoque-client';

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
    images: [{ url: '/assets/brand/banners/OG.png', width: 1200, height: 630, alt: 'Motorz — Estoque ABCD Paulista' }],
  },
};

export default async function EstoquePage() {
  const [rawVehicles, totalVehicles, brandsRaw] = await withRetry(() =>
    Promise.all([
      prisma.vehicle.findMany({
        where:   { status: 'AVAILABLE' },
        orderBy: { createdAt: 'desc' },
        include: { partner: { select: { city: true } } },
      }),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.findMany({
        where:    { status: 'AVAILABLE' },
        select:   { brand: true },
        distinct: ['brand'],
        orderBy:  { brand: 'asc' },
      }),
    ])
  );

  const vehicles: EstoqueVehicle[] = rawVehicles.map(({ partner, ...rest }) => ({
    ...rest,
    price:       Number(rest.price),
    partnerCity: partner?.city ?? null,
  }));

  const brands = brandsRaw.map(v => v.brand).filter(Boolean) as string[];
  const cities = [...new Set(
    rawVehicles.map(v => v.partner?.city).filter(Boolean) as string[]
  )].sort();

  return (
    <EstoqueClient
      vehicles={vehicles}
      totalVehicles={totalVehicles}
      brands={brands}
      cities={cities}
    />
  );
}
