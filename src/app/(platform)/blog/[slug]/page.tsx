import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma, withRetry } from '@/lib/prisma';
import { computeMotorzScore, getScoreDisplay } from '@/lib/motorz-score';

export const revalidate = 3600;
export const dynamicParams = true;

// ── Slug → query resolver ────────────────────────────────────────────────────

const CITY_MAP: Record<string, string> = {
  'santo-andre': 'Santo André', 'sao-bernardo': 'São Bernardo do Campo',
  'sao-caetano': 'São Caetano do Sul', 'diadema': 'Diadema',
};

type ArticleData = {
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  vehicles: { id: string; brand: string; model: string; version: string | null; year: number; price: number; mileage: number; transmission: string | null; images: string[] }[];
  faq: { q: string; a: string }[];
};

async function resolveArticle(slug: string): Promise<ArticleData | null> {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);

  // ── Cidade ──────────────────────────────────────────────────
  const cityEntry = Object.entries(CITY_MAP).find(([k]) => slug === `comprar-carro-${k}`);
  if (cityEntry) {
    const [, cityName] = cityEntry;
    const vehicles = await withRetry(() =>
      prisma.vehicle.findMany({
        where: { status: 'AVAILABLE', partner: { city: cityName } },
        orderBy: { createdAt: 'desc' }, take: 12,
        select: { id: true, brand: true, model: true, version: true, year: true, price: true, mileage: true, transmission: true, images: true },
      })
    );
    const vs = vehicles.map(v => ({ ...v, price: Number(v.price) }));
    const minP = vs.length ? Math.min(...vs.map(v => v.price)) : 0;
    const maxP = vs.length ? Math.max(...vs.map(v => v.price)) : 0;
    return {
      title: `Comprar Carro em ${cityName} — Estoque Motorz`,
      description: `Encontre veículos disponíveis em ${cityName} com inspeção e garantia Motorz. ${vs.length} opções de ${fmt(minP)} a ${fmt(maxP)}.`,
      eyebrow: `Estoque em ${cityName}`,
      headline: `Compre seu próximo carro em ${cityName}`,
      intro: `A Motorz tem ${vs.length} veículos disponíveis em ${cityName}, todos inspecionados em 30 pontos e com garantia inclusa. Preço final, sem taxas surpresa.`,
      vehicles: vs,
      faq: [
        { q: `Quais carros estão disponíveis em ${cityName}?`, a: `Temos ${vs.length} veículos disponíveis em ${cityName}, de diversas marcas e faixas de preço, todos com Inspeção Motorz 30 pontos.` },
        { q: 'Como funciona a garantia Motorz?', a: 'Todo veículo do nosso estoque vem com garantia inclusa na compra. Consulte nossa equipe para detalhes.' },
        { q: 'Posso fazer um test drive?', a: 'Sim! Agende um test drive gratuito com nossa equipe via WhatsApp.' },
      ],
    };
  }

  // ── Categoria ───────────────────────────────────────────────
  const categoryMap: Record<string, { where: Prisma.VehicleWhereInput; eyebrow: string; headline: string; intro: (count: number, min: number, max: number) => string }> = {
    'suv-automatico-abcd': {
      where: { status: 'AVAILABLE', transmission: 'AUTOMATIC' },
      eyebrow: 'SUVs Automáticos', headline: 'SUVs Automáticos no ABCD',
      intro: (n, min, max) => `${n} SUVs automáticos disponíveis no ABCD Paulista. Faixa de preço: ${fmt(min)} a ${fmt(max)}.`,
    },
    'carros-abaixo-100k-abcd': {
      where: { status: 'AVAILABLE', price: { lte: 100000 } },
      eyebrow: 'Até R$ 100k', headline: 'Melhores Carros até R$ 100k no ABCD',
      intro: (n) => `${n} veículos abaixo de R$ 100.000 com curadoria Motorz. Todos inspecionados e com garantia.`,
    },
    'carros-automaticos-abcd': {
      where: { status: 'AVAILABLE', transmission: 'AUTOMATIC' },
      eyebrow: 'Câmbio Automático', headline: 'Carros Automáticos no ABCD',
      intro: (n, min, max) => `${n} veículos automáticos no estoque Motorz. De ${fmt(min)} a ${fmt(max)}.`,
    },
    'primeiro-carro-abcd': {
      where: { status: 'AVAILABLE', price: { lte: 80000 } },
      eyebrow: 'Primeiro Carro', headline: 'Comprar o Primeiro Carro no ABCD',
      intro: (n) => `${n} opções ideais para o primeiro carro no ABCD. Foco em segurança, procedência e preço justo.`,
    },
  };

  const cat = categoryMap[slug];
  if (cat) {
    const vehicles = await withRetry(() =>
      prisma.vehicle.findMany({ where: cat.where, orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, brand: true, model: true, version: true, year: true, price: true, mileage: true, transmission: true, images: true } })
    );
    const vs = vehicles.map(v => ({ ...v, price: Number(v.price) }));
    const minP = vs.length ? Math.min(...vs.map(v => v.price)) : 0;
    const maxP = vs.length ? Math.max(...vs.map(v => v.price)) : 0;
    return {
      title: `${cat.headline} | Motorz`,
      description: cat.intro(vs.length, minP, maxP),
      eyebrow: cat.eyebrow, headline: cat.headline,
      intro: cat.intro(vs.length, minP, maxP),
      vehicles: vs,
      faq: [
        { q: 'Todos os carros têm garantia?', a: 'Sim. Todo veículo Motorz inclui garantia na compra, sem custo adicional.' },
        { q: 'Como é feita a inspeção?', a: 'Realizamos inspeção em 30 pontos: motor, freios, câmbio, elétrica, documentação e mais.' },
        { q: 'Posso financiar?', a: 'Sim. Nossa equipe te auxilia com as melhores condições de financiamento disponíveis.' },
      ],
    };
  }

  // ── Marca ───────────────────────────────────────────────────
  const brandMatch = slug.match(/^melhores-(.+)-abcd$/);
  if (brandMatch) {
    const brandSlug = brandMatch[1];
    const vehicles = await withRetry(() =>
      prisma.vehicle.findMany({ where: { status: 'AVAILABLE' }, orderBy: { brand: 'asc' }, take: 1, select: { brand: true } })
    );
    const allBrands = await withRetry(() =>
      prisma.vehicle.findMany({ where: { status: 'AVAILABLE' }, select: { brand: true }, distinct: ['brand'] })
    );
    const brand = allBrands.find(b => b.brand.toLowerCase().replace(/\s+/g, '-') === brandSlug)?.brand;
    if (!brand) return null;

    const vs0 = await withRetry(() =>
      prisma.vehicle.findMany({ where: { status: 'AVAILABLE', brand }, orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, brand: true, model: true, version: true, year: true, price: true, mileage: true, transmission: true, images: true } })
    );
    const vs = vs0.map(v => ({ ...v, price: Number(v.price) }));
    const minP = vs.length ? Math.min(...vs.map(v => v.price)) : 0;
    const maxP = vs.length ? Math.max(...vs.map(v => v.price)) : 0;
    return {
      title: `Melhores ${brand} no ABCD Paulista | Motorz`,
      description: `${vs.length} veículos ${brand} disponíveis no ABCD. De ${fmt(minP)} a ${fmt(maxP)}. Todos inspecionados e com garantia Motorz.`,
      eyebrow: brand, headline: `Melhores ${brand} no ABCD Paulista`,
      intro: `A Motorz tem ${vs.length} veículos ${brand} disponíveis no ABCD Paulista, de ${fmt(minP)} a ${fmt(maxP)}. Todos passaram pela Inspeção 30 pontos e têm garantia inclusa.`,
      vehicles: vs,
      faq: [
        { q: `Quais modelos ${brand} estão disponíveis?`, a: `Temos ${vs.length} modelos ${brand} em estoque. Veja abaixo as opções disponíveis agora.` },
        { q: `${brand} é uma boa opção para o ABCD?`, a: `Sim. ${brand} é uma das marcas mais procuradas no ABCD por seu custo-benefício e disponibilidade de peças.` },
        { q: 'Como garantir meu ${brand} preferido?', a: 'Basta clicar em "Tenho Interesse" no veículo escolhido. Nossa equipe entra em contato em até 2 horas.' },
      ],
    };
    void vehicles; // suppress unused warning
  }

  return null;
}

