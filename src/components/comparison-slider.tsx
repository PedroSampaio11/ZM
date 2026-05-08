import { useState, useRef, useEffect } from 'react';

export function ComparisonSlider({ beforeImage, afterImage }: { beforeImage: string, afterImage: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="comparison-slider"
      style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '16/9', 
        overflow: 'hidden', 
        borderRadius: '24px', 
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: 'var(--shadow-xl)',
        background: '#0F172A',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
    >
      {/* Before Image (Background) */}
      <img 
        src={beforeImage} 
        alt="Procurando sem a Motorz" 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
        draggable={false} 
      />
      
      {/* Label Before */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, backdropFilter: 'blur(8px)' }}>
        Procurando carro sozinho
      </div>
      
      {/* After Image (Foreground, clipped) */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
        <img 
          src={afterImage} 
          alt="Com a Motorz" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
          draggable={false} 
        />
        {/* Label After */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'white', color: 'var(--mz-ink)', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, boxShadow: 'var(--shadow-md)' }}>
          Com a Motorz
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          left: `${sliderPosition}%`, 
          width: '2px', 
          background: 'white', 
          transform: 'translateX(-50%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(255,255,255,0.5)'
        }}
      >
        <div style={{ 
          width: '48px', 
          height: '48px', 
          background: 'white', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          color: 'var(--mz-ink)'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
            <path d="M9 18l6-6-6-6" style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }}/>
          </svg>
        </div>
      </div>
    </div>
  );
}
