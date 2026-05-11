import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma, withRetry } from '@/lib/prisma';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleDetailsClient } from './vehicle-details-client';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const vehicles = await withRetry(() =>
    prisma.vehicle.findMany({
      where:  { status: 'AVAILABLE' },
      select: { id: true },
      take:   200,
    })
  );
  return vehicles.map(v => ({ id: v.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

const getVehicle = cache((id: string) =>
  withRetry(() =>
    prisma.vehicle.findUnique({
      where: { id },
      include: { partner: { select: { name: true, city: true, state: true, locationNote: true } } },
    })
  )
);

const getNewestIds = cache(() =>
  withRetry(async () => {
    const rows = await prisma.vehicle.findMany({
      where:   { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      take:    3,
      select:  { id: true },
    });
    return new Set(rows.map(r => r.id));
  })
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) return { title: 'Veículo não encontrado | Motorz' };

  const city = vehicle.partner?.city ?? 'ABCD Paulista';
  const state = vehicle.partner?.state ?? 'SP';
  const title = `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ''} ${vehicle.year} | Motorz`;
  const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(Number(vehicle.price));
  const description = `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ''} ${vehicle.year} — ${price}. Disponível em ${city}, ${state}. Confira todos os detalhes, fotos e solicite contato direto com a loja na Motorz.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://motorz.com.br/veiculo/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://motorz.com.br/veiculo/${id}`,
      images: vehicle.images?.[0] ? [{ url: vehicle.images[0], width: 1200, height: 630, alt: `${vehicle.brand} ${vehicle.model} ${vehicle.year}` }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: vehicle.images?.[0] ? [vehicle.images[0]] : [],
    },
  };
}

export default async function VehiclePage({ params }: Props) {
  const { id } = await params;
  const [rawVehicle, newestIds] = await Promise.all([
    getVehicle(id),
    getNewestIds(),
  ]);

  if (!rawVehicle) notFound();

  const vehicle: Vehicle & { partner: { name: string; city: string; state: string; locationNote: string | null } } = {
    ...rawVehicle,
    price: Number(rawVehicle.price),
  };

  const price = Number(vehicle.price);

  const vehicleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ''}`,
    description: `${vehicle.brand} ${vehicle.model} ${vehicle.year}${vehicle.version ? `, ${vehicle.version}` : ''}${vehicle.mileage ? `, ${vehicle.mileage.toLocaleString('pt-BR')} km` : ''}`,
    brand: { '@type': 'Brand', name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    ...(vehicle.mileage != null && {
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        value: vehicle.mileage,
        unitCode: 'KMT',
      },
    }),
    ...(vehicle.color && { color: vehicle.color }),
    ...(vehicle.fuel && { fuelType: vehicle.fuel }),
    ...(vehicle.transmission && { vehicleTransmission: vehicle.transmission }),
    ...(vehicle.images?.[0] && { image: vehicle.images[0] }),
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: `https://motorz.com.br/veiculo/${id}`,
      seller: {
        '@type': 'AutoDealer',
        name: vehicle.partner?.name ?? 'Motorz',
        address: {
          '@type': 'PostalAddress',
          addressLocality: vehicle.partner?.city ?? 'Santo André',
          addressRegion: vehicle.partner?.state ?? 'SP',
          addressCountry: 'BR',
        },
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }}
      />
      <VehicleDetailsClient vehicle={vehicle} isFeatured={newestIds.has(vehicle.id)} />
    </>
  );
}
