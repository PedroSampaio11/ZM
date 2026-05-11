'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Package, MessageCircle } from 'lucide-react';

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Estoque', href: '/estoque' },
    { name: 'Sobre', href: '/#quem-somos' },
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Image
                src="/assets/brand/logos/logo1.png"
                alt="Motorz — Marketplace Automotivo ABCD Paulista"
                width={112}
                height={28}
                priority
                style={{ height: '28px', width: 'auto' }}
              />
            </motion.div>
          </Link>

          <div className="hidden md:flex" style={{ gap: '8px', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="nav-link">
                {item.name}
              </Link>
            ))}
            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 8px' }} />
            {pathname !== '/embaixador' && (
              <Link
                href="/embaixador"
                style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '12px', background: 'var(--mz-ink)', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                Faça Parte 
              </Link>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mz-ink)', padding: '8px' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

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
            <Link
              href="/embaixador"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary"
              style={{ padding: '20px 40px', fontSize: '18px', textDecoration: 'none' }}
            >
              Faça Parte
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Fechar menu"
              style={{ marginTop: '40px', background: 'var(--mz-frost)', border: 'none', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  // Hide the global bottom nav on vehicle details pages to avoid overlapping the lead capture bar
  if (pathname?.startsWith('/veiculo/')) {
    return null;
  }

  return (
    <nav className="bottom-nav md:hidden" aria-label="Navegação mobile">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', height: '100%', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--mz-royal)' }}>
          <Home size={20} />
          <span style={{ fontSize: '10px', fontWeight: 700 }}>Início</span>
        </Link>
        <Link href="/estoque" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--mz-slate-dim)' }}>
          <Package size={20} />
          <span style={{ fontSize: '10px', fontWeight: 700 }}>Estoque</span>
        </Link>
      </div>
    </nav>
  );
}
