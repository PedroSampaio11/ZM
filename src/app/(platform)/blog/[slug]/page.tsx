import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma, withRetry } from '@/lib/prisma';
import { computeMotorzScore, getScoreDisplay } from '@/lib/motorz-score';

export const revalidate = 3600;
export const dynamicParams = true;

const CITY_MAP: Record<string, string> = {
  'santo-andre': 'Santo André',
  'sao-bernardo': 'São Bernardo do Campo',
  'sao-caetano': 'São Caetano do Sul',
  'diadema': 'Diadema',
};

const WA = 'https://wa.me/5511999999999';

type VehicleRow = {
  id: string; brand: string; model: string; version: string | null;
  year: number; price: number; mileage: number; transmission: string | null; images: string[];
};

type ArticleData = {
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  vehicles: VehicleRow[];
  faq: { q: string; a: string }[];
  related: { slug: string; label: string }[];
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);

const fmtKm = (v: number) =>
  v === 0 ? '0 km' : v >= 1000 ? `${(v / 1000).toFixed(0)}k km` : `${v} km`;

const SELECT = { id: true, brand: true, model: true, version: true, year: true, price: true, mileage: true, transmission: true, images: true } as const;

async function resolveArticle(slug: string): Promise<ArticleData | null> {
  // ── Cidade ──────────────────────────────────────────────────────────────────
  const cityEntry = Object.entries(CITY_MAP).find(([k]) => slug === `comprar-carro-${k}`);
  if (cityEntry) {
    const [, cityName] = cityEntry;
    const raw = await withRetry(() =>
      prisma.vehicle.findMany({
        where: { status: 'AVAILABLE', partner: { city: cityName } },
        orderBy: { price: 'asc' }, take: 12, select: SELECT,
      })
    );
    const vs = raw.map(v => ({ ...v, price: Number(v.price) }));
    const minP = vs.length ? Math.min(...vs.map(v => v.price)) : 0;
    const maxP = vs.length ? Math.max(...vs.map(v => v.price)) : 0;
    return {
      title: `Comprar Carro em ${cityName} — Estoque Motorz ABCD`,
      description: `${vs.length} veículos disponíveis em ${cityName} com inspeção 30 pontos e garantia inclusa. De ${fmt(minP)} a ${fmt(maxP)}. Preço final, sem surpresas.`,
      eyebrow: `Estoque em ${cityName}`,
      headline: `Compre seu próximo carro em ${cityName}`,
      intro: `A Motorz tem ${vs.length} veículo${vs.length !== 1 ? 's' : ''} disponíveis em ${cityName}, todos inspecionados em 30 pontos e com garantia inclusa. Preço final, sem taxas surpresa.`,
      vehicles: vs,
      faq: [
        { q: `Quais carros estão disponíveis em ${cityName}?`, a: `Temos ${vs.length} veículos em ${cityName}, de diversas marcas e faixas de preço, todos com Inspeção Motorz 30 pontos e garantia inclusa.` },
        { q: 'Como funciona a garantia Motorz?', a: 'Todo veículo do nosso estoque vem com garantia inclusa na compra, sem custo adicional. Consulte nossa equipe para detalhes do período.' },
        { q: 'Posso fazer um test drive?', a: 'Sim! Agende um test drive gratuito com nossa equipe via WhatsApp. Atendimento de segunda a sábado.' },
        { q: 'Como funciona o processo de compra?', a: 'Você demonstra interesse pelo site ou WhatsApp, nossa equipe entra em contato em até 2 horas, agendamos o test drive e cuidamos de toda a documentação.' },
      ],
      related: Object.entries(CITY_MAP)
        .filter(([k]) => k !== cityEntry[0])
        .slice(0, 3)
        .map(([k, label]) => ({ slug: `comprar-carro-${k}`, label: `Estoque em ${label}` })),
    };
  }

  // Matches 'AUTOMATIC', 'automatic', 'Automático', 'AUTO', 'CVT' — DB values vary by adapter
  const autoFilter: Prisma.VehicleWhereInput = {
    OR: [
      { transmission: { startsWith: 'auto', mode: 'insensitive' } },
      { transmission: { equals: 'CVT', mode: 'insensitive' } },
    ],
  };

  // ── Categoria ────────────────────────────────────────────────────────────────
  const categoryMap: Record<string, { where: Prisma.VehicleWhereInput; eyebrow: string; headline: string; intro: (n: number, min: number, max: number) => string }> = {
    'suv-automatico-abcd': {
      where: { status: 'AVAILABLE', ...autoFilter },
      eyebrow: 'SUVs Automáticos', headline: 'SUVs Automáticos no ABCD Paulista',
      intro: (n, min, max) => `${n} SUVs automáticos disponíveis no ABCD. Faixa de preço: ${fmt(min)} a ${fmt(max)}. Todos inspecionados e com garantia.`,
    },
    'carros-abaixo-100k-abcd': {
      where: { status: 'AVAILABLE', price: { lte: 100000 } },
      eyebrow: 'Até R$ 100k', headline: 'Melhores Carros até R$ 100k no ABCD',
      intro: (n) => `${n} veículos abaixo de R$ 100.000 com curadoria Motorz. Todos inspecionados e com garantia inclusa.`,
    },
    'carros-automaticos-abcd': {
      where: { status: 'AVAILABLE', ...autoFilter },
      eyebrow: 'Câmbio Automático', headline: 'Carros Automáticos no ABCD — Estoque Completo',
      intro: (n, min, max) => `${n} veículos automáticos no estoque Motorz. De ${fmt(min)} a ${fmt(max)}.`,
    },
    'primeiro-carro-abcd': {
      where: { status: 'AVAILABLE', price: { lte: 80000 } },
      eyebrow: 'Primeiro Carro', headline: 'Comprar o Primeiro Carro no ABCD — Guia Completo',
      intro: (n) => `${n} opções ideais para o primeiro carro no ABCD. Foco em segurança, procedência e preço justo.`,
    },
  };

  const cat = categoryMap[slug];
  if (cat) {
    const raw = await withRetry(() =>
      prisma.vehicle.findMany({ where: cat.where, orderBy: { price: 'asc' }, take: 12, select: SELECT })
    );
    const vs = raw.map(v => ({ ...v, price: Number(v.price) }));
    const minP = vs.length ? Math.min(...vs.map(v => v.price)) : 0;
    const maxP = vs.length ? Math.max(...vs.map(v => v.price)) : 0;
    return {
      title: `${cat.headline} | Motorz`,
      description: cat.intro(vs.length, minP, maxP),
      eyebrow: cat.eyebrow,
      headline: cat.headline,
      intro: cat.intro(vs.length, minP, maxP),
      vehicles: vs,
      faq: [
        { q: 'Todos os carros têm garantia?', a: 'Sim. Todo veículo Motorz inclui garantia na compra, sem custo adicional.' },
        { q: 'Como é feita a inspeção Motorz?', a: 'Realizamos inspeção em 30 pontos: motor, freios, câmbio, elétrica, documentação e mais.' },
        { q: 'Posso financiar?', a: 'Sim. Nossa equipe te auxilia com as melhores condições de financiamento disponíveis no ABCD.' },
        { q: 'Quanto tempo leva para finalizar a compra?', a: 'A maioria das compras é concluída em 24-48 horas após o test drive. Cuidamos de toda a burocracia.' },
      ],
      related: [
        { slug: 'comprar-carro-santo-andre', label: 'Estoque em Santo André' },
        { slug: 'comprar-carro-sao-bernardo', label: 'Estoque em São Bernardo' },
        { slug: 'comprar-carro-sao-caetano', label: 'Estoque em São Caetano' },
      ],
    };
  }

  // ── Marca ────────────────────────────────────────────────────────────────────
  const brandMatch = slug.match(/^melhores-(.+)-abcd$/);
  if (brandMatch) {
    const brandSlug = brandMatch[1];
    const allBrands = await withRetry(() =>
      prisma.vehicle.findMany({ where: { status: 'AVAILABLE' }, select: { brand: true }, distinct: ['brand'] })
    );
    const brand = allBrands.find(b => b.brand.toLowerCase().replace(/\s+/g, '-') === brandSlug)?.brand;
    if (!brand) return null;

    const raw = await withRetry(() =>
      prisma.vehicle.findMany({ where: { status: 'AVAILABLE', brand }, orderBy: { price: 'asc' }, take: 12, select: SELECT })
    );
    const vs = raw.map(v => ({ ...v, price: Number(v.price) }));
    const minP = vs.length ? Math.min(...vs.map(v => v.price)) : 0;
    const maxP = vs.length ? Math.max(...vs.map(v => v.price)) : 0;

    const otherBrands = allBrands
      .map(b => b.brand)
      .filter(b => b !== brand)
      .slice(0, 3)
      .map(b => ({ slug: `melhores-${b.toLowerCase().replace(/\s+/g, '-')}-abcd`, label: `Melhores ${b}` }));

    return {
      title: `Melhores ${brand} no ABCD Paulista — Comprar com Garantia | Motorz`,
      description: `${vs.length} veículos ${brand} disponíveis no ABCD. De ${fmt(minP)} a ${fmt(maxP)}. Todos inspecionados em 30 pontos com garantia Motorz inclusa.`,
      eyebrow: brand,
      headline: `Melhores ${brand} no ABCD Paulista`,
      intro: `A Motorz tem ${vs.length} veículo${vs.length !== 1 ? 's' : ''} ${brand} disponíveis no ABCD Paulista, de ${fmt(minP)} a ${fmt(maxP)}. Todos passaram pela Inspeção 30 pontos e têm garantia inclusa.`,
      vehicles: vs,
      faq: [
        { q: `Quais modelos ${brand} estão disponíveis?`, a: `Temos ${vs.length} modelos ${brand} em estoque. Confira abaixo as opções disponíveis agora no ABCD Paulista.` },
        { q: `${brand} é boa opção para o ABCD Paulista?`, a: `Sim. ${brand} é uma das marcas mais procuradas no ABCD por custo-benefício, disponibilidade de peças e assistência técnica na região.` },
        { q: `Como garantir meu ${brand} preferido?`, a: `Clique em "Tenho Interesse" no veículo escolhido. Nossa equipe entra em contato em até 2 horas para agendar o test drive.` },
        { q: 'Os veículos têm histórico verificado?', a: 'Sim. Verificamos o histórico de todos os veículos antes de incluir no estoque: multas, sinistros, leilão e débitos.' },
      ],
      related: otherBrands,
    };
  }

  return null;
}

