'use client';

import './platform.css';
import { useState, useEffect } from 'react';
import { MessageCircle, Menu, X, Home, Package, Heart } from 'lucide-react';

// ── NAVIGATION ───────────────────────────────────────────
function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`nav-top ${scrolled ? 'scrolled' : ''}`}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/assets/brand/logos/logo1.png" alt="Motorz" style={{ height: '32px' }} />
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex" style={{ gap: '32px', alignItems: 'center' }}>
            {['Estoque', 'Tecnologia', 'Sobre'].map((item) => (
              <a 
                key={item} 
                href={`/#${item.toLowerCase()}`} 
                style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mz-ink)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--mz-royal)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--mz-ink)'}
              >
                {item}
              </a>
            ))}
            <a 
              href="https://wa.me/5511999999999" 
              className="btn-premium-gold" 
              style={{ padding: '10px 24px', fontSize: '13px' }}
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mz-ink)' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.98)', zIndex: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}
          className="anim-fade-up"
        >
          {['Estoque', 'Tecnologia', 'Sobre'].map((item) => (
            <a 
              key={item} 
              href={`/#${item.toLowerCase()}`} 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ fontSize: '24px', fontWeight: 800, color: 'var(--mz-ink)', textDecoration: 'none' }}
            >
              {item}
            </a>
          ))}
          <a href="https://wa.me/5511999999999" className="btn-premium-gold">
            Falar com Consultor
          </a>
        </div>
      )}
    </>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav md:hidden">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', height: '100%', alignItems: 'center' }}>
        <a href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--mz-royal)' }}>
          <Home size={20} />
          <span style={{ fontSize: '10px', fontWeight: 700 }}>Início</span>
        </a>
        <a href="#estoque" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--mz-slate-dim)' }}>
          <Package size={20} />
          <span style={{ fontSize: '10px', fontWeight: 700 }}>Estoque</span>
        </a>
        <a href="#favoritos" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--mz-slate-dim)' }}>
          <Heart size={20} />
          <span style={{ fontSize: '10px', fontWeight: 700 }}>Favoritos</span>
        </a>
        <a href="https://wa.me/5511999999999" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--mz-slate-dim)' }}>
          <MessageCircle size={20} />
          <span style={{ fontSize: '10px', fontWeight: 700 }}>WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ background: 'var(--mz-snow)', borderTop: '1px solid var(--border)', padding: '80px 20px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', marginBottom: '60px' }}>
          <div>
            <img src="/assets/brand/logos/logo1.png" alt="Motorz" style={{ height: '32px', marginBottom: '24px' }} />
            <p style={{ color: 'var(--text-faint)', fontSize: '14px', lineHeight: 1.6 }}>
              Redefinindo a compra e venda de veículos através de curadoria premium e tecnologia de ponta.
            </p>
          </div>
          <div>
            <h5 style={{ fontWeight: 800, marginBottom: '24px', fontSize: '14px', color: 'var(--mz-ink)', textTransform: 'uppercase' }}>Navegação</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '14px' }}>Início</a></li>
              <li><a href="#estoque" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '14px' }}>Estoque</a></li>
              <li><a href="#sobre" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '14px' }}>Sobre Nós</a></li>
            </ul>
          </div>
          <div>
            <h5 style={{ fontWeight: 800, marginBottom: '24px', fontSize: '14px', color: 'var(--mz-ink)', textTransform: 'uppercase' }}>Legal</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="/privacidade" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '14px' }}>Privacidade</a></li>
              <li><a href="/termos" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '14px' }}>Termos de Uso</a></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>© 2024 Motorz Platform. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

// ── LAYOUT ROOT ──────────────────────────────────────────
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Motorz — Curadoria Automotiva Premium</title>
        <meta name="description" content="A plataforma que redefine a experiência de compra e venda de veículos com tecnologia e confiança." />
      </head>
      <body>
        <TopNav />
        <main className="main-content">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
