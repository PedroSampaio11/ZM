'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';

type Message = {
  id: string;
  role: 'bot' | 'user';
  text: React.ReactNode;
};

const FAQ_LIST = [
  {
    id: 'q1',
    q: 'O que é uma Auto-Tech?',
    a: 'Diferente de um portal de anúncios, uma Auto-Tech como a Motorz usa tecnologia para gerenciar o próprio estoque certificado. Nós controlamos toda a jornada para garantir que você compre direto da fonte, com segurança e preço justo.'
  },
  {
    id: 'q2',
    q: 'O estoque é realmente próprio?',
    a: 'Sim! Todos os veículos que você vê no nosso catálogo passaram pela nossa curadoria e vistoria. Nós somos os responsáveis pela procedência e qualidade de cada unidade disponível.'
  },
  {
    id: 'q3',
    q: 'Como funcionam os Hubs físicos?',
    a: 'Nossos Hubs são pontos estratégicos no ABC onde nossos veículos ficam expostos. Você escolhe o carro online e agenda uma visita ao Hub mais próximo para conhecer o veículo e fazer o test-drive.'
  },
  {
    id: 'q4',
    q: 'Como agendar um test-drive?',
    a: 'É super simples! Você pode agendar diretamente pelo site no botão de interesse do veículo ou falar com um de nossos consultores agora mesmo. O carro estará te esperando no Hub escolhido.'
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
      {/* Floating Button — Pro Max UI */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: nearFooter ? 0 : 1, opacity: nearFooter ? 1 : 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.1 
          }}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)',
            right: '24px',
            zIndex: 9998,
          }}
        >
          {/* Pulsing Glow Ring */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              right: '-8px',
              bottom: '-8px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--motorz-gold) 0%, transparent 70%)',
              zIndex: -1,
            }}
          />

          <motion.button
            onClick={() => !nearFooter && setIsOpen(true)}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)',
              right: '24px',
              height: '52px',
              padding: '0 24px',
              borderRadius: '26px',
              background: 'var(--mz-ink)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: nearFooter ? 'default' : 'pointer',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              zIndex: 9998,
              pointerEvents: nearFooter ? 'none' : 'auto',
            }}
          >


            <Sparkles size={20} color="white" />
            
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              fontFamily: 'Cal Sans, sans-serif',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap'
            }}>
              MOTORZ IA
            </span>

            {/* Subtle light streak */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '20%',
              width: '1px',
              height: '100%',
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)',
              transform: 'skewX(-20deg)'
            }} />
          </motion.button>
        </motion.div>
      )}

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
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header — Pro Max Gradient */}
            <div style={{ 
              padding: '24px 20px', 
              background: 'linear-gradient(135deg, var(--mz-ink) 0%, #1e293b 100%)', 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative'
            }}>
              {/* Header Glow */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '14px', 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                }}>
                  <Sparkles size={20} color="var(--motorz-gold)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, fontFamily: 'Cal Sans, sans-serif', letterSpacing: '-0.01em' }}>ZM</h3>
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
                      <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
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
