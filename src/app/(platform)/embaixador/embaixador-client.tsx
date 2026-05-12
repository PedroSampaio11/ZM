'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Building2, Zap, TrendingUp, Star, ArrowRight, MessageCircle, MapPin, Globe, Phone, Mail, User } from 'lucide-react';

// ── Seeded stats para MVP ────────────────────────────────────────────────────
const STATS = [
  { value: '47+',      label: 'Embaixadores ativos' },
  { value: 'R$ 8.4k',  label: 'Comissão média/mês' },
  { value: '12',       label: 'Hubs em operação' },
  { value: '98%',      label: 'Satisfação dos parceiros' },
];

const AMBASSADOR_BENEFITS = [
  { icon: <TrendingUp size={20} />, title: 'Comissão por indicação', desc: 'Ganhe por cada negócio fechado que você indicar. Sem teto.' },
  { icon: <Star size={20} />,       title: 'Material exclusivo',      desc: 'Kit de divulgação, banners, links rastreados e suporte da equipe.' },
  { icon: <Globe size={20} />,      title: 'Trabalhe de onde quiser', desc: 'Indique pelo WhatsApp, Instagram, TikTok ou onde sua audiência estiver.' },
  { icon: <Zap size={20} />,        title: 'Pagamento rápido',        desc: 'Comissão paga em até 5 dias após o fechamento do negócio.' },
];

const HUB_BENEFITS = [
  { icon: <Building2 size={20} />,  title: 'Marca estabelecida',      desc: 'Opere sob a marca Motorz com toda a credibilidade e tecnologia da plataforma.' },
  { icon: <TrendingUp size={20} />, title: 'Leads qualificados',       desc: 'Receba leads do site Motorz diretamente para o seu estabelecimento.' },
  { icon: <Star size={20} />,       title: 'Suporte completo',         desc: 'Treinamento, sistema de gestão e suporte da equipe Motorz.' },
  { icon: <Users size={20} />,      title: 'Rede colaborativa',        desc: 'Faça parte da rede de Hubs e compartilhe estoque com outros parceiros.' },
];

type Path = 'ambassador' | 'hub';

const INPUT = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: '100%', padding: '13px 16px', fontSize: '14px', fontFamily: 'inherit', fontWeight: 600,
  background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '12px',
  outline: 'none', color: 'white', boxSizing: 'border-box', transition: 'border-color 0.2s',
  ...extra,
});

