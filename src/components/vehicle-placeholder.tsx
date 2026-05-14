import { cn } from '@/lib/utils'

interface VehiclePlaceholderProps {
  brand: string
  model: string
  className?: string
}

export function VehiclePlaceholder({ brand, className }: VehiclePlaceholderProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center overflow-hidden bg-[#0c0c11]',
        className
      )}
    >
      {/* Radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 58%, rgba(45,91,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Brand watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 select-none text-center font-black uppercase leading-none text-white/[0.035]"
        style={{ fontSize: 'clamp(52px, 14vw, 120px)', letterSpacing: '-0.03em' }}
      >
        {brand}
      </span>

      {/* Car silhouette */}
      <div className="relative z-10 w-[72%] max-w-[340px] text-zinc-600">
        <CarSilhouette />
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[#0c0c11]/90 to-transparent"
      />

      {/* "Fotos em breve" badge */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-motorz-gold" />
        <span className="text-[9px] font-semibold uppercase tracking-widest text-white/40">
          Fotos em breve
        </span>
      </div>

      {/* Motorz mark */}
      <span
        aria-hidden
        className="absolute bottom-3.5 right-3.5 z-20 select-none text-[9px] font-black uppercase tracking-[0.15em] text-white/[0.14]"
      >
        motorz
      </span>
    </div>
  )
}

function CarSilhouette() {
  return (
    <svg
      viewBox="0 0 360 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-hidden
    >
      {/* Ground shadow */}
      <ellipse cx="181" cy="122" rx="138" ry="6" fill="currentColor" opacity="0.08" />

      {/* Lower body */}
      <path
        d="M38 90 Q32 90 30 84 L30 76 Q30 70 36 68 L58 66 L302 66 L308 68 Q314 70 314 76 L314 84 Q312 90 306 90 Z"
        fill="currentColor"
        opacity="0.22"
      />

      {/* Upper cabin */}
      <path
        d="M93 44 Q102 22 126 18 L246 18 Q274 18 289 40 L298 62 L62 62 Z"
        fill="currentColor"
        opacity="0.16"
      />

      {/* Front glass */}
      <path d="M130 20 L108 60 L172 60 L172 18 Z" fill="currentColor" opacity="0.13" />

      {/* Rear glass */}
      <path
        d="M176 18 L176 60 L248 60 L278 42 Q264 20 246 18 Z"
        fill="currentColor"
        opacity="0.13"
      />

      {/* Pillar divider */}
      <line
        x1="172"
        y1="18"
        x2="176"
        y2="60"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.18"
      />

      {/* Rear wheel */}
      <circle cx="90" cy="92" r="21" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.30" />
      <circle cx="90" cy="92" r="8" fill="currentColor" opacity="0.14" />
      <circle cx="90" cy="92" r="2" fill="currentColor" opacity="0.25" />

      {/* Front wheel */}
      <circle cx="278" cy="92" r="21" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.30" />
      <circle cx="278" cy="92" r="8" fill="currentColor" opacity="0.14" />
      <circle cx="278" cy="92" r="2" fill="currentColor" opacity="0.25" />

      {/* Headlight */}
      <path d="M305 70 L316 73 L315 80 L305 79 Z" fill="currentColor" opacity="0.40" />

      {/* Taillight */}
      <path d="M39 70 L28 73 L28 80 L39 79 Z" fill="currentColor" opacity="0.40" />
    </svg>
  )
}
