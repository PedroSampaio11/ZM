'use client';

import { useState, useTransition, useEffect } from 'react';
import { createLead } from '@/lib/lead-actions';
import { Vehicle } from '@/modules/inventory/types';
import { CheckCircle, Shield, MessageCircle, LayoutGrid, Route, Fuel, Settings, ArrowLeft } from 'lucide-react';

interface LeadSheetProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
}

const FUEL_LABELS: Record<string, string> = {
  FLEX: 'Flex',
  GASOLINE: 'Gasolina',
  ETHANOL: 'Etanol',
  DIESEL: 'Diesel',
  ELECTRIC: 'Elétrico',
  HYBRID: 'Híbrido',
};

const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
  CVT: 'CVT',
  SEMI_AUTOMATIC: 'Semi-auto',
};

export function LeadBottomSheet({ vehicle, isOpen, onClose }: LeadSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'detail' | 'form' | 'success'>('detail');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('detail');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createLead(formData);
      if (result.success) {
        setStep('success');
        setTimeout(() => { onClose(); }, 4000);
      } else {
        setError(result.error || 'Erro ao enviar. Tente novamente.');
      }
    });
  }

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} aria-hidden="true" />
      <div className="bottom-sheet" role="dialog">
        <div className="bottom-sheet-handle" />

        <div style={{ padding: '32px 24px 40px' }}>
          {step === 'detail' && (
            <div className="anim-fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--mz-royal)', textTransform: 'uppercase', marginBottom: '4px' }}>{vehicle.brand}</p>
                  <h2 style={{ fontSize: '28px', marginBottom: '4px' }}>{vehicle.model}</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>{vehicle.version}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="price-tag" style={{ fontSize: '28px' }}>{formatCurrency(vehicle.price)}</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-faint)', fontWeight: 600 }}>Curadoria Premium</p>
                </div>
              </div>

              <div className="zoom-container" style={{ aspectRatio: '16/10', marginBottom: '32px', boxShadow: 'var(--shadow-lg)', borderRadius: '24px' }}>
                <img src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200'} alt={vehicle.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
                {[
                  { label: 'KM', value: `${vehicle.mileage?.toLocaleString() || 0}`, icon: <Route size={20} /> },
                  { label: 'Câmbio', value: TRANSMISSION_LABELS[vehicle.transmission || ''] || 'Automático', icon: <Settings size={20} /> },
                  { label: 'Combustível', value: FUEL_LABELS[vehicle.fuel || ''] || 'Flex', icon: <Fuel size={20} /> },
                ].map((spec, i) => (
                  <div key={i} style={{ background: 'var(--mz-frost)', padding: '16px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--mz-royal)', marginBottom: '8px' }}>{spec.icon}</div>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '2px' }}>{spec.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: 800 }}>{spec.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '32px', background: 'var(--mz-frost)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} color="var(--mz-royal)" />
                  Segurança Motorz
                </h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.6 }}>
                  Veículo com vistoria aprovada e procedência garantida. Incluímos higienização premium e transferência digital no processo.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep('form')} className="btn-primary" style={{ flex: 1, padding: '20px', fontSize: '16px' }}>Tenho Interesse</button>
                <a href={`https://wa.me/5511999999999`} className="btn-cta-whatsapp" style={{ padding: '20px' }}><MessageCircle size={24} /></a>
              </div>
            </div>
          )}

          {step === 'form' && (
            <div className="anim-fade-up">
              <button onClick={() => setStep('detail')} style={{ background: 'none', border: 'none', color: 'var(--mz-royal)', fontWeight: 700, fontSize: '14px', marginBottom: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={18} /> Voltar
              </button>
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Seu próximo carro está aqui.</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>Deixe seu contato para receber o laudo técnico.</p>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input type="hidden" name="vehicleId" value={vehicle.id} />
                <input type="hidden" name="origin" value="PLATFORM_WEB" />
                <input name="name" type="text" placeholder="Nome completo" required className="input-light" />
                <input name="phone" type="tel" placeholder="WhatsApp (DDD)" required className="input-light" />
                {error && <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>{error}</div>}
                <button type="submit" disabled={isPending} className="btn-primary" style={{ width: '100%', padding: '20px', fontSize: '16px' }}>
                  {isPending ? 'Enviando...' : 'Solicitar Proposta'}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }} className="anim-fade-up">
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={48} color="#25D366" />
              </div>
              <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>Recebemos!</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '18px', maxWidth: '320px', margin: '0 auto' }}>Em instantes você receberá o atendimento premium via WhatsApp.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
