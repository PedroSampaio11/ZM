'use client';

import { useState, useTransition, useEffect } from 'react';
import { createLead } from '@/lib/lead-actions';
import { Vehicle } from '@/modules/inventory/types';
import { CheckCircle, X } from 'lucide-react';

interface LeadSheetProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
}

export function LeadBottomSheet({ vehicle, isOpen, onClose }: LeadSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { setDone(false); setError(null); }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !vehicle) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createLead(formData);
      if (result.success) {
        setDone(true);
        if (result.whatsappUrl) {
          setTimeout(() => { window.open(result.whatsappUrl, '_blank'); }, 1200);
        }
        setTimeout(() => { onClose(); }, 4500);
      } else {
        setError(result.error || 'Erro ao enviar. Tente novamente.');
      }
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-premium" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>

        {/* close */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'var(--mz-frost)', border: '1px solid var(--border)',
            borderRadius: '50%', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--mz-slate)',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ padding: '40px 36px 36px' }}>

          {!done ? (
            <>
              {/* vehicle context — minimal */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-royal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  {vehicle.brand}
                </p>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--mz-ink)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
                  {vehicle.model}
                </h2>
                <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--mz-royal)' }}>
                  {formatCurrency(vehicle.price)}
                </p>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '28px', lineHeight: 1.5 }}>
                Deixe seu contato e um consultor Motorz entra em contacto agora.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input type="hidden" name="vehicleId" value={vehicle.id} />
                <input type="hidden" name="origin"    value="PLATFORM_WEB" />

                <input
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  required
                  className="input-premium"
                  autoComplete="name"
                  autoFocus
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="WhatsApp com DDD (11 9 9999-9999)"
                  required
                  className="input-premium"
                  autoComplete="tel"
                  inputMode="numeric"
                />

                {error && (
                  <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                  style={{ width: '100%', padding: '18px', fontSize: '15px', marginTop: '4px' }}
                >
                  {isPending ? 'Enviando...' : 'Solicitar Proposta'}
                </button>
              </form>

              <p style={{ fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
                Sem compromisso. Seus dados são usados apenas para este contato.
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0 12px' }} className="anim-fade-up">
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle size={36} color="#25D366" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px', color: 'var(--mz-ink)' }}>Recebido!</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.6 }}>
                Abrindo WhatsApp para continuar o atendimento...
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
