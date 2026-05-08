'use client';

import { useState, useEffect } from 'react';

export function LiveTimeBadge() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: "qui, 07/05, 20:53"
      const formatter = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      let formatted = formatter.format(now);
      formatted = formatted.replace('.', ''); // removes dot from 'qui.' if present
      setTimeStr(formatted);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeStr) return null; // Hydration safe

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px 6px 8px',
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '100px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      fontFamily: 'var(--font-onest), sans-serif',
      fontSize: '15px',
      fontWeight: 700,
      color: 'var(--mz-slate)',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '22px',
        height: '22px',
        background: 'rgba(255, 193, 7, 0.2)',
        borderRadius: '50%'
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          background: 'var(--motorz-gold)',
          borderRadius: '50%',
          position: 'relative',
          zIndex: 2
        }} />
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--motorz-gold)',
            borderRadius: '50%',
            opacity: 0.4,
            animation: 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite'
          }} 
        />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}} />
      <span>{timeStr}</span>
    </div>
  );
}
