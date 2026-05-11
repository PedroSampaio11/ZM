import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--mz-snow)',
      padding: '24px',
      fontFamily: "'Onest', sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>

        {/* Logo text */}
        <p style={{
          fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--mz-royal)', marginBottom: '32px',
        }}>
          Motorz
        </p>

        {/* 404 */}
        <div style={{
          fontSize: 'clamp(80px, 20vw, 140px)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: 'var(--mz-ink)',
          marginBottom: '8px',
          fontFamily: "'Cal Sans', 'Onest', sans-serif",
        }}>
          404
        </div>

        <h1 style={{
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 800,
          color: 'var(--mz-ink)',
          letterSpacing: '-0.01em',
          marginBottom: '16px',
        }}>
          Esse carro já foi embora.
        </h1>

        <p style={{
          fontSize: '16px',
          color: 'var(--text-dim)',
          lineHeight: 1.6,
          marginBottom: '40px',
        }}>
          A página que você procura não existe ou o veículo já foi vendido.
          Mas temos muitos outros esperando por você.
        </p>

        <Link
          href="/estoque"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 36px',
            background: 'var(--mz-royal)',
            color: 'white',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '15px',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          Ver estoque disponível <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
        </Link>

        <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-faint)', fontWeight: 500 }}>
          ou{' '}
          <Link href="/" style={{ color: 'var(--mz-royal)', fontWeight: 700, textDecoration: 'none' }}>
            volte para o início
          </Link>
        </p>

      </div>
    </div>
  );
}
