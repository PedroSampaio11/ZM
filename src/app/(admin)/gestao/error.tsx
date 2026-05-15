'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GestaoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Motorz Admin] Erro no painel:', error.message, error.digest);
  }, [error]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      padding: '40px 24px',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <AlertTriangle size={24} style={{ color: '#ef4444' }} />
      </div>

      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Algo deu errado
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          Erro ao carregar esta seção do painel. Clique abaixo para tentar novamente.
        </p>
        {error.digest && (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '8px', fontFamily: 'monospace' }}>
            ref: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={reset}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '10px 24px',
          fontSize: '13px',
          fontWeight: 700,
          color: 'white',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        <RotateCcw size={14} />
        Tentar novamente
      </button>
    </div>
  );
}
