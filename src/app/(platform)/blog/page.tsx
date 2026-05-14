import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma, withRetry } from '@/lib/prisma';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Blog Motorz — Guias de Compra Automotiva no ABCD Paulista',
  description: 'Guias completos para comprar seu próximo carro no ABCD Paulista. Melhores marcas, modelos e regiões com estoque real e curado pela Motorz.',
  alternates: { canonical: 'https://motorz.com.br/blog' },
  openGraph: {
    title: 'Blog Motorz — Guias de Compra Automotiva',
    description: 'Encontre o carro ideal com guias curados pela equipe Motorz.',
    url: 'https://motorz.com.br/blog',
    images: [{ url: '/assets/brand/banners/OG.png', width: 1200, height: 630, alt: 'Blog Motorz — Guias de Compra Automotiva' }],
  },
};

const CITIES = ['santo-andre', 'sao-bernardo', 'sao-caetano', 'diadema'];
const CITY_LABELS: Record<string, string> = {
  'santo-andre': 'Santo André', 'sao-bernardo': 'São Bernardo do Campo',
  'sao-caetano': 'São Caetano do Sul', 'diadema': 'Diadema',
};

export default async function BlogPage() {
  const [brandsRaw, totalVehicles] = await withRetry(() =>
    Promise.all([
      prisma.vehicle.findMany({ where: { status: 'AVAILABLE' }, select: { brand: true }, distinct: ['brand'], orderBy: { brand: 'asc' } }),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    ])
  );
  const brands = brandsRaw.map(b => b.brand);

  const brandArticles = brands.map(brand => ({
    slug: `melhores-${brand.toLowerCase().replace(/\s+/g, '-')}-abcd`,
    title: `Melhores ${brand} para comprar no ABCD Paulista`,
    desc: `Veja todos os modelos ${brand} disponíveis no estoque curado da Motorz no ABCD.`,
    tag: brand,
  }));

  const cityArticles = CITIES.map(c => ({
    slug: `comprar-carro-${c}`,
    title: `Comprar carro em ${CITY_LABELS[c]} — Estoque Motorz`,
    desc: `Encontre veículos disponíveis em ${CITY_LABELS[c]} com inspeção e garantia Motorz.`,
    tag: CITY_LABELS[c],
  }));

  const categoryArticles = [
    { slug: 'suv-automatico-abcd', title: 'SUVs Automáticos no ABCD — Os Melhores do Estoque', desc: 'Guia completo de SUVs automáticos disponíveis no ABCD Paulista.', tag: 'SUV' },
    { slug: 'carros-abaixo-100k-abcd', title: 'Carros até R$ 100k no ABCD — Melhores Opções', desc: 'As melhores opções de veículos abaixo de R$ 100.000 no ABCD.', tag: 'Até R$ 100k' },
    { slug: 'carros-automaticos-abcd', title: 'Carros Automáticos no ABCD — Estoque Completo', desc: 'Todos os carros com câmbio automático disponíveis no estoque Motorz.', tag: 'Automático' },
    { slug: 'primeiro-carro-abcd', title: 'Primeiro Carro: Guia de Compra no ABCD Paulista', desc: 'Dicas e opções para quem vai comprar o primeiro carro no ABCD.', tag: 'Guia' },
  ];

  const allArticles = [...categoryArticles, ...cityArticles, ...brandArticles];

  return (
    <div style={{ background: 'var(--mz-snow)', minHeight: '100vh', paddingTop: '96px', paddingBottom: '80px' }}>
      <style>{`
        .blog-guide-card { text-decoration: none; display: block; background: white; border-radius: 20px; padding: 24px; border: 1px solid var(--border); transition: transform 0.15s, box-shadow 0.15s; }
        .blog-guide-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.10); }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>

        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-royal)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '12px' }}>Guias Motorz</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--mz-ink)', lineHeight: 1.1, margin: '0 0 20px' }}>
            Tudo sobre comprar<br />carro no ABCD
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-dim)', maxWidth: '560px', lineHeight: 1.6 }}>
            {totalVehicles} veículos curados. Guias reais com estoque atualizado para você decidir com confiança.
          </p>
        </div>

        {/* Featured articles (categories) */}
        <div style={{ marginBottom: '56px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-slate-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Guias de compra</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '16px' }}>
            {categoryArticles.map(a => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="blog-guide-card">
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--mz-royal)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{a.tag}</span>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--mz-ink)', margin: '8px 0 10px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{a.title}</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* City articles */}
        <div style={{ marginBottom: '56px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-slate-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Por cidade</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '12px' }}>
            {cityArticles.map(a => (
              <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'white', borderRadius: '14px', padding: '16px 20px', border: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--mz-ink)', margin: '0 0 2px' }}>{a.tag}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>Ver estoque disponível →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Brand articles */}
        {brandArticles.length > 0 && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-slate-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Por marca</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {brandArticles.map(a => (
                <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', background: 'white', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--mz-ink)' }}>
                  {a.tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