// ── generateStaticParams ─────────────────────────────────────────────────────

export async function generateStaticParams() {
  const brands = await withRetry(() =>
    prisma.vehicle.findMany({ where: { status: 'AVAILABLE' }, select: { brand: true }, distinct: ['brand'] })
  );

  const brandSlugs = brands.map(b => ({ slug: `melhores-${b.brand.toLowerCase().replace(/\s+/g, '-')}-abcd` }));
  const citySlugs  = Object.keys(CITY_MAP).map(c => ({ slug: `comprar-carro-${c}` }));
  const catSlugs   = ['suv-automatico-abcd', 'carros-abaixo-100k-abcd', 'carros-automaticos-abcd', 'primeiro-carro-abcd'].map(s => ({ slug: s }));

  return [...catSlugs, ...citySlugs, ...brandSlugs];
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) return { title: 'Artigo não encontrado | Motorz' };
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `https://motorz.com.br/blog/${slug}` },
    openGraph: {
      title: article.title, description: article.description,
      url: `https://motorz.com.br/blog/${slug}`,
      images: [{ url: 'https://motorz.com.br/api/og', width: 1200, height: 630 }],
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) notFound();

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);

  return (
    <div style={{ background: 'var(--mz-snow)', minHeight: '100vh', paddingTop: '96px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--mz-slate-dim)', marginBottom: '40px' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</Link>
          <span>/</span>
          <span style={{ color: 'var(--mz-royal)' }}>{article.eyebrow}</span>
        </nav>

        {/* Hero */}
        <div style={{ marginBottom: '56px', maxWidth: '800px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-royal)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '12px' }}>
            {article.eyebrow}
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: 'var(--mz-ink)', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 20px' }}>
            {article.headline}
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-dim)', lineHeight: 1.7, margin: '0 0 24px' }}>{article.intro}</p>

          {/* Trust pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Inspeção 30 pontos', 'Garantia inclusa', 'Preço final', 'ABCD Paulista'].map(tag => (
              <span key={tag} style={{ fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', background: 'white', border: '1px solid var(--border)', color: 'var(--mz-slate)' }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Vehicle grid */}
        {article.vehicles.length > 0 ? (
          <div style={{ marginBottom: '64px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-slate-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
              {article.vehicles.length} veículo{article.vehicles.length > 1 ? 's' : ''} disponíveis agora
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '20px' }}>
              {article.vehicles.map(v => {
                const score = computeMotorzScore(v);
                const { label: scoreLabel, ring } = getScoreDisplay(score);
                return (
                  <Link key={v.id} href={`/veiculo/${v.id}`} style={{ textDecoration: 'none', display: 'block', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                  >
                    <div style={{ aspectRatio: '16/10', position: 'relative', background: 'var(--mz-ash)' }}>
                      {v.images?.[0] && <Image src={v.images[0]} alt={`${v.brand} ${v.model}`} fill sizes="300px" style={{ objectFit: 'cover' }} unoptimized />}
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', borderRadius: '20px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ring, display: 'inline-block' }} />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: ring }}>{score} · {scoreLabel}</span>
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>{v.brand} · {v.year}</p>
                      <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--mz-ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>{v.model}</p>
                      {v.version && <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '0 0 10px' }}>{v.version}</p>}
                      <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--mz-royal)', margin: 0, letterSpacing: '-0.02em' }}>{fmt(v.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '64px' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Nenhum veículo disponível nesta categoria no momento. <Link href="/estoque" style={{ color: 'var(--mz-royal)', fontWeight: 700 }}>Ver estoque completo →</Link></p>
          </div>
        )}

        {/* FAQ */}
        <div style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--mz-ink)', margin: '0 0 32px', letterSpacing: '-0.02em' }}>Perguntas frequentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {article.faq.map(({ q, a }) => (
              <div key={q} style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--mz-ink)', margin: '0 0 8px' }}>{q}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: '64px', padding: '48px', background: '#0A1931', borderRadius: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#FFC107', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>Pronto para decidir?</p>
          <h3 style={{ fontSize: '28px', fontWeight: 900, color: 'white', margin: '0 0 16px', letterSpacing: '-0.02em' }}>Encontre seu carro no ABCD</h3>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', margin: '0 0 28px' }}>Todos os veículos com inspeção Motorz, garantia inclusa e preço final.</p>
          <Link href="/estoque" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: '14px', background: '#1243B2', color: 'white', fontWeight: 800, fontSize: '15px', textDecoration: 'none' }}>
            Ver estoque completo →
          </Link>
        </div>
      </div>

      {/* JSON-LD FAQ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: article.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }) }} />
    </div>
  );
}