export function EmbaixadorClient() {
  const [path, setPath]         = useState<Path>('ambassador');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cidade: '', instagram: '', frota: '', mensagem: '' });

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const tipo  = path === 'ambassador' ? 'Embaixador Digital' : 'Hub Motorz';
    const extra = path === 'ambassador'
      ? `📱 Instagram/TikTok: ${form.instagram || 'Não informado'}`
      : `🏢 Frota estimada: ${form.frota || 'Não informado'}`;
    const text =
      `Olá! Quero me tornar ${path === 'ambassador' ? 'um Embaixador' : 'um Hub'} Motorz.\n\n` +
      `📌 Tipo: ${tipo}\n` +
      `👤 Nome: ${form.nome}\n` +
      `📧 Email: ${form.email}\n` +
      `📱 WhatsApp: ${form.telefone}\n` +
      `📍 Cidade: ${form.cidade}\n` +
      `${extra}` +
      (form.mensagem ? `\n\n💬 ${form.mensagem}` : '');
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank');
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A1931', padding: '24px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: '480px', background: 'white', padding: '56px 40px', borderRadius: '32px' }}
        >
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(18,67,178,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <CheckCircle size={36} color="#1243B2" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0A1931', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Solicitação enviada!</h1>
          <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.6, margin: '0 0 36px' }}>
            Nossa equipe entrará em contato em até 24 horas para avançar com a sua candidatura.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', background: '#1243B2', color: 'white', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
            Voltar ao início <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  const benefits = path === 'ambassador' ? AMBASSADOR_BENEFITS : HUB_BENEFITS;

  return (
    <div style={{ minHeight: '100vh', background: '#0A1931', position: 'relative', overflow: 'hidden' }}>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(18,67,178,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '0', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 48px) 80px', position: 'relative', zIndex: 1 }}>

        {/* Back */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '48px' }}>
          ← Voltar
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: '64px', maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.2)', marginBottom: '24px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFC107', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFC107', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Programa de Parceiros</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 20px' }}>
            Faça parte da<br /><span style={{ color: '#FFC107' }}>revolução</span> automotiva
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>
            Seja um Embaixador que divulga e ganha comissão, ou abra um Hub físico Motorz na sua cidade. Duas formas de crescer conosco.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '72px' }}
        >
          {STATS.map(s => (
            <div key={s.label} style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <p style={{ fontSize: '26px', fontWeight: 900, color: '#FFC107', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Path selector */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Escolha seu caminho</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '560px' }}>
            {[
              { id: 'ambassador' as Path, icon: <Users size={22} />, title: 'Embaixador Digital', desc: 'Divulgue e ganhe comissão' },
              { id: 'hub' as Path,        icon: <Building2 size={22} />, title: 'Hub Motorz', desc: 'Seja um ponto físico' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setPath(opt.id)} style={{
                padding: '20px', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                background: path === opt.id ? 'rgba(18,67,178,0.25)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${path === opt.id ? 'rgba(18,67,178,0.6)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ color: path === opt.id ? '#5B8DEF' : 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>{opt.icon}</div>
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'white', margin: '0 0 4px' }}>{opt.title}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'clamp(280px, 45%, 480px) 1fr', gap: '48px', alignItems: 'start' }}>

          {/* Benefits */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>
              {path === 'ambassador' ? 'Como Embaixador você tem' : 'Como Hub você tem'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
              {benefits.map(b => (
                <motion.div key={b.title} layout style={{ display: 'flex', gap: '14px', padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#FFC107', flexShrink: 0, marginTop: '2px' }}>{b.icon}</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: 'white', margin: '0 0 4px' }}>{b.title}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial seeded */}
            <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,193,7,0.06)', border: '1px solid rgba(255,193,7,0.15)' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 12px' }}>
                {path === 'ambassador'
                  ? '"Em 3 meses como embaixador já fechei 7 negócios. A plataforma passa credibilidade e os leads chegam naturalmente."'
                  : '"Abrimos o Hub em Santo André e em 60 dias já tínhamos fluxo de clientes vindo direto do site. A marca Motorz abre portas."'
                }
              </p>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#FFC107', margin: 0 }}>
                {path === 'ambassador' ? '— Rafael M., Embaixador Motorz desde 2025' : '— Anderson L., Hub Motorz Santo André'}
              </p>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: 'clamp(24px, 4vw, 36px)' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: path === 'ambassador' ? '#5B8DEF' : '#FFC107', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>
              {path === 'ambassador' ? 'Candidatura — Embaixador' : 'Candidatura — Hub'}
            </p>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: '0 0 28px', letterSpacing: '-0.01em' }}>
              {path === 'ambassador' ? 'Quero divulgar a Motorz' : 'Quero abrir um Hub'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <User size={11} /> Nome
                  </label>
                  <input name="nome" required value={form.nome} onChange={handle} placeholder="Seu nome" style={INPUT()} onFocus={e => e.target.style.borderColor = 'rgba(18,67,178,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Phone size={11} /> WhatsApp
                  </label>
                  <input name="telefone" required value={form.telefone} onChange={handle} placeholder="(11) 99999-9999" style={INPUT()} onFocus={e => e.target.style.borderColor = 'rgba(18,67,178,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Mail size={11} /> E-mail
                </label>
                <input name="email" type="email" required value={form.email} onChange={handle} placeholder="seu@email.com" style={INPUT()} onFocus={e => e.target.style.borderColor = 'rgba(18,67,178,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <MapPin size={11} /> Cidade
                </label>
                <input name="cidade" required value={form.cidade} onChange={handle} placeholder="Sua cidade" style={INPUT()} onFocus={e => e.target.style.borderColor = 'rgba(18,67,178,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {path === 'ambassador' ? (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Globe size={11} /> Instagram / TikTok
                  </label>
                  <input name="instagram" value={form.instagram} onChange={handle} placeholder="@seuarroba" style={INPUT()} onFocus={e => e.target.style.borderColor = 'rgba(18,67,178,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Building2 size={11} /> Quantos carros você negocia/mês?
                  </label>
                  <input name="frota" value={form.frota} onChange={handle} placeholder="Ex: 10–20 carros" style={INPUT()} onFocus={e => e.target.style.borderColor = 'rgba(18,67,178,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              )}

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' }}>
                  Mensagem (opcional)
                </label>
                <textarea name="mensagem" value={form.mensagem} onChange={handle} rows={3} placeholder="Conte um pouco sobre você..." style={{ ...INPUT(), resize: 'none' }} onFocus={e => e.target.style.borderColor = 'rgba(18,67,178,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              <button type="submit" style={{ marginTop: '8px', padding: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: path === 'ambassador' ? '#1243B2' : '#FFC107', color: path === 'ambassador' ? 'white' : '#0A1931', transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                <MessageCircle size={18} />
                Enviar candidatura pelo WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
