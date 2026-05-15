import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma, withRetry } from '@/lib/prisma';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';

export const revalidate = 3600;

interface Props {
  params: Promise<{ brand: string; model: string }>;
}

function slugToName(slug: string): string {
  return slug.replace(/-/g, ' ');
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);
}

export async function generateStaticParams() {
  const combos = await withRetry(() =>
    prisma.vehicle.findMany({
      where:    { status: 'AVAILABLE' },
      select:   { brand: true, model: true },
      distinct: ['brand', 'model'],
    })
  );
  return combos.map(({ brand, model }) => ({
    brand: brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    model: model.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, model } = await params;
  const brandName = slugToName(brand);
  const modelName = slugToName(model);
  const title = `${brandName.toUpperCase()} ${modelName.toUpperCase()} no ABCD Paulista | Motorz`;
  const description = `Confira as unidades disponíveis do ${brandName} ${modelName} no ABCD Paulista. Preços, fotos e contato direto com a curadoria Motorz.`;
  return {
    title,
    description,
    alternates: { canonical: `https://motorz.com.br/comprar/${brand}/${model}` },
    openGraph: { title, description, url: `https://motorz.com.br/comprar/${brand}/${model}` },
  };
}

export default async function ComprarModeloPage({ params }: Props) {
  const { brand, model } = await params;
  const brandName = slugToName(brand);
  const modelName = slugToName(model);

  const rawVehicles = await withRetry(() =>
    prisma.vehicle.findMany({
      where: {
        status: 'AVAILABLE',
        brand:  { equals: brandName, mode: 'insensitive' },
        model:  { equals: modelName, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      include: { partner: { select: { city: true, state: true } } },
    })
  );

  if (rawVehicles.length === 0) notFound();

  const vehicles = rawVehicles.map(({ partner, ...v }) => ({
    ...v,
    price:       Number(v.price),
    partnerCity: partner?.city ?? null,
    partnerState: partner?.state ?? null,
  }));

  const minPrice = Math.min(...vehicles.map(v => v.price));
  const maxPrice = Math.max(...vehicles.map(v => v.price));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brandName} ${modelName} no ABCD Paulista`,
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://motorz.com.br/veiculo/${v.id}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="platform-container" style={{ minHeight: '100svh', background: 'var(--mz-snow)' }}>

        {/* ── HERO ── */}
        <section style={{ paddingTop: '120px', paddingBottom: '56px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontSize: '13px', fontWeight: 600 }}>
              <Link href="/" style={{ color: 'var(--mz-slate)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <HugeiconsIcon icon={ArrowLeft02Icon} size={14} /> Início
              </Link>
              <span style={{ color: 'var(--border)' }}>·</span>
              <Link href="/estoque" style={{ color: 'var(--mz-slate)', textDecoration: 'none' }}>Estoque</Link>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span style={{ color: 'var(--mz-royal)', textTransform: 'capitalize' }}>{brandName} {modelName}</span>
            </nav>

            <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
              {vehicles.length} unidade{vehicles.length !== 1 ? 's' : ''} disponível{vehicles.length !== 1 ? 'is' : ''}
            </p>
            <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--mz-ink)', margin: '0 0 16px', textTransform: 'capitalize' }}>
              {brandName} {modelName}
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-dim)', fontWeight: 500 }}>
              no ABCD Paulista · curadoria Motorz
              {minPrice !== maxPrice
                ? ` · de ${formatCurrency(minPrice)} a ${formatCurrency(maxPrice)}`
                : ` · ${formatCurrency(minPrice)}`}
            </p>
          </div>
        </section>

        {/* ── GRID ── */}
        <section style={{ padding: '60px 0 120px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '24px' }}>
              {vehicles.map(v => (
                <Link key={v.id} href={`/veiculo/${v.id}`} style={{ textDecoration: 'none', display: 'block', background: 'white', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '16/10', position: 'relative', background: 'var(--mz-ash)' }}>
                    {v.images?.[0] && (
                      <Image src={v.images[0]} alt={`${v.brand} ${v.model} ${v.year}`} fill sizes="(max-width: 640px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                    )}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, color: 'white' }}>
                      {v.year}
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>{v.brand}</p>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--mz-ink)', letterSpacing: '-0.03em', marginBottom: '4px' }}>{v.model}</p>
                    {v.version && <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>{v.version}</p>}
                    <p style={{ fontSize: '10px', color: 'var(--mz-slate-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Preço Motorz</p>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--mz-royal)', letterSpacing: '-0.02em' }}>{formatCurrency(v.price)}</p>
                    {v.partnerCity && (
                      <p style={{ fontSize: '12px', color: 'var(--mz-slate-dim)', marginTop: '8px' }}>📍 {v.partnerCity}, {v.partnerState}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: '64px', textAlign: 'center' }}>
              <Link href="/estoque" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', border: '1px solid var(--border)', borderRadius: '14px', fontWeight: 700, fontSize: '14px', color: 'var(--mz-royal)', textDecoration: 'none' }}>
                Ver todo o estoque Motorz →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
