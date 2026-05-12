import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  let brand   = 'Motorz';
  let model   = 'Marketplace Automotivo';
  let year    = '';
  let price   = '';
  let city    = 'ABCD Paulista';
  let imgUrl: string | null = null;

  if (id) {
    try {
      const v = await withRetry(() =>
        prisma.vehicle.findUnique({
          where:  { id },
          select: { brand: true, model: true, version: true, year: true, price: true, images: true, partner: { select: { city: true } } },
        })
      );
      if (v) {
        brand  = v.brand;
        model  = v.version ? `${v.model} ${v.version}` : v.model;
        year   = String(v.year);
        price  = formatPrice(Number(v.price));
        city   = v.partner?.city ?? 'ABCD Paulista';
        imgUrl = v.images?.[0] ?? null;
      }
    } catch { /* fallback to defaults */ }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          display: 'flex', position: 'relative',
          background: '#0A1931', overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Car image — right side full bleed */}
        {imgUrl && (
          <>
            <img
              src={imgUrl}
              style={{
                position: 'absolute', right: 0, top: 0,
                width: '580px', height: '630px',
                objectFit: 'cover', objectPosition: 'center',
              }}
            />
            {/* Gradient overlay para fundir com o fundo */}
            <div style={{
              position: 'absolute', right: 0, top: 0,
              width: '680px', height: '630px',
              background: 'linear-gradient(to right, #0A1931 0%, #0A1931 20%, transparent 70%)',
            }} />
          </>
        )}

        {/* Content — left side */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 56px',
          width: imgUrl ? '680px' : '1200px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#FFC107', boxShadow: '0 0 16px rgba(255,193,7,0.6)',
            }} />
            <span style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
              motorz
            </span>
          </div>

          {/* Main text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {year && (
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {brand.toUpperCase()} · {year} · {city}
              </span>
            )}
            <span style={{
              fontSize: year ? '54px' : '64px',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}>
              {model}
            </span>
            {price && (
              <span style={{ fontSize: '38px', fontWeight: 900, color: '#FFC107', letterSpacing: '-0.02em', marginTop: '8px' }}>
                {price}
              </span>
            )}
          </div>

          {/* Bottom trust bar */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {['Inspeção 30 pts', 'Garantia inclusa', 'Preço final'].map(tag => (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ADE80' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
