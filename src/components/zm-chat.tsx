'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, MessageSquare } from 'lucide-react';

type Message = {
  id: string;
  role: 'bot' | 'user';
  text: React.ReactNode;
};

const FAQ_LIST = [
  {
    id: 'q1',
    q: 'Por que a Motorz é diferente?',
    a: 'Não somos apenas um portal de anúncios. Somos a infraestrutura tecnológica que conecta o estoque real das lojas ao cliente qualificado, eliminando os anúncios fantasmas e fraudes.'
  },
  {
    id: 'q2',
    q: 'Como sei se o carro está mesmo disponível?',
    a: 'Nossa tecnologia sincroniza em tempo real com o sistema dos lojistas parceiros. Se você está vendo o carro aqui, ele está disponível no pátio da loja.'
  },
  {
    id: 'q3',
    q: 'Os lojistas são de confiança?',
    a: 'Absolutamente. Apenas lojas que passam por nossa rigorosa auditoria podem anunciar. Dados, histórico e preços são validados pela nossa equipe para garantir sua segurança.'
  },
  {
    id: 'q4',
    q: 'Quanto custa usar a plataforma?',
    a: 'Para você, comprador, é 100% gratuito! Nossa plataforma apenas facilita e acelera sua conexão direta com a loja, sem adicionar nenhuma taxa ao valor do veículo.'
  }
];

export function ZmChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'bot', text: 'Olá! Sou a ZM, inteligência da Motorz. Como posso te ajudar hoje?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide FAB when footer is visible
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearFooter(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Filter out FAQs that have already been asked
  const askedQuestions = messages.filter(m => m.role === 'user').map(m => m.text);
  const availableFaqs = FAQ_LIST.filter(f => !askedQuestions.includes(f.q));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleAsk = (faq: typeof FAQ_LIST[0]) => {
    // Add user message
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: faq.q }]);
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: 'bot', text: faq.a }]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button — hides near footer */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: nearFooter ? 0 : 1, opacity: nearFooter ? 0 : 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => !nearFooter && setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '64px',
          height: '64px',
          borderRadius: '32px',
          background: 'var(--mz-ink)',
          color: 'white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: nearFooter ? 'default' : 'pointer',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.25)',
          zIndex: 9999,
          pointerEvents: nearFooter ? 'none' : 'auto',
        }}
        whileHover={nearFooter ? {} : { scale: 1.05 }}
        whileTap={nearFooter ? {} : { scale: 0.95 }}
      >
        <Sparkles size={26} color="var(--motorz-gold)" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: '110px',
              right: '32px',
              width: 'calc(100vw - 64px)',
              maxWidth: '380px',
              height: '560px',
              maxHeight: '75vh',
              background: 'var(--mz-snow)',
              borderRadius: '24px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px', background: 'var(--mz-ink)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="var(--motorz-gold)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, fontFamily: 'Cal Sans, sans-serif' }}>ZM</h3>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                    Online agora
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.6, padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ padding: '20px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#F8FAFC' }}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? 'var(--mz-royal)' : 'white',
                    color: m.role === 'user' ? 'white' : 'var(--mz-ink)',
                    padding: '14px 18px',
                    borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: m.role === 'bot' ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {m.text}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'white',
                    padding: '14px 18px',
                    borderRadius: '20px 20px 20px 4px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} style={{ width: '6px', height: '6px', background: '#518CEE', borderRadius: '50%' }} />
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', background: '#518CEE', borderRadius: '50%' }} />
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', background: '#518CEE', borderRadius: '50%' }} />
                </motion.div>
              )}

              {/* FAQ Suggestions */}
              {!isTyping && availableFaqs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--mz-slate-dim)', margin: '0 0 4px 4px', fontWeight: 600 }}>Sugestões de perguntas:</p>
                  {availableFaqs.map(faq => (
                    <button
                      key={faq.id}
                      onClick={() => handleAsk(faq)}
                      style={{
                        background: 'white',
                        border: '1px solid var(--mz-royal)',
                        color: 'var(--mz-royal)',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--mz-royal)'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--mz-royal)'; }}
                    >
                      {faq.q}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'white' }}>
              <div style={{ background: '#F1F5F9', padding: '14px 16px', borderRadius: '100px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--mz-slate-dim)', fontSize: '14px', cursor: 'not-allowed' }}>
                <MessageSquare size={18} />
                <span>Escolha uma pergunta acima...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
