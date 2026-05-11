'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Package, MessageCircle, Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { items, mounted } = useFavorites();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: 'Estoque', href: '/estoque' },
    { name: 'Sobre', href: '/#quem-somos' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, x: '-50%', opacity: 0 }}
        animate={{ 
          y: isMobileMenuOpen ? -100 : 0, 
          x: '-50%', 
          opacity: isMobileMenuOpen ? 0 : 1 
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`nav-top ${scrolled ? 'scrolled' : ''}`}
        style={{ pointerEvents: isMobileMenuOpen ? 'none' : 'auto' }}
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
            
            <Link 
              href="/favoritos" 
              style={{ position: 'relative', padding: '8px', color: pathname === '/favoritos' ? 'var(--mz-royal)' : 'var(--mz-slate)', transition: 'all 0.2s' }}
              aria-label="Ver favoritos"
            >
              <Heart size={22} fill={pathname === '/favoritos' ? 'currentColor' : 'none'} />
              {mounted && items.length > 0 && (
                <span style={{ position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', background: '#e11d48', color: 'white', fontSize: '9px', fontWeight: 900, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                  {items.length}
                </span>
              )}
            </Link>

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(16px)', 
              zIndex: 950, 
              display: 'flex', 
              flexDirection: 'column',
            }}
          >
            {/* Menu Header (Logo + Close) */}
            <div style={{ height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
              <Image
                src="/assets/brand/logos/logo1.png"
                alt="Motorz"
                width={100}
                height={25}
                style={{ height: '25px', width: 'auto' }}
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'var(--mz-frost)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mz-ink)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Mesh Background for Menu */}
            <div className="mesh-bg" style={{ opacity: 0.1, zIndex: -1 }} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px', paddingBottom: '100px' }}>
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ fontSize: '32px', fontWeight: 900, color: 'var(--mz-ink)', textDecoration: 'none', letterSpacing: '-0.03em' }}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: '20px' }}
              >
                <Link
                  href="/embaixador"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ padding: '20px 48px', fontSize: '18px', textDecoration: 'none', borderRadius: '20px' }}
                >
                  Faça Parte
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { items, mounted } = useFavorites();

  // Hide the global bottom nav on vehicle details pages to avoid overlapping the lead capture bar
  if (pathname?.startsWith('/veiculo/')) {
    return null;
  }

  return (
    <nav className="bottom-nav" aria-label="Navegação mobile">
      <style dangerouslySetInnerHTML={{__html: `
        .bottom-nav { display: none; }
        @media (max-width: 768px) { .bottom-nav { display: block; } }
        .menu-open .bottom-nav { transform: translateY(100%); pointer-events: none; }
      `}} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', height: '100%', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: pathname === '/' ? 'var(--mz-royal)' : 'var(--mz-slate-dim)' }}>
          <Home size={20} />
          <span style={{ fontSize: '10px', fontWeight: 700 }}>Início</span>
        </Link>
        <Link href="/estoque" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: pathname === '/estoque' ? 'var(--mz-royal)' : 'var(--mz-slate-dim)' }}>
          <Package size={20} />
          <span style={{ fontSize: '10px', fontWeight: 700 }}>Estoque</span>
        </Link>
        <Link href="/favoritos" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: pathname === '/favoritos' ? 'var(--mz-royal)' : 'var(--mz-slate-dim)', position: 'relative' }}>
          <Heart size={20} fill={pathname === '/favoritos' ? 'currentColor' : 'none'} />
          <span style={{ fontSize: '10px', fontWeight: 700 }}>Favoritos</span>
          {mounted && items.length > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '12px', width: '16px', height: '16px', background: '#e11d48', color: 'white', fontSize: '9px', fontWeight: 900, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
              {items.length}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
