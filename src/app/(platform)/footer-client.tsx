'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ background: '#0A1931', position: 'relative', overflow: 'hidden', padding: '100px 24px 40px' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', marginBottom: '100px' }}>
          <div>
            <Image
              src="/assets/brand/logos/logo1.png"
              alt="Motorz"
              width={112}
              height={28}
              style={{ height: '28px', width: 'auto', marginBottom: '24px', filter: 'brightness(0) invert(1)', display: 'block' }}
            />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.6, fontWeight: 500 }}>
              O marketplace automotivo premium do ABCD Paulista — Santo André, São Bernardo, São Caetano e Diadema.
            </p>
          </div>
          <div>
            <h5 style={{ fontWeight: 800, marginBottom: '24px', fontSize: '14px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Navegação</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Início', href: '/' },
                { label: 'Estoque', href: '/estoque' },
                { label: 'Sobre', href: '/#quem-somos' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 style={{ fontWeight: 800, marginBottom: '24px', fontSize: '14px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plataforma</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Lojas Parceiras', href: '/#parceiros' },
                { label: 'Faça Parte', href: '/embaixador' },
                { label: 'Falar com Consultor', href: 'https://wa.me/5511999999999' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '48px', paddingBottom: '48px', flexWrap: 'wrap', gap: '40px', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '10%', left: '0', width: '300px', height: '150px', background: '#FFB800', opacity: 0.12, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0, borderRadius: '50%' }} />
          <h2 style={{ fontSize: 'clamp(120px, 20vw, 360px)', fontWeight: 900, letterSpacing: '-0.06em', color: '#FFB800', lineHeight: 0.8, margin: 0, textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
            ZM.
          </h2>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Voltar ao topo"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: 'white', cursor: 'pointer', transition: 'all 0.3s ease', flexShrink: 0, zIndex: 1 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FFB800'; e.currentTarget.style.color = '#FFB800'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <ArrowUp size={28} strokeWidth={1.5} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 500 }}>© {new Date().getFullYear()} Motorz. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', gap: '32px' }}>
            <Link href="/termos" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 500 }}>Termos de Uso</Link>
            <Link href="/privacidade" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 500 }}>Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
