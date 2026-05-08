'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle,
  Building2, User, Mail, Phone, MapPin, Database, Car, MessageSquare,
  ShieldCheck, Zap, Globe, Cpu, Instagram, Linkedin, MessageCircle
} from 'lucide-react';

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

const DMS_OPTIONS    = ['AutoCerto', 'Cockpit', 'Revenda Mais', 'Motor21', 'Webmotors', 'Outro', 'Nenhum'];
const FLEET_OPTIONS  = ['Menos de 10 veículos', '10 a 50 veículos', '50 a 200 veículos', 'Mais de 200 veículos'];

// ── Components ───────────────────────────────────────────────

function Field({ icon, label, children, delay = 0 }: { icon: React.ReactNode; label: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0A1931', opacity: 0.9 }}>
        {icon} {label}
      </label>
      {children}
    </motion.div>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  fontSize: '15px',
  fontFamily: 'inherit',
  fontWeight: 700,
  background: 'var(--mz-snow)',
  border: '1.5px solid transparent',
  borderRadius: '12px',
  outline: 'none',
  color: '#0A1931',
  boxSizing: 'border-box',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

// ── Main Page ────────────────────────────────────────────────

export function SejaParceiroClient() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    empresa: '', responsavel: '', cargo: '',
    email: '', telefone: '', cidade: '', estado: '',
    dms: '', frota: '', mensagem: '',
  });

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text =
      `Olá! Tenho interesse em ser parceiro da Motorz.\n\n` +
      `🏢 Empresa: ${form.empresa}\n` +
      `👤 Responsável: ${form.responsavel}${form.cargo ? ` (${form.cargo})` : ''}\n` +
      `📧 Email: ${form.email}\n` +
      `📱 WhatsApp: ${form.telefone}\n` +
      `📍 Localização: ${form.cidade}, ${form.estado}\n` +
      `💻 DMS utilizado: ${form.dms || 'Não informado'}\n` +
      `🚗 Frota atual: ${form.frota || 'Não informado'}` +
      (form.mensagem ? `\n\n💬 ${form.mensagem}` : '');

    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank');
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A1931', padding: '24px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', maxWidth: '500px', background: 'white', padding: '60px 40px', borderRadius: '40px' }}
        >
          <div style={{ display: 'inline-flex', padding: '24px', borderRadius: '30px', background: 'rgba(18, 67, 178, 0.05)', marginBottom: '32px' }}>
            <CheckCircle size={56} color="var(--mz-royal)" />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--mz-ink)', marginBottom: '16px', letterSpacing: '-0.04em' }}>Solicitação Enviada!</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '17px', lineHeight: 1.6, marginBottom: '40px' }}>Um consultor entrará em contato em breve para dar início à sua certificação.</p>
          <Link href="/" className="btn-primary" style={{ padding: '16px 40px', borderRadius: '16px', textDecoration: 'none' }}>Voltar ao Início</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A1931', position: 'relative', overflow: 'hidden' }}>
      
      {/* ── Background Elements ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img 
          src="/assets/brand/banners/form.png" 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, filter: 'grayscale(1) brightness(0.6)' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 0% 0%, rgba(18,67,178,0.4), transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0A1931)' }} />
      </div>

      {/* ── Navbar Spacer ── */}
      <div style={{ height: '120px' }} />

      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 24px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '80px', alignItems: 'center' }}>
          
          {/* ── Left Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '48px' }}>
              <ArrowLeft size={16} /> VOLTAR PARA MOTORZ
            </Link>

            <h1 style={{ fontSize: 'clamp(48px, 6vw, 84px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.06em', color: 'white', marginBottom: '40px' }}>
              Vamos construir<br />
              algo <span style={{ color: 'var(--motorz-gold)' }}>grande</span> juntos.
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '60px' }}>
              {[
                { icon: <Mail size={20} />, label: 'E-mail Comercial', val: 'parceiros@motorz.com.br' },
                { icon: <Phone size={20} />, label: 'Central de Cadastro', val: '+55 (11) 99999-9999' },
                { icon: <MapPin size={20} />, label: 'Base Operacional', val: 'São Paulo, SP - Brasil' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--motorz-gold)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: '17px', fontWeight: 600, color: 'white', margin: 0 }}>{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '80px' }}>
              {[<Instagram key="i" />, <Linkedin key="l" />, <MessageCircle key="w" />].map((icon, i) => (
                <a key={i} href="#" style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                  {icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* ── Right Content: The White Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ 
              background: 'white', 
              padding: '60px 48px', 
              borderRadius: '40px', 
              boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0A1931', letterSpacing: '-0.04em', marginBottom: '24px' }}>
                Solicitar Credenciamento
              </h2>
              
              {/* Benefits Section: Clean & Subtle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { icon: <Zap size={14} />, text: 'Visibilidade Premium' },
                  { icon: <Cpu size={14} />, text: 'Sincronização 24h' },
                  { icon: <CheckCircle size={14} />, text: 'Leads Qualificados' },
                  { icon: <ShieldCheck size={14} />, text: 'Selo de Confiança' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: 'var(--mz-snow)', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <div style={{ color: 'var(--mz-royal)', display: 'flex' }}>{b.icon}</div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0A1931', opacity: 0.8 }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Field icon={<Building2 size={14} />} label="Nome da Empresa" delay={0.3}>
                <input name="empresa" value={form.empresa} onChange={handle} required placeholder="Ex: Auto Premium" style={INPUT_STYLE} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field icon={<User size={14} />} label="Responsável" delay={0.4}>
                  <input name="responsavel" value={form.responsavel} onChange={handle} required placeholder="Seu nome" style={INPUT_STYLE} />
                </Field>
                <Field icon={<Phone size={14} />} label="WhatsApp" delay={0.5}>
                  <input name="telefone" type="tel" value={form.telefone} onChange={handle} required placeholder="(00) 00000-0000" style={INPUT_STYLE} />
                </Field>
              </div>

              <Field icon={<Mail size={14} />} label="E-mail Profissional" delay={0.6}>
                <input name="email" type="email" value={form.email} onChange={handle} required placeholder="email@empresa.com.br" style={INPUT_STYLE} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field icon={<MapPin size={14} />} label="Cidade / UF" delay={0.7}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input name="cidade" value={form.cidade} onChange={handle} required placeholder="Sua cidade" style={INPUT_STYLE} />
                    <select name="estado" value={form.estado} onChange={handle} required style={{ ...INPUT_STYLE, width: '80px', padding: '14px 8px' }}>
                      <option value="">UF</option>
                      {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </Field>
                <Field icon={<Database size={14} />} label="Sistema Atual" delay={0.8}>
                  <select name="dms" value={form.dms} onChange={handle} style={INPUT_STYLE}>
                    <option value="">Selecione...</option>
                    {DMS_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>

              <Field icon={<MessageSquare size={14} />} label="Conte-nos sua necessidade" delay={0.9}>
                <textarea
                  name="mensagem"
                  value={form.mensagem}
                  onChange={handle}
                  rows={2}
                  placeholder="Descreva brevemente seu objetivo..."
                  style={{ ...INPUT_STYLE, resize: 'none' }}
                />
              </Field>

              <button
                type="submit"
                className="btn-primary"
                style={{ 
                  marginTop: '12px',
                  width: '100%', 
                  height: '64px',
                  fontSize: '17px', 
                  fontWeight: 900, 
                  borderRadius: '18px', 
                  background: 'var(--mz-royal)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 20px 40px rgba(18, 67, 178, 0.3)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>Enviar Solicitação de Parceria</span>
                <ArrowRight size={22} style={{ opacity: 0.8 }} />
              </button>
            </form>
          </motion.div>

        </div>
      </main>

      <style jsx global>{`
        input::placeholder, textarea::placeholder {
          color: rgba(10, 25, 49, 0.4) !important;
          font-weight: 600 !important;
        }
        input:focus, select:focus, textarea:focus {
          background: white !important;
          border-color: var(--mz-royal) !important;
          box-shadow: 0 0 0 4px rgba(18, 67, 178, 0.08);
        }
      `}</style>
    </div>
  );
}
