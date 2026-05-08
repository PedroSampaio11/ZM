import type { Metadata } from 'next';
import { prisma, withRetry } from '@/lib/prisma';
import { Vehicle } from '@/modules/inventory/types';
import { PlatformClient } from './platform-client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Motorz — Marketplace Automotivo do ABCD Paulista',
  description: 'Compre seu próximo carro com segurança no ABCD Paulista. Estoque curado de veículos em Santo André, São Bernardo do Campo, São Caetano do Sul e Diadema. Transparência total e tecnologia de ponta.',
  alternates: {
    canonical: 'https://motorz.com.br',
  },
  openGraph: {
    title: 'Motorz — O Marketplace Automotivo do ABCD Paulista',
    description: 'Centenas de veículos curados em Santo André, São Bernardo, São Caetano e Diadema. Compre com segurança e tecnologia.',
    url: 'https://motorz.com.br',
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: 'Motorz',
  description: 'Marketplace automotivo premium do ABCD Paulista com curadoria de veículos, tecnologia e transparência.',
  url: 'https://motorz.com.br',
  logo: 'https://motorz.com.br/assets/brand/logos/logo1.png',
  image: 'https://motorz.com.br/assets/brand/og-image.png',
  priceRange: 'R$ 30.000 – R$ 500.000',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Santo André',
    addressRegion: 'SP',
    addressCountry: 'BR',
    postalCode: '09000-000',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -23.6644,
    longitude: -46.5383,
  },
  areaServed: [
    { '@type': 'City', name: 'Santo André', containedInPlace: { '@type': 'AdministrativeArea', name: 'ABCD Paulista' } },
    { '@type': 'City', name: 'São Bernardo do Campo' },
    { '@type': 'City', name: 'São Caetano do Sul' },
    { '@type': 'City', name: 'Diadema' },
    { '@type': 'City', name: 'Mauá' },
    { '@type': 'City', name: 'Ribeirão Pires' },
    { '@type': 'City', name: 'Rio Grande da Serra' },
  ],
  openingHours: 'Mo-Fr 09:00-18:00 Sa 09:00-13:00',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    telephone: '+55-11-99999-9999',
    availableLanguage: 'Portuguese',
  },
  sameAs: [
    'https://instagram.com/motorz',
    'https://linkedin.com/company/motorz',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Motorz',
  url: 'https://motorz.com.br',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://motorz.com.br/estoque?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <PlatformClient
        vehicles={vehicles}
        totalVehicles={totalVehicles}
        totalPartners={totalPartners}
        brands={brands}
        partners={partners}
      />
    </>
  );
}
