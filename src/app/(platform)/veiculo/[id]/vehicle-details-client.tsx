'use client';

import { useState } from 'react';
import { Vehicle } from '@/modules/inventory/types';
import { LeadBottomSheet } from '@/components/lead-bottom-sheet';
import { ShieldCheck, Calendar, Zap, Droplet, Cog, MapPin, CheckCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  vehicle: Vehicle & { partner: { name: string; city: string; state: string } };
  isFeatured: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
}

function formatMileage(km: number) {
  if (km === 0) return '0 km';
  if (km >= 1000) return `${(km / 1000).toFixed(1).replace('.0', '')}k km`;
  return `${km} km`;
}

const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
  CVT: 'CVT',
  SEMI_AUTOMATIC: 'Semi-auto',
};

export function VehicleDetailsClient({ vehicle, isFeatured }: Props) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = vehicle.images && vehicle.images.length > 0 
    ? vehicle.images 
    : ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200'];

  return (
    <div className={`platform-container pb-24 ${isFeatured ? 'featured-product-theme' : ''}`}>
      {/* ── BREADCRUMBS ── */}
      <div className="pt-24 pb-6 px-6 max-w-7xl mx-auto relative z-20">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mz-slate-dim mb-4">
          <Link href="/" className="hover:text-mz-royal transition-colors">Home</Link>
          <span className="opacity-30">/</span>
          <Link href="/#estoque" className="hover:text-mz-royal transition-colors">Estoque</Link>
          <span className="opacity-30">/</span>
          <span className="text-mz-royal">{vehicle.brand} {vehicle.model}</span>
        </nav>
        
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-mz-slate hover:text-mz-royal transition-all font-semibold group text-sm">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Voltar
          </Link>
          {isFeatured && (
            <div className="special-badge" style={{ position: 'relative', top: 'auto', right: 'auto', transform: 'none' }}>
              DESTAQUE MOTORZ
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── LEFT: GALLERY ── */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`rounded-3xl overflow-hidden aspect-[16/10] relative shadow-lg ${isFeatured ? 'ring-2 ring-motorz-gold ring-offset-4 ring-offset-mz-snow' : ''}`}>
            <Image
              src={images[activeImage]}
              alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
              unoptimized={!images[activeImage].includes('unsplash.com') && !images[activeImage].includes('supabase.co')}
            />
            {/* Featured Overlay */}
            {isFeatured && (
              <div className="absolute inset-0 bg-gradient-to-t from-motorz-carbon/40 to-transparent pointer-events-none" />
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? (isFeatured ? 'border-motorz-gold opacity-100' : 'border-mz-royal opacity-100') : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img} alt={`Foto ${idx + 1}`} fill sizes="96px" className="object-cover" unoptimized={!img.includes('unsplash.com') && !img.includes('supabase.co')} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: INFO & CONVERSION ── */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-black uppercase tracking-widest text-mz-slate-dim">
                {vehicle.brand}
              </span>
              <span className="px-3 py-1 rounded-full bg-mz-frost text-xs font-bold border border-border">
                {vehicle.year}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display leading-[1.1] mb-4 text-mz-ink">
              {vehicle.model}
            </h1>
            
            {vehicle.version && (
              <p className="text-lg text-mz-slate font-medium leading-relaxed">
                {vehicle.version}
              </p>
            )}
          </div>

          <div className={`mb-10 p-8 rounded-[32px] border shadow-xl flex flex-col items-start gap-2 relative overflow-hidden transition-all hover:shadow-2xl ${isFeatured ? 'border-motorz-gold/30 bg-motorz-carbon text-white' : 'border-border bg-white'}`}>
            {isFeatured && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 bg-motorz-gold opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <p className="text-xs font-black text-motorz-gold tracking-widest uppercase mb-1">Oferta Exclusiva</p>
              </>
            )}
            {!isFeatured && (
              <p className="text-xs font-black text-mz-slate-dim tracking-widest uppercase">Preço Motorz</p>
            )}
            
            <div className={`text-5xl font-black tracking-tight ${isFeatured ? 'text-white' : 'text-mz-ink'}`}>
              {formatCurrency(vehicle.price)}
            </div>

            <button 
              onClick={() => setIsSheetOpen(true)}
              className={`mt-8 w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${isFeatured ? 'btn-premium-gold' : 'btn-primary'}`}
            >
              <MessageCircle size={22} />
              Tenho Interesse
            </button>
            
            <p className={`mt-4 text-xs font-medium text-center w-full opacity-60 ${isFeatured ? 'text-white' : 'text-mz-slate'}`}>
              * Sujeito a análise de crédito e disponibilidade em estoque.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-mz-frost border border-border flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isFeatured ? 'bg-motorz-gold/10 text-motorz-gold' : 'bg-mz-royal/10 text-mz-royal'}`}>
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-mz-slate-dim uppercase tracking-wider">Quilometragem</p>
                <p className="font-bold text-mz-ink">{formatMileage(vehicle.mileage)}</p>
              </div>
            </div>
            
            {vehicle.transmission && (
              <div className="p-4 rounded-2xl bg-mz-frost border border-border flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isFeatured ? 'bg-motorz-gold/10 text-motorz-gold' : 'bg-mz-royal/10 text-mz-royal'}`}>
                  <Cog size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-mz-slate-dim uppercase tracking-wider">Câmbio</p>
                  <p className="font-bold text-mz-ink">{TRANSMISSION_LABELS[vehicle.transmission] || vehicle.transmission}</p>
                </div>
              </div>
            )}

            {vehicle.fuel && (
              <div className="p-4 rounded-2xl bg-mz-frost border border-border flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isFeatured ? 'bg-motorz-gold/10 text-motorz-gold' : 'bg-mz-royal/10 text-mz-royal'}`}>
                  <Droplet size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-mz-slate-dim uppercase tracking-wider">Combustível</p>
                  <p className="font-bold text-mz-ink">{vehicle.fuel}</p>
                </div>
              </div>
            )}
            
            {vehicle.color && (
              <div className="p-4 rounded-2xl bg-mz-frost border border-border flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isFeatured ? 'bg-motorz-gold/10 text-motorz-gold' : 'bg-mz-royal/10 text-mz-royal'}`}>
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: vehicle.color.toLowerCase() === 'branco' ? '#fff' : vehicle.color.toLowerCase() === 'preto' ? '#000' : vehicle.color.toLowerCase() === 'prata' ? '#ccc' : vehicle.color.toLowerCase() }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-mz-slate-dim uppercase tracking-wider">Cor</p>
                  <p className="font-bold text-mz-ink capitalize">{vehicle.color}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-mz-frost border border-border mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className={isFeatured ? 'text-motorz-gold' : 'text-mz-royal'} />
              Vendido e Entregue por
            </h3>
            <p className="font-display text-2xl mb-2">{vehicle.partner.name}</p>
            <p className="text-mz-slate flex items-center gap-2 font-medium">
              <MapPin size={16} /> {vehicle.partner.city}, {vehicle.partner.state}
            </p>
          </div>
          
          {vehicle.description && (
             <div>
                <h3 className="text-xl font-display mb-4">Sobre o Veículo</h3>
                <p className="text-mz-slate leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
             </div>
          )}
        </div>
      </div>

      {/* ── STICKY MOBILE ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-border z-50 lg:hidden flex items-center justify-between gap-4">
        <div>
           <p className="text-[10px] font-black text-mz-slate-dim uppercase tracking-wider">Preço</p>
           <p className="text-xl font-black text-mz-ink">{formatCurrency(vehicle.price)}</p>
        </div>
        <button 
          onClick={() => setIsSheetOpen(true)}
          className={`flex-grow py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 ${isFeatured ? 'btn-premium-gold' : 'btn-primary'}`}
        >
          <MessageCircle size={20} /> Contato
        </button>
      </div>

      <LeadBottomSheet
        vehicle={vehicle}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