// ── generateStaticParams ──────────────────────────────────────────────────────

export async function generateStaticParams() {
  const brands = await withRetry(() =>
    prisma.vehicle.findMany({ where: { status: 'AVAILABLE' }, select: { brand: true }, distinct: ['brand'] })
  );
  return [
    ...['suv-automatico-abcd', 'carros-abaixo-100k-abcd', 'carros-automaticos-abcd', 'primeiro-carro-abcd'].map(s => ({ slug: s })),
    ...Object.keys(CITY_MAP).map(c => ({ slug: `comprar-carro-${c}` })),
    ...brands.map(b => ({ slug: `melhores-${b.brand.toLowerCase().replace(/\s+/g, '-')}-abcd` })),
  ];
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) return { title: 'Artigo não encontrado | Motorz' };
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `https://motorz.com.br/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://motorz.com.br/blog/${slug}`,
      images: [{ url: 'https://motorz.com.br/api/og', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.description },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://motorz.com.br' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://motorz.com.br/blog' },
          { '@type': 'ListItem', position: 3, name: article.eyebrow, item: `https://motorz.com.br/blog/${slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: article.faq.map(({ q, a }) => ({
          '@type': 'Question', name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      ...(article.vehicles.length > 0 ? [{
        '@type': 'ItemList',
        name: article.headline,
        numberOfItems: article.vehicles.length,
        itemListElement: article.vehicles.map((v, i) => ({
          '@type': 'ListItem', position: i + 1,
          url: `https://motorz.com.br/veiculo/${v.id}`,
          name: `${v.brand} ${v.model} ${v.year}`,
        })),
      }] : []),
    ],
  };

  return (
    <div style={{ background: 'var(--mz-snow)', minHeight: '100vh', paddingTop: '96px', paddingBottom: '80px' }}>
      <style>{`
        .blc { text-decoration: none; display: block; background: white; border-radius: 20px; border: 1px solid var(--border); overflow: hidden; transition: transform 0.15s, box-shadow 0.15s; }
        .blc:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.11); }
        .blc-related { text-decoration: none; padding: 10px 20px; border-radius: 12px; background: white; border: 1px solid var(--border); font-size: 13px; font-weight: 700; color: var(--mz-ink); transition: border-color 0.15s, color 0.15s; white-space: nowrap; }
        .blc-related:hover { border-color: var(--mz-royal); color: var(--mz-royal); }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--mz-slate-dim)', marginBottom: '40px' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: 'var(--mz-royal)' }}>{article.eyebrow}</span>
        </nav>

        {/* Article header */}
        <article>
          <header style={{ marginBottom: '56px', maxWidth: '800px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-royal)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '12px' }}>
              {article.eyebrow}
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: 'var(--mz-ink)', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 20px' }}>
              {article.headline}
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--text-dim)', lineHeight: 1.7, margin: '0 0 24px' }}>{article.intro}</p>

            {/* Trust pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {['Inspeção 30 pontos', 'Garantia inclusa', 'Preço final', 'ABCD Paulista'].map(tag => (
                <span key={tag} style={{ fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', background: 'white', border: '1px solid var(--border)', color: 'var(--mz-slate)' }}>{tag}</span>
              ))}
            </div>

            {/* Mid-hero CTA */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/estoque" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: '#1243B2', color: 'white', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
                Ver estoque completo →
              </Link>
              <Link href={WA} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: '#25D366', color: 'white', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
                Falar com consultor
              </Link>
            </div>
          </header>

          {/* Vehicle grid */}
          {article.vehicles.length > 0 ? (
            <section aria-label="Veículos disponíveis" style={{ marginBottom: '64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-slate-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {article.vehicles.length} veículo{article.vehicles.length > 1 ? 's' : ''} disponíveis agora
                </p>
                <Link href="/estoque" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mz-royal)', textDecoration: 'none' }}>
                  Ver todos no estoque →
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '20px' }}>
                {article.vehicles.map(v => {
                  const score = computeMotorzScore(v);
                  const { label: scoreLabel, ring, color: scoreColor } = getScoreDisplay(score);
                  return (
                    <Link key={v.id} href={`/veiculo/${v.id}`} className="blc">
                      <div style={{ aspectRatio: '16/10', position: 'relative', background: 'var(--mz-ash)' }}>
                        {v.images?.[0] && (
                          <Image src={v.images[0]} alt={`${v.brand} ${v.model} ${v.year} — Motorz ABCD`} fill sizes="(max-width: 640px) 100vw, 300px" style={{ objectFit: 'cover' }} unoptimized />
                        )}
                        {/* Score badge */}
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', borderRadius: '20px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ring, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontSize: '10px', fontWeight: 800, color: scoreColor }}>{score} · {scoreLabel}</span>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>{v.brand} · {v.year}</p>
                        <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--mz-ink)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>{v.model}</p>
                        {v.version && <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 0 8px' }}>{v.version}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--mz-royal)', margin: 0, letterSpacing: '-0.02em' }}>{fmt(v.price)}</p>
                          <span style={{ fontSize: '11px', color: 'var(--mz-slate-dim)', fontWeight: 600 }}>{fmtKm(v.mileage)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Post-grid CTA */}
              <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link href="/estoque" style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: '12px', background: 'var(--mz-ink)', color: 'white', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
                  Ver estoque completo →
                </Link>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>Atualizado em tempo real · Estoque próprio</p>
              </div>
            </section>
          ) : (
            <section style={{ padding: '48px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '64px' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '15px', margin: 0 }}>
                Nenhum veículo disponível nesta categoria agora.{' '}
                <Link href="/estoque" style={{ color: 'var(--mz-royal)', fontWeight: 700, textDecoration: 'none' }}>Ver estoque completo →</Link>
              </p>
            </section>
          )}

          {/* FAQ */}
          <section aria-label="Perguntas frequentes" style={{ maxWidth: '720px', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--mz-ink)', margin: '0 0 32px', letterSpacing: '-0.02em' }}>Perguntas frequentes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {article.faq.map(({ q, a }) => (
                <div key={q} style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--mz-ink)', margin: '0 0 8px' }}>{q}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{a}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

        {/* Related articles */}
        {article.related.length > 0 && (
          <section aria-label="Ver também" style={{ marginBottom: '64px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-slate-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Ver também</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {article.related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="blc-related">{r.label}</Link>
              ))}
              <Link href="/blog" className="blc-related" style={{ color: 'var(--mz-royal)' }}>Todos os guias →</Link>
            </div>
          </section>
        )}

        {/* Bottom CTA card */}
        <div style={{ padding: 'clamp(32px, 5vw, 56px)', background: '#0A1931', borderRadius: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#FFC107', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>Pronto para decidir?</p>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Encontre seu carro no ABCD
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
              Todos os veículos com inspeção Motorz, garantia inclusa e preço final. Sem taxas surpresa.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/estoque" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 28px', borderRadius: '14px', background: '#1243B2', color: 'white', fontWeight: 800, fontSize: '15px', textDecoration: 'none', textAlign: 'center' }}>
              Ver estoque completo →
            </Link>
            <Link href={WA} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 28px', borderRadius: '14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
              Falar com um consultor
            </Link>
          </div>
        </div>

      </div>

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
