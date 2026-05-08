'use client';

import './platform.css';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, Menu, X, Home, Package, Heart, ArrowUp } from 'lucide-react';

// ── NAVIGATION ───────────────────────────────────────────
function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Estoque', href: '/#estoque' },
    { name: 'Tecnologia', href: '/#tecnologia' },
    { name: 'Parceiros', href: '/#parceiros' },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100, x: '-50%', opacity: 0 }}
        animate={{ y: 0, x: '-50%', opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`nav-top ${scrolled ? 'scrolled' : ''}`}
      >
        <div style={{ padding: '0 24px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src="/assets/brand/logos/logo1.png" 
              alt="Motorz" 
              style={{ height: '28px' }} 
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex" style={{ gap: '8px', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className="nav-link"
              >
                {item.name}
              </Link>
            ))}
            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 8px' }} />
            <a 
              href="https://wa.me/5511999999999" 
              style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '12px', background: 'var(--motorz-gold)', color: 'var(--mz-ink)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
              <MessageCircle size={16} />
              Consultor
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mz-ink)', padding: '8px' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(10px)', zIndex: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}
          >
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ fontSize: '28px', fontWeight: 800, color: 'var(--mz-ink)', textDecoration: 'none', letterSpacing: '-0.04em' }}
              >
                {item.name}
              </Link>
            ))}
            <a href="https://wa.me/5511999999999" className="btn-primary" style={{ padding: '20px 40px', fontSize: '18px' }}>
              WhatsApp Consultor
            </a>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ marginTop: '40px', background: 'var(--mz-frost)', border: 'none', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
    <footer style={{ background: '#0A1931', position: 'relative', overflow: 'hidden', padding: '100px 24px 40px' }}>
      {/* Background Grid — imperceptible */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.008) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* TOP: Professional Footer Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', marginBottom: '100px' }}>
          <div>
            <img src="/assets/brand/logos/logo1.png" alt="Motorz" style={{ height: '28px', marginBottom: '24px', filter: 'brightness(0) invert(1)', display: 'block' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.6, fontWeight: 500 }}>
              Redefinindo a compra e venda de veículos através de curadoria premium e tecnologia de ponta.
            </p>
          </div>
          <div>
            <h5 style={{ fontWeight: 800, marginBottom: '24px', fontSize: '14px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Navegação</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li><a href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color='white'} onMouseLeave={(e) => e.currentTarget.style.color='rgba(255,255,255,0.6)'}>Início</a></li>
              <li><a href="#estoque" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color='white'} onMouseLeave={(e) => e.currentTarget.style.color='rgba(255,255,255,0.6)'}>Estoque</a></li>
              <li><a href="#tecnologia" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color='white'} onMouseLeave={(e) => e.currentTarget.style.color='rgba(255,255,255,0.6)'}>Tecnologia</a></li>
            </ul>
          </div>
          <div>
            <h5 style={{ fontWeight: 800, marginBottom: '24px', fontSize: '14px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plataforma</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li><a href="#parceiros" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color='white'} onMouseLeave={(e) => e.currentTarget.style.color='rgba(255,255,255,0.6)'}>Lojas Parceiras</a></li>
              <li><a href="https://wa.me/5511999999999" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color='white'} onMouseLeave={(e) => e.currentTarget.style.color='rgba(255,255,255,0.6)'}>Falar com Consultor</a></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM: Massive ZM. Text & Button */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '48px', paddingBottom: '48px', flexWrap: 'wrap', gap: '40px', position: 'relative' }}>
          {/* Seamless Glow tightly behind the ZM text */}
          <div style={{ position: 'absolute', bottom: '10%', left: '0', width: '300px', height: '150px', background: '#FFB800', opacity: 0.12, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0, borderRadius: '50%' }} />
          <h2 style={{ 
            fontSize: 'clamp(120px, 20vw, 360px)', 
            fontWeight: 900, 
            letterSpacing: '-0.06em', 
            color: '#FFB800', 
            lineHeight: 0.8, 
            margin: 0,
            textTransform: 'uppercase',
            position: 'relative',
            zIndex: 1
          }}>
            ZM.
          </h2>
          <a href="#estoque" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.25)',
            color: 'white',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            zIndex: 1
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FFB800'; e.currentTarget.style.color = '#FFB800'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <ArrowUp size={28} strokeWidth={1.5} />
          </a>
        </div>

        {/* Footer Legal Links */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 500 }}>© All rights reserved {new Date().getFullYear()}</p>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="/termos" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={(e) => e.currentTarget.style.color='white'} onMouseLeave={(e) => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>Terms and Conditions</a>
            <a href="/privacidade" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={(e) => e.currentTarget.style.color='white'} onMouseLeave={(e) => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>Privacy Policy</a>
          </div>
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
