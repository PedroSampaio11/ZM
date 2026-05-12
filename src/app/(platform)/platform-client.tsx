'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleCard } from '@/components/vehicle-card';
import { LeadBottomSheet } from '@/components/lead-bottom-sheet';
import {
  ShieldCheck, Search, Mouse, Shield, Star,
  Cloud, Zap, MessageSquare, Cpu, LayoutGrid, Database, Car, Globe, Heart, MapPin, Bell
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { ComparisonSlider } from '@/components/comparison-slider';
import { LiveTimeBadge } from '@/components/live-time-badge';
import { ZmChat } from '@/components/zm-chat';
import { LiveActivity } from '@/components/live-activity';

// ── Padronizado: eyebrow de seção ────────────────────────────
function SectionEyebrow({ label, dark = false }: { label: string; dark?: boolean }) {
  const color = dark ? 'rgba(255,255,255,0.45)' : 'var(--mz-ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
      <div style={{ width: '28px', height: '1px', background: color, opacity: 0.4 }} />
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color, opacity: 0.6 }}>{label}</span>
    </div>
  );
}

// ── Componente de Círculo Animado (Pencil Circling Effect) ──
function RoughCircle({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', padding: '0 10px' }}>
      <motion.svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-5%',
          width: '110%',
          height: '130%',
          fill: 'none',
          pointerEvents: 'none',
          zIndex: 0,
          transform: 'rotate(-1.5deg)'
        }}
      >
        <motion.path
          d="M 10,50 C 10,25 25,10 50,10 C 75,10 90,25 90,50 C 90,75 75,90 50,90 C 25,90 10,75 10,50 C 10,35 15,20 35,15"
          stroke="var(--mz-royal)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1],
            opacity: [0, 0.4, 0.4, 0]
          }}
          transition={{ 
            duration: 3, 
            times: [0, 0.4, 0.8, 1],
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1
          }}
        />
      </motion.svg>
      <span style={{ position: 'relative', zIndex: 1, fontWeight: 900, color: 'var(--mz-royal)' }}>{children}</span>
    </span>
  );
}

// ── Componente Interativo de Hubs (Cursor Follow) ───────────
function HubHoverList() {
  const [hoveredHub, setHoveredHub] = useState<number | null>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const hubs = [
    { name: 'São Bernardo', count: '5 Hubs' },
    { name: 'Santo André', count: '4 Hubs' },
    { name: 'São Caetano', count: '2 Hubs' },
    { name: 'Mauá', count: '2 Hubs' },
    { name: 'Ribeirão Pires', count: '1 Hub' },
    { name: 'Diadema & Rio G. da Serra', count: 'Expansão' },
    { name: 'Suzano', count: 'Expansão' },
  ];

  // Contornos REAIS de mapas estilizados para cada região (Extraídos do OpenStreetMap/Nominatim)
  const mapPaths = [
    "M12.87,27.52 L18.98,56.94 L21.45,66.12 L23.74,72.76 L24.25,78.12 L26.26,80.79 L25.27,83.59 L26.16,86.19 L24.59,88.96 L24.54,90.61 L26.73,93.10 L26.67,96.50 L26.19,99.06 L27.62,99.37 L33.24,97.73 L37.52,95.66 L43.07,91.40 L47.00,87.32 L49.28,86.13 L53.17,82.76 L53.63,80.87 L59.35,80.06 L61.80,77.70 L63.00,75.09 L64.33,74.27 L65.87,73.57 L67.64,71.92 L69.41,70.27 L69.34,68.49 L70.28,67.23 L72.24,69.01 L72.63,66.68 L74.41,64.63 L78.91,61.76 L78.60,58.80 L77.85,57.16 L82.98,55.80 L84.38,55.73 L86.49,56.12 L85.09,53.35 L81.78,52.33 L79.79,49.00 L78.07,48.99 L71.40,43.72 L69.70,42.01 L68.20,40.69 L64.83,37.44 L58.83,31.92 L55.58,32.69 L53.05,33.26 L52.09,32.25 L54.09,30.15 L54.37,26.35 L53.23,22.91 L54.45,19.77 L53.35,18.39 L52.29,18.48 L50.63,19.11 L49.05,17.53 L48.18,16.92 L48.07,15.56 L47.51,14.51 L46.51,13.48 L44.85,13.29 L43.25,13.09 L42.75,11.77 L43.18,10.29 L43.23,8.09 L40.67,4.27 L38.86,2.77 L36.84,2.85 L33.62,0.87 L30.61,3.07 L28.92,3.78 L27.49,4.62 L25.56,5.39 L24.94,7.92 L27.05,8.08 L29.50,6.83 L29.51,7.74 L31.51,11.04 L32.92,10.23 L34.52,9.61 L35.74,9.46 L34.85,10.89 L35.12,11.40 L35.32,12.25 L35.04,13.54 L35.01,14.66 L35.12,15.16 L34.16,15.94 L32.72,17.21 L32.19,18.10 L31.75,19.81 L30.76,20.89 L29.37,21.87 L28.62,23.11 L27.66,23.59 L27.28,24.13 L25.53,28.98 L20.85,29.47 L16.60,27.84 Z", // São Bernardo do Campo
    "M0.00,29.03 L2.11,30.83 L4.90,35.08 L4.86,37.61 L4.35,39.23 L5.07,40.74 L6.77,40.89 L8.68,41.17 L9.73,42.30 L10.36,43.47 L10.49,45.00 L11.47,45.74 L13.29,47.49 L15.14,46.78 L16.33,46.66 L17.60,48.25 L16.25,51.93 L17.43,56.31 L17.06,60.07 L14.75,62.27 L16.14,63.41 L18.90,62.92 L22.75,62.09 L29.74,68.45 L33.37,72.04 L34.80,73.32 L36.88,75.50 L44.39,81.25 L46.30,81.20 L48.76,85.37 L52.26,86.14 L58.90,85.03 L65.75,81.91 L67.29,77.83 L75.63,76.51 L83.63,75.40 L86.93,81.56 L91.24,77.22 L92.95,76.72 L96.63,74.04 L99.92,70.92 L98.34,68.85 L97.75,66.56 L95.74,64.42 L88.72,62.65 L84.88,61.74 L84.94,58.53 L79.65,55.35 L75.16,58.70 L71.56,63.54 L67.93,64.41 L66.13,66.77 L61.91,68.12 L58.45,69.46 L53.53,70.56 L51.01,71.19 L48.51,71.19 L47.17,69.21 L44.18,69.23 L42.14,70.62 L38.06,69.72 L39.55,66.84 L38.19,65.81 L36.74,62.71 L33.74,55.48 L30.03,52.67 L27.34,50.31 L26.51,45.95 L28.15,43.46 L29.84,40.07 L29.76,36.77 L28.25,34.91 L27.13,33.97 L25.61,32.42 L23.51,31.33 L25.36,30.15 L27.33,28.86 L29.49,28.62 L28.79,22.78 L28.49,19.72 L27.39,19.98 L26.76,20.21 L25.87,20.12 L25.43,20.42 L24.50,20.17 L23.35,19.89 L22.23,20.46 L20.32,20.11 L18.96,18.59 L17.58,17.90 L16.12,16.91 L15.33,16.45 L13.32,16.44 L11.65,16.60 L9.15,15.24 L7.70,15.41 L6.68,17.32 L5.70,17.48 L6.28,21.49 L4.91,26.62 L3.99,28.62 L3.38,27.74 L2.27,26.76 L0.38,28.43 Z", // Santo André
    "M10.58,69.33 L10.72,70.71 L12.55,77.53 L14.38,82.40 L17.91,84.90 L20.39,87.14 L30.06,97.74 L31.62,99.43 L33.07,99.97 L34.26,99.93 L36.33,98.19 L37.16,97.64 L37.88,97.47 L38.95,97.56 L44.44,99.03 L45.38,98.99 L45.80,98.41 L46.80,96.78 L47.40,95.77 L48.49,94.43 L50.16,92.52 L54.37,90.58 L55.20,90.01 L56.25,88.66 L57.44,87.18 L58.28,86.58 L59.71,87.50 L61.73,89.10 L62.37,89.62 L63.44,90.50 L63.89,91.04 L64.18,91.68 L64.47,92.50 L64.90,93.74 L65.18,94.54 L65.51,95.15 L65.86,95.68 L66.30,96.10 L67.47,96.85 L67.84,96.83 L68.12,96.26 L68.50,95.43 L68.96,91.95 L69.27,89.84 L69.61,87.33 L70.93,86.65 L74.31,84.92 L75.62,84.26 L75.67,83.90 L75.49,79.53 L78.10,72.77 L78.72,67.78 L80.14,58.93 L81.38,55.61 L84.15,52.65 L86.33,50.70 L88.60,49.27 L85.28,43.24 L81.73,37.65 L79.16,35.15 L76.71,33.63 L77.25,32.86 L77.92,32.46 L78.52,32.38 L81.12,32.90 L81.99,33.09 L82.58,33.10 L83.07,33.04 L86.06,32.42 L87.95,31.83 L87.00,27.12 L86.58,23.36 L86.65,22.76 L86.98,22.52 L88.98,22.27 L83.23,13.37 L82.16,12.43 L80.47,11.87 L78.64,12.17 L76.42,14.27 L72.58,18.55 L71.52,21.01 L70.78,21.83 L66.08,24.52 L64.44,24.61 L57.30,20.41 L47.33,14.24 L44.20,11.68 L39.14,8.52 L29.67,2.70 L28.44,2.35 L25.86,1.96 L22.47,1.12 L22.62,2.30 L22.38,3.26 L21.41,4.85 L21.37,6.65 L21.70,9.28 L21.52,10.99 L20.99,13.36 L20.86,14.25 L20.32,17.33 L19.08,24.39 L18.48,27.31 L15.64,43.28 L15.47,44.45 L14.73,49.04 L14.27,51.13 L14.35,52.74 L15.07,54.07 L17.09,56.02 L17.52,57.25 L16.27,63.35 L15.98,63.99 L15.64,64.50 L12.16,66.75 L11.14,67.65 L10.66,68.90 Z", // São Caetano do Sul
    "M0.00,42.08 L1.60,44.71 L5.29,44.90 L8.42,46.77 L9.17,48.82 L10.93,49.47 L12.20,51.90 L14.13,53.92 L15.97,56.82 L16.34,61.62 L15.13,65.32 L13.35,69.25 L11.60,74.22 L7.56,77.28 L7.41,83.81 L7.80,88.65 L13.68,89.44 L14.94,94.86 L21.22,95.37 L24.55,93.62 L30.04,88.41 L34.62,85.40 L41.91,82.49 L46.95,77.64 L49.24,73.85 L54.89,69.00 L57.14,66.84 L62.60,60.91 L67.09,61.81 L75.35,66.55 L80.68,61.19 L85.94,57.24 L91.76,55.47 L92.33,52.47 L91.51,49.52 L89.95,46.30 L88.66,44.05 L88.17,41.43 L87.71,40.82 L87.06,39.30 L86.61,34.96 L87.73,29.30 L88.12,28.02 L89.59,26.67 L90.03,25.84 L91.03,25.07 L91.38,24.27 L91.16,23.40 L91.51,22.35 L91.35,21.00 L91.85,19.30 L92.73,17.74 L93.03,15.95 L93.56,15.15 L95.08,14.18 L96.31,12.12 L96.44,11.97 L96.97,11.40 L97.60,10.64 L99.79,9.13 L95.75,4.43 L90.05,5.29 L86.69,10.22 L80.13,13.72 L80.47,18.42 L79.78,21.21 L77.44,22.31 L74.39,23.96 L71.79,28.20 L67.86,29.28 L66.23,31.90 L64.81,27.56 L58.31,26.66 L57.75,29.11 L51.52,29.21 L46.64,30.86 L42.16,29.99 L38.39,28.43 L36.43,28.99 L34.64,28.49 L33.56,27.66 L31.89,26.92 L30.43,26.38 L29.02,26.59 L27.81,26.56 L24.41,26.39 L22.86,25.95 L22.23,24.36 L20.91,21.72 L20.67,20.01 L20.02,18.88 L19.27,15.77 L17.76,15.05 L14.50,13.45 L12.75,13.06 L12.67,13.88 L14.07,16.69 L13.06,22.18 L15.36,34.55 L13.71,35.59 L10.96,35.21 L8.42,36.41 L5.56,38.07 L3.08,41.63 L0.51,42.25 Z", // Mauá
    "M2.35,64.47 L5.25,68.44 L7.08,74.92 L6.93,79.98 L14.56,87.19 L14.12,90.11 L16.42,91.48 L17.18,92.15 L15.44,94.40 L14.63,97.86 L18.55,99.37 L22.37,99.69 L24.55,98.95 L26.39,97.12 L30.59,97.85 L31.89,96.64 L34.38,94.08 L38.93,93.56 L38.85,87.09 L42.38,78.98 L43.15,77.08 L44.79,75.21 L47.26,74.07 L51.86,72.83 L53.48,69.61 L56.81,68.10 L60.62,69.11 L63.35,66.48 L61.43,61.80 L64.07,59.00 L68.05,61.43 L71.92,61.22 L73.56,60.41 L76.02,59.55 L78.77,62.00 L81.78,65.33 L89.55,64.69 L92.90,62.21 L93.99,59.84 L96.68,58.55 L97.28,57.15 L96.66,54.95 L97.01,52.24 L96.29,50.29 L95.56,49.14 L93.92,47.27 L93.43,44.17 L93.63,42.34 L93.36,41.09 L92.30,38.57 L90.36,37.32 L88.50,35.86 L86.79,34.30 L85.66,32.90 L82.20,30.26 L80.66,23.83 L83.01,20.15 L82.20,14.61 L77.78,14.81 L71.93,15.34 L67.10,12.53 L65.55,7.73 L63.08,1.06 L62.06,1.01 L60.63,1.86 L60.16,2.27 L60.03,2.70 L59.86,2.80 L58.31,4.81 L57.63,5.33 L57.35,6.08 L57.04,7.60 L55.98,8.82 L56.35,9.84 L55.93,10.79 L55.89,11.48 L56.10,12.13 L55.57,12.53 L54.92,13.42 L54.55,13.86 L53.60,15.05 L52.31,17.20 L53.25,20.50 L52.98,23.90 L53.57,24.61 L53.91,25.30 L54.52,27.26 L55.36,29.31 L56.89,31.31 L57.50,33.62 L54.61,34.61 L50.23,38.00 L44.77,41.52 L41.09,42.15 L36.55,40.39 L32.33,41.83 L29.21,44.72 L25.52,47.79 L24.20,51.33 L20.65,54.10 L16.39,56.97 L11.81,59.16 L7.21,61.97 L3.98,64.22 Z", // Ribeirão Pires
    "M4.31,89.81 L20.50,93.15 L26.64,96.58 L34.33,97.03 L41.45,98.38 L52.01,98.63 L57.92,92.57 L60.59,85.48 L61.98,75.69 L62.78,74.07 L63.19,74.13 L63.90,73.69 L65.96,73.12 L67.67,71.60 L68.28,69.38 L70.60,67.00 L72.51,65.00 L74.64,63.64 L77.33,62.16 L79.63,60.18 L79.35,58.11 L80.59,54.55 L81.62,52.12 L81.89,50.24 L83.05,48.66 L86.09,46.38 L87.85,44.26 L90.43,43.23 L92.12,41.84 L93.19,40.29 L92.02,39.49 L92.61,38.59 L92.81,37.55 L92.99,36.23 L92.58,32.77 L92.80,30.84 L94.17,28.56 L94.18,27.20 L93.41,25.50 L92.36,24.94 L91.85,23.96 L92.85,22.82 L93.76,22.00 L95.60,17.76 L94.39,18.57 L91.80,18.36 L89.25,18.23 L85.10,19.97 L83.58,22.04 L81.57,23.35 L77.55,23.05 L69.71,12.47 L70.62,11.22 L71.35,9.50 L72.63,7.26 L68.90,6.52 L65.29,7.20 L60.60,12.27 L57.70,13.65 L55.60,13.18 L47.91,0.53 L45.44,0.53 L42.56,2.85 L35.61,4.66 L35.24,11.50 L33.43,15.50 L30.52,18.40 L34.10,23.71 L27.61,32.68 L27.41,33.81 L27.03,35.78 L26.78,37.32 L25.48,38.06 L24.72,39.61 L25.07,41.30 L26.84,41.43 L28.39,42.28 L29.47,44.19 L28.61,47.10 L29.02,47.99 L30.99,48.83 L32.53,50.81 L33.87,53.08 L35.18,53.75 L35.46,54.68 L36.48,54.55 L38.09,54.79 L38.57,55.20 L38.85,56.52 L37.92,57.97 L38.15,59.02 L40.47,59.15 L41.81,60.76 L45.56,61.53 L46.06,61.90 L47.10,62.29 L47.38,62.98 L47.74,63.87 L47.63,64.57 L47.33,65.60 L46.53,66.54 L45.50,67.79 L43.79,68.94 L42.52,69.89 L41.55,70.84 L39.19,71.82 L30.40,75.92 L13.43,87.06 Z", // Diadema
    "M24.95,51.00 L27.11,57.69 L31.73,60.69 L36.94,60.85 L35.21,66.80 L38.50,70.50 L40.27,72.31 L42.40,73.74 L43.30,75.91 L43.33,78.79 L44.60,80.51 L45.10,82.48 L45.56,85.73 L47.47,86.56 L47.13,93.21 L50.82,97.35 L52.01,98.64 L56.68,93.57 L59.21,90.10 L59.52,86.70 L59.12,83.75 L61.92,81.89 L65.44,79.58 L70.85,74.86 L73.76,70.75 L73.28,69.63 L73.42,67.96 L73.87,67.06 L73.74,66.01 L73.94,65.62 L74.53,64.42 L74.88,63.54 L74.63,62.51 L74.02,61.43 L73.57,60.50 L73.51,59.03 L73.23,57.66 L72.70,57.00 L71.96,56.50 L71.45,56.11 L71.32,55.23 L71.34,54.24 L71.51,53.37 L72.13,52.17 L72.05,51.18 L72.22,50.17 L73.48,48.21 L63.60,31.88 L63.37,30.82 L63.82,29.93 L64.75,28.43 L64.82,27.55 L65.41,26.92 L65.53,26.28 L64.74,25.58 L64.63,24.79 L65.10,24.04 L68.52,22.74 L69.79,19.33 L70.21,19.44 L70.81,19.24 L71.21,19.35 L71.49,18.83 L71.13,18.32 L71.12,17.81 L61.21,1.88 L59.07,3.44 L56.80,3.84 L54.67,2.47 L52.70,2.52 L51.03,2.29 L45.55,0.81 L44.77,3.16 L44.29,3.56 L43.94,4.81 L44.17,5.73 L44.93,5.82 L45.76,5.90 L45.85,7.28 L46.31,8.54 L47.50,9.20 L47.33,10.55 L46.19,13.45 L45.41,18.21 L44.21,21.06 L42.10,22.99 L41.37,25.73 L40.90,27.64 L40.59,29.82 L39.94,30.86 L38.80,32.66 L36.97,33.93 L36.22,35.32 L36.02,36.15 L35.92,36.58 L35.78,37.00 L34.82,37.07 L33.04,38.08 L31.68,41.25 L30.57,44.37 L27.61,48.21 L25.99,49.37 L25.55,49.63 L25.61,50.31 Z", // Suzano
  ];

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <div 
      style={{ position: 'relative', maxWidth: '1400px', margin: '60px auto 0', padding: '0 clamp(16px, 5vw, 48px)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredHub(null)}
    >
      {/* Imagem Flutuante que segue o cursor */}
      <motion.div
        className="hidden md:block" 
        style={{
          position: 'absolute',
          top: 0, left: 0,
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          width: '320px',
          height: '320px',
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: 1, // Fica atrás do texto
          opacity: hoveredHub !== null ? 1 : 0,
          scale: hoveredHub !== null ? 1 : 0.5,
        }}
        transition={{ opacity: { duration: 0.3 }, scale: { duration: 0.4, type: 'spring', bounce: 0.4 } }}
      >
        {hubs.map((hub, i) => (
          <svg 
            key={i}
            viewBox="0 0 100 100"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              opacity: hoveredHub === i ? 1 : 0,
              transition: 'opacity 0.4s ease',
              filter: 'drop-shadow(0 0 20px rgba(18, 67, 178, 0.3))'
            }}
          >
            {/* Contorno Animado do Mapa */}
            <motion.path 
              d={mapPaths[i]}
              fill="rgba(18, 67, 178, 0.02)"
              stroke="var(--mz-royal)"
              strokeWidth="0.8"
              strokeDasharray="2 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: hoveredHub === i ? 1 : 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Ponto central brilhante indicando o Hub */}
            <motion.circle cx="50" cy="50" r="2" fill="#FFC107" animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <circle cx="50" cy="50" r="6" fill="rgba(255, 193, 7, 0.15)" />
          </svg>
        ))}
      </motion.div>

      {/* Lista de Cidades */}
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        {hubs.map((hub, i) => (
          <div 
            key={i}
            onMouseEnter={() => setHoveredHub(i)}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '40px 0', 
              borderBottom: '1px solid var(--border)',
              cursor: 'default',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: hoveredHub !== null && hoveredHub !== i ? 0.3 : 1,
              transform: hoveredHub === i ? 'translateX(12px)' : 'translateX(0)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '32px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--mz-royal)', opacity: 0.15, fontFamily: 'monospace' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--mz-ink)' }}>
                {hub.name}
              </span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dim)', border: '1px solid var(--border)', padding: '8px 20px', borderRadius: '100px' }}>
              {hub.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


interface Props {
  vehicles:         Vehicle[];
  incomingVehicles: Vehicle[];
  totalVehicles:    number;
  totalPartners:    number;
  brands:           string[];
  cities:           string[];
  partners:         { name: string; initial: string }[];
}

type PriceRange = 'all' | 'under150' | '150to400' | 'over400';

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: 'Todos os preços', value: 'all'       },
  { label: 'Até R$ 150k',     value: 'under150'  },
  { label: 'R$ 150k – 400k', value: '150to400'  },
  { label: 'Acima R$ 400k',  value: 'over400'   },
];

const TECH_FEATURES = [
  {
    icon:  <Cloud size={32} />,
    color: '#3B82F6',
    title: 'Estoque 100% Real',
    desc:  'Todos os veículos no site fazem parte do nosso acervo exclusivo e estão fisicamente nos nossos Hubs. Sem anúncios fantasmas.',
    tag:   'Sem intermediários',
  },
  {
    icon:  <Zap size={32} />,
    color: '#FFC107',
    title: 'Atendimento Ágil',
    desc:  'Esqueça formulários lentos. Em minutos você fala diretamente com nossos especialistas para tirar dúvidas em tempo real.',
    tag:   'Resposta ultra-rápida',
  },
  {
    icon:  <Shield size={32} />,
    color: '#22C55E',
    title: 'Qualidade Garantida',
    desc:  'Nós não somos um classificados aberto. Cada carro passa pela nossa própria vistoria e certificação rigorosa.',
    tag:   'Vistoria Premium',
  },
];

const FAKE_REVIEWS = [
  { name: 'João Silva', role: 'Comprador de São Bernardo', text: 'Experiência incrível! O carro estava exatamente como nas fotos, sem surpresas. O hub físico faz toda a diferença.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Mariana Costa', role: 'Compradora de Santo André', text: 'Processo super rápido. Em menos de 2 horas já estava com a chave na mão. Atendimento muito transparente.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Carlos Mendes', role: 'Comprador de São Caetano', text: 'A vistoria deles me deu muita segurança. Recomendo para quem quer evitar dor de cabeça com seminovos.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=33' },
  { name: 'Ana Souza', role: 'Compradora de Diadema', text: 'Atendimento premium do início ao fim. Nunca vi nada parecido no mercado de carros da região.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Fernando Lima', role: 'Comprador de São Bernardo', text: 'O preço estava muito justo em relação ao mercado. Sem taxas escondidas na hora de fechar negócio.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=13' },
];

function matchesPrice(price: number, range: PriceRange): boolean {
  if (range === 'all')      return true;
  if (range === 'under150') return price < 150_000;
  if (range === '150to400') return price >= 150_000 && price <= 400_000;
  return price > 400_000;
}

function useTypingAnimation(texts: string[], typingSpeed = 100, deletingSpeed = 50, delayBetween = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const currentText = texts[textIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length - 1));
      }, deletingSpeed);
    } else {
      timer = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length + 1));
      }, typingSpeed);
    }

    if (!isDeleting && displayText === currentText) {
      timer = setTimeout(() => setIsDeleting(true), delayBetween);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, delayBetween]);

  return displayText;
}

const ROTATING_WORDS = ['próximo carro.', 'grande movimento.', 'novo nível.'];

function RotatingBadge() {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % ROTATING_WORDS.length);
        setAnimating(false);
      }, 600);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(18, 67, 178, 0.12)',
        border: '1.5px solid rgba(18, 67, 178, 0.25)',
        borderRadius: '100px',
        padding: '0 20px',
        height: '1.15em',
        overflow: 'hidden',
        verticalAlign: 'middle',
        marginLeft: '10px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <span
        style={{
          color: 'var(--mz-royal)',
          fontWeight: 900,
          fontSize: '0.92em',
          display: 'inline-block',
          transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease',
          transform: animating ? 'translateY(-120%)' : 'translateY(0)',
          opacity: animating ? 0 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {ROTATING_WORDS[index]}
      </span>
    </span>
  );
}

function IncomingCard({ vehicle, onNotify }: { vehicle: Vehicle; onNotify: () => void }) {
  const imageUrl = vehicle.images?.[0] ?? 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800';
  return (
    <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.2)', background: 'white', position: 'relative' }}>
      {/* Image blurred */}
      <div style={{ aspectRatio: '16/10', position: 'relative', overflow: 'hidden' }}>
        <img src={imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px) brightness(0.7)', transform: 'scale(1.05)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
          <div style={{ background: 'rgba(245,158,11,0.9)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Em breve</span>
          </div>
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {vehicle.brand} • {vehicle.year}
        </p>
        <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--mz-ink)', marginBottom: '4px' }}>{vehicle.model}</h3>
        {vehicle.version && <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>{vehicle.version}</p>}
        <p style={{ fontSize: '12px', color: 'var(--mz-slate-dim)', marginBottom: '16px' }}>
          {vehicle.partnerCity ? `${vehicle.partnerCity} · ` : ''} Preço a confirmar
        </p>
        <button
          onClick={onNotify}
          style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.06)', color: '#92400e', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s', fontFamily: 'inherit' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.06)'; }}
        >
          <Bell size={14} />
          Me avise quando chegar
        </button>
      </div>
    </div>
  );
}

export function PlatformClient({ vehicles, incomingVehicles, totalVehicles, totalPartners, brands, cities, partners }: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSheetOpen,     setIsSheetOpen]     = useState(false);
  const [activeBrand,     setActiveBrand]     = useState('Todos');
  const [activeCity,      setActiveCity]      = useState('Todas');
  const [priceRange,      setPriceRange]      = useState<PriceRange>('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [visibleCount,    setVisibleCount]    = useState(6);
  const [activeConversations, setActiveConversations] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      const numbers = [1, 2, 4, 5, 7, 8, 10];
      const random = numbers[Math.floor(Math.random() * numbers.length)];
      setActiveConversations(random);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const typingText = useTypingAnimation([
    'próximo carro.',
    'grande movimento.',
    'novo nível.'
  ]);

  const allBrands = ['Todos', ...brands];
  const allCities = ['Todas', ...cities];

  const filtered = vehicles.filter(v => {
    const matchBrand  = activeBrand === 'Todos' || v.brand?.toLowerCase() === activeBrand.toLowerCase();
    const matchSearch = !searchQuery || `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice  = matchesPrice(v.price, priceRange);
    const matchCity   = activeCity === 'Todas' || v.partnerCity === activeCity;
    return matchBrand && matchSearch && matchPrice && matchCity;
  });

  const featuredVehicles = vehicles.slice(0, 3);
  const hasActiveFilter  = activeBrand !== 'Todos' || priceRange !== 'all' || searchQuery !== '' || activeCity !== 'Todas';

  function openSheet(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
    setIsSheetOpen(true);
  }

  function resetFilters() {
    setActiveBrand('Todos');
    setPriceRange('all');
    setSearchQuery('');
    setActiveCity('Todas');
    setVisibleCount(6);
  }

  const displayPartners = partners.length > 0 ? partners : [
    { name: 'Sua loja aqui', initial: 'SL' },
    { name: 'Faça parte', initial: 'FP' },
  ];

  return (
    <div className="platform-container">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="noise" style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(80px, 10svh, 120px) clamp(16px, 5vw, 48px)', position: 'relative', overflow: 'hidden' }}>
        <div className="mesh-bg" />
        <div className="tech-grid" />
        <div className="glow-spot" />

        {/* Orbital Ecosystem Background */}
        <div className="hidden lg:block" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          {[
            { size: 900, duration: 80, nodes: [ 
              { label: 'Garantia Motorz', icon: <ShieldCheck size={14}/>, angle: 45,  delay: 0 }, 
              { label: 'Inspeção 30 Pontos',  icon: <Search size={14}/>,      angle: 135, delay: 1.2 },
              { label: 'Sem Leilão', icon: <Shield size={14}/>, angle: 225, delay: 2.4 },
              { label: 'Auditado', icon: <ShieldCheck size={14}/>,      angle: 315, delay: 3.6 }
            ] },
            { size: 1250, duration: 110, nodes: [ 
              { label: 'Unidades ABC',       icon: <MapPin size={14}/>,    angle: 0,   delay: 0.5 }, 
              { label: 'Estoque Real',    icon: <Zap size={14}/>,  angle: 72,  delay: 1.3 },
              { label: 'Preço Final',      icon: <Database size={14}/>,    angle: 144, delay: 2.1 },
              { label: 'Sem Pegadinhas', icon: <Zap size={14}/>, angle: 216, delay: 3.0 },
              { label: 'Curadoria Premium',  icon: <Heart size={14}/>,  angle: 288, delay: 3.8 }
            ] },
            { size: 1600, duration: 140, nodes: [ 
              { label: 'Atendimento Especialista',    icon: <MessageSquare size={14}/>,  angle: 30,  delay: 0.8 }, 
              { label: 'Procedência',  icon: <Shield size={14}/>,    angle: 90,  delay: 1.6 },
              { label: 'Transparência', icon: <Search size={14}/>, angle: 150, delay: 2.4 },
              { label: 'Tecnologia',   icon: <Cpu size={14}/>,    angle: 210, delay: 3.2 },
              { label: 'Sincronizado',     icon: <Zap size={14}/>,    angle: 270, delay: 4.0 },
              { label: 'Qualidade',     icon: <ShieldCheck size={14}/>, angle: 330, delay: 4.8 }
            ] }
          ].map((ring, ringIdx) => (
            <div key={`ring-${ringIdx}`} style={{ position: 'absolute', top: '50%', left: '50%', width: ring.size, height: ring.size, transform: 'translate(-50%, -50%)', border: '1px solid rgba(18, 67, 178, 0.04)', borderRadius: '50%' }}>
              {ring.nodes.map((node, nodeIdx) => (
                <motion.div
                  key={`node-${nodeIdx}`}
                  initial={{ rotate: node.angle }}
                  animate={{ rotate: node.angle + 360 }}
                  transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', top: '50%', left: '50%', width: ring.size, height: ring.size, marginLeft: -ring.size/2, marginTop: -ring.size/2, willChange: 'transform' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <motion.div
                      initial={{ rotate: -node.angle }}
                      animate={{ rotate: -(node.angle + 360) }}
                      transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
                      style={{ willChange: 'transform' }}
                    >
                      {/* Pulse via CSS — zero JS overhead */}
                      <div
                        className="orbital-node"
                        style={{
                          '--pulse-dur': `${3.5 + node.delay}s`,
                          animationDelay: `${node.delay}s`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          padding: '5px 13px',
                          background: 'rgba(255,255,255,0.65)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(18, 67, 178, 0.08)',
                          borderRadius: '100px',
                          color: 'var(--mz-slate-dim)',
                          fontWeight: 600,
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                        } as React.CSSProperties}
                      >
                        <span style={{ color: 'var(--mz-royal)', opacity: 0.7, display: 'flex' }}>{node.icon}</span>
                        {node.label}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-5xl mx-auto w-full relative z-10 text-center"
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', paddingTop: '20px' }}>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <LiveTimeBadge />
            </motion.div>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ 
              fontSize: 'clamp(30px, 6.5vw, 68px)', 
              lineHeight: 1.15, 
              letterSpacing: '-0.02em', 
              fontWeight: 900, 
              color: 'var(--mz-ink)',
              maxWidth: '1000px',
              marginTop: 0,
              marginRight: 'auto',
              marginBottom: '40px',
              marginLeft: 'auto',
              display: 'block'
            }}
          >
            <span style={{ display: 'block' }}>A escolha inteligente para</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
              o seu
              <RotatingBadge />
            </span>
          </motion.h1>


          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ fontSize: 'clamp(16px, 1.5vw, 18px)', color: 'var(--text-dim)', maxWidth: '640px', margin: '0 auto 48px', fontWeight: 500, lineHeight: 1.6 }}
          >
            A forma mais inteligente de comprar seu próximo carro no ABC paulista. Curadoria exclusiva com unidades físicas para estar sempre perto de você.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}
          >
            <a href="#estoque" className="btn-primary" style={{ padding: '20px 48px', fontSize: '18px', borderRadius: '20px' }}>
              Explorar Estoque <HugeiconsIcon icon={ArrowRight02Icon} size={22} />
            </a>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 28px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', position: 'relative' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid white', background: 'var(--mz-frost)', marginLeft: i === 1 ? 0 : '-12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    <img src={`https://i.pravatar.cc/100?img=${i+25}`} alt="User" />
                  </div>
                ))}
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: '12px', height: '12px', background: '#22C55E', borderRadius: '50%', border: '2px solid white' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--mz-ink)', margin: 0 }}>+500 negociações</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mz-slate-dim)', margin: 0 }}>
                    {activeConversations} {activeConversations === 1 ? 'conversa iniciada' : 'conversas iniciadas'} agora
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', opacity: 0.25 }}
          >
            <div style={{ width: '24px', height: '40px', borderRadius: '12px', border: '1.5px solid var(--mz-slate-dim)', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
              <motion.div 
                animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '4px', height: '6px', background: 'var(--mz-slate-dim)', borderRadius: '2px' }} 
              />
            </div>
          </motion.div>
        </motion.div>
      </section>



      {/* ── INVENTORY ──────────────────────────────────────────── */}
      <section id="estoque" style={{ background: 'var(--mz-snow)', paddingTop: '120px', paddingBottom: '0' }}>



        {/* ── Section Header ── */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)', marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
            <div>
              <SectionEyebrow label="Catálogo Completo" />
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.02em', fontWeight: 900, lineHeight: 1.1, margin: 0, color: 'var(--mz-ink)' }}>
                Encontre seu<br />próximo carro
              </h2>
            </div>
            <p style={{ maxWidth: '380px', color: 'var(--text-dim)', fontSize: '17px', lineHeight: 1.6, fontWeight: 500, marginBottom: '8px' }}>
              <RoughCircle>{totalVehicles} veículos</RoughCircle> exclusivos no estoque Motorz. Agende sua visita no Hub mais próximo de você.
            </p>
          </div>
        </div>

        {/* ── Featured Carousel ── */}
        {featuredVehicles.length > 0 && (
          <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            {/* Label — mesma âncora de padding do scroll */}
            <div style={{ padding: '0 clamp(16px, 5vw, 48px)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFB800', boxShadow: '0 0 8px rgba(255,184,0,0.5)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Seleção Especial</span>
              </div>
            </div>
            {/* Scroll row */}
            <div
              style={{ paddingLeft: 'clamp(16px, 5vw, 48px)', paddingRight: 'clamp(16px, 5vw, 48px)', paddingBottom: '64px', display: 'flex', gap: '24px', overflowX: 'auto', overflowY: 'visible', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {featuredVehicles.map((v, i) => (
                <div key={v.id} style={{ minWidth: 'clamp(300px, 82vw, 420px)', flex: '0 0 clamp(300px, 82vw, 420px)', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.10))' }}>
                  <VehicleCard vehicle={v} onInterest={openSheet} index={i} featured />
                </div>
              ))}
              <div style={{ minWidth: '16px', flexShrink: 0 }} />
            </div>
          </div>
        )}

        {/* ── Chegando em Breve ── */}
        {incomingVehicles.length > 0 && (
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)', marginBottom: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', boxShadow: '0 0 10px rgba(245,158,11,0.6)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mz-slate-dim)' }}>Chegando em Breve</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.08)', padding: '2px 10px', borderRadius: '20px', border: '1px solid rgba(245,158,11,0.2)' }}>
                {incomingVehicles.length} veículo{incomingVehicles.length > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '20px' }}>
              {incomingVehicles.map(v => (
                <IncomingCard key={v.id} vehicle={v} onNotify={() => openSheet(v)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mz-slate-dim)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Busque por marca, modelo ou versão..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setVisibleCount(6); }}
              style={{
                width: '100%',
                padding: '14px 44px',
                fontSize: '15px',
                fontFamily: 'inherit',
                fontWeight: 500,
                background: 'var(--mz-frost)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                outline: 'none',
                color: 'var(--mz-ink)',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#1243B2'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setVisibleCount(6); }} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'var(--mz-ash)', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', color: 'var(--mz-slate)', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            )}
          </div>

          {/* Stacked filter rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '8px' }}>

            {/* Região */}
            {allCities.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mz-slate-dim)', paddingLeft: '4px' }}>Região</span>
                <div className="filter-scroll-row">
                  {allCities.map(city => (
                    <button
                      key={city}
                      onClick={() => { setActiveCity(city); setVisibleCount(6); }}
                      style={{
                        flexShrink: 0,
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        borderRadius: '10px',
                        border: '1px solid',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                        background: activeCity === city ? '#1243B2' : 'var(--mz-frost)',
                        borderColor: activeCity === city ? '#1243B2' : 'var(--border)',
                        color: activeCity === city ? 'white' : 'var(--mz-slate)',
                      }}
                    >{city}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Marca */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mz-slate-dim)', paddingLeft: '4px' }}>Marca</span>
              <div className="filter-scroll-row">
                {allBrands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => { setActiveBrand(brand); setVisibleCount(6); }}
                    style={{
                      flexShrink: 0,
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      borderRadius: '10px',
                      border: '1px solid',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      background: activeBrand === brand ? '#1243B2' : 'var(--mz-frost)',
                      borderColor: activeBrand === brand ? '#1243B2' : 'var(--border)',
                      color: activeBrand === brand ? 'white' : 'var(--mz-slate)',
                    }}
                  >{brand}</button>
                ))}
              </div>
            </div>

            {/* Valor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mz-slate-dim)', paddingLeft: '4px' }}>Valor</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRICE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setPriceRange(opt.value); setVisibleCount(6); }}
                    style={{
                      flexShrink: 0,
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      borderRadius: '10px',
                      border: '1px solid',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      background: priceRange === opt.value ? '#1243B2' : 'var(--mz-frost)',
                      borderColor: priceRange === opt.value ? '#1243B2' : 'var(--border)',
                      color: priceRange === opt.value ? 'white' : 'var(--mz-slate)',
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

          </div>

          {/* Results bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dim)' }}>
              {filtered.length} veículo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </span>
            {hasActiveFilter && (
              <button onClick={resetFilters} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: 'var(--mz-royal)', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em' }}>
                × Limpar filtros
              </button>
            )}
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {filtered.slice(0, visibleCount).map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} onInterest={openSheet} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{ fontSize: '18px', color: 'var(--text-dim)', marginBottom: '16px' }}>Nenhum veículo encontrado com esses filtros.</p>
              <button onClick={resetFilters} className="btn-ghost" style={{ padding: '12px 32px' }}>Ver todos</button>
            </div>
          )}


          {/* Ver todo estoque */}
          <div style={{ textAlign: 'center', padding: '60px 0 80px' }}>
            <Link
              href="/estoque"
              className="btn-primary"
              style={{ padding: '18px 40px', fontSize: '16px', borderRadius: '16px', gap: '10px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
            >
              Ver todo o estoque <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
            </Link>
            <p style={{ marginTop: '16px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 500 }}>
              {totalVehicles} veículos disponíveis · Atualizado em tempo real
            </p>
          </div>
        </div>
      </section>

      {/* ── CURADORIA (ZMove Authoritative) ──────────────────── */}
      <section id="processo" style={{ background: '#fff', padding: 'clamp(64px, 10vw, 140px) 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(24px, 5vw, 80px)', marginBottom: 'clamp(48px, 6vw, 96px)', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }}>
              <SectionEyebrow label="Padrão de Qualidade" />
              <h2 style={{ 
                fontSize: 'clamp(32px, 6vw, 64px)', 
                letterSpacing: '-0.02em', 
                fontWeight: 900, 
                lineHeight: 1.1, 
                color: 'var(--mz-ink)', 
                margin: 0
              }}>
                Cada carro no estoque passou pela nossa vistoria premium.
              </h2>
            </div>
            
            <div style={{ flex: '1 1 300px' }}>
              <p style={{ color: 'var(--mz-ink)', fontSize: '16px', lineHeight: 1.5, fontWeight: 700, marginBottom: '16px' }}>
                A Motorz não é um portal de classificados. Somos uma Auto-Tech com estoque próprio distribuído em Hubs. Você tem a segurança de comprar direto com a gente e a conveniência de retirar perto de casa.
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>
                Sem anúncios falsos. Sem surpresas na hora de ver o carro. Todos os veículos passam por um rigoroso processo de certificação antes de entrarem no nosso catálogo oficial.
              </p>
            </div>
          </div>

          {/* Cards with Tech Features - Integrated into curation flow */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '80px' }}>
            {TECH_FEATURES.map((feat, i) => (
              <div key={i} style={{ padding: '40px 32px', borderRadius: '28px', background: 'var(--mz-frost)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '18px', background: `${feat.color}15`, color: feat.color, flexShrink: 0 }}>
                    {feat.icon}
                  </div>
                  <div style={{ display: 'inline-flex', alignSelf: 'center', alignItems: 'center', background: `${feat.color}10`, border: `1px solid ${feat.color}30`, borderRadius: '100px', padding: '4px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: feat.color }}>{feat.tag}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: 'var(--mz-ink)', letterSpacing: '-0.03em' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Process — horizontal ruled list, typographic steps */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {[
              {
                n: '01',
                title: 'Curadoria Rigorosa',
                desc: 'Cada veículo passa por checagem de histórico, quilometragem real e vistoria cautelar antes de entrar no estoque Motorz. Se não tem qualidade, não entra.',
              },
              {
                n: '02',
                title: 'Preço Inteligente e Real',
                desc: 'Nossa IA analisa o mercado para garantir uma precificação justa e transparente. O que você vê no site é o preço final, sem taxas ocultas.',
              },
              {
                n: '03',
                title: 'Test-Drive no seu Hub',
                desc: 'Escolheu o carro? Agende a visita em poucos cliques. O veículo estará limpo e esperando por você em um dos nossos Hubs credenciados no ABC.',
              },
            ].map((item) => (
              <div key={item.n} className="grid-process">
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--mz-ink)', opacity: 0.2, fontFamily: "'Cal Sans', sans-serif", letterSpacing: '0.04em', paddingTop: '3px' }}>{item.n}</span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--mz-ink)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{item.title}</h3>
                <p className="process-desc" style={{ fontSize: '15px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom seal row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', marginTop: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid var(--mz-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                <ShieldCheck size={18} color="var(--mz-ink)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mz-ink)', opacity: 0.6, letterSpacing: '-0.01em' }}>Estoque com Certificação Motorz</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Vistoria Cautelar', 'Fotos 100% Reais', 'Sem Pegadinhas', 'Garantia Motorz', 'Especialista Dedicado'].map((tag) => (
                <span key={tag} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mz-ink)', opacity: 0.5, border: '1px solid currentColor', borderRadius: '100px', padding: '4px 12px', whiteSpace: 'nowrap' }}>{tag}</span>
              ))}
            </div>
          </div>

        </div>
      </section>

      <section id="hubs" style={{ padding: 'clamp(64px, 10vw, 120px) 0', background: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <SectionEyebrow label="Nossos Hubs" />
          </div>
          <h2 style={{ fontSize: 'clamp(40px, 6vw, 72px)', letterSpacing: '-0.04em', marginBottom: '24px', color: 'var(--mz-ink)', fontWeight: 900, lineHeight: 1 }}>
            O ABC inteiro<br />conectado.
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '18px', lineHeight: 1.6, fontWeight: 500, maxWidth: '640px', margin: '0 0 40px 0' }}>
            Não somos um pátio distante. Temos dezenas de pontos de atendimento estratégicos na região. Você escolhe o carro online e agenda uma visita no Hub mais próximo de você.
          </p>
        </div>
        
        <HubHoverList />
      </section>

      {/* ── QUEM SOMOS ───────────────────────────────────────────── */}
      <section id="quem-somos" style={{ background: 'var(--mz-snow)', padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>
          <div className="grid-about-2">
            <div>
              <SectionEyebrow label="Nossa História" />
              <h2 style={{ fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '-0.05em', fontWeight: 900, lineHeight: 1.05, color: 'var(--mz-ink)', marginBottom: '28px' }}>
                Nascemos para<br />mudar o jogo
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '18px', lineHeight: 1.7, fontWeight: 500, marginBottom: '20px' }}>
                A Motorz surgiu da frustração com o mercado de classificados tradicional, cheio de anúncios duplicados e falta de transparência. Decidimos assumir o controle total da jornada de compra para criar algo novo.
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '18px', lineHeight: 1.7, fontWeight: 500, marginBottom: '48px' }}>
                Hoje, somos a primeira Auto-Tech do ABC que detém seu próprio estoque certificado. Combinamos tecnologia de ponta com a conveniência de Hubs físicos, entregando uma experiência premium e segura de ponta a ponta.
              </p>
              <Link href="/embaixador" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 36px', fontSize: '16px', borderRadius: '16px', textDecoration: 'none' }}>
                Quero fazer parte <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { value: '500+',  label: 'Negociações realizadas', color: '#1243B2' },
                { value: '100%',  label: 'Estoque verificado',      color: '#22C55E' },
                { value: '<2min', label: 'Tempo de resposta',       color: '#F59E0B' },
                { value: 'A+',    label: 'Lojas auditadas',         color: '#A855F7' },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '36px 28px', borderRadius: '24px', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.04em', color: stat.color, marginBottom: '8px' }}>{stat.value}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', lineHeight: 1.3 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AVALIAÇÕES (REVIEW CAROUSEL) ────────────────────────── */}
      <section id="avaliacoes" style={{ padding: 'clamp(60px, 8vw, 100px) 0', background: '#fff', overflow: 'hidden', position: 'relative' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)', textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SectionEyebrow label="Padrão Motorz" />
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'var(--mz-ink)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            Confiança em cada<br />negócio fechado.
          </h2>
        </div>

        {/* CSS mask for fade out on edges */}
        <div style={{ position: 'relative', width: '100%', maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
          <div style={{ display: 'flex', gap: '20px', width: 'max-content', animation: 'scroll-infinite-clean 45s linear infinite', paddingLeft: '20px' }}>
            {[...FAKE_REVIEWS, ...FAKE_REVIEWS, ...FAKE_REVIEWS].map((review, i) => (
              <div key={i} style={{ 
                width: 'clamp(260px, 50vw, 340px)', 
                background: 'var(--mz-snow)', 
                padding: '24px', 
                borderRadius: '24px', 
                border: '1px solid var(--border)', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1,2,3,4,5].map(star => <Star key={star} size={14} fill="#FFB800" color="#FFB800" />)}
                </div>
                <p style={{ fontSize: '15px', lineHeight: 1.5, fontWeight: 500, color: 'var(--mz-ink)', flex: 1, margin: 0 }}>"{review.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <img src={review.avatar} alt={review.name} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--mz-frost)' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--mz-ink)' }}>{review.name}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ────────────────────────────────────────── */}
      <section id="comparacao" style={{ padding: 'clamp(64px, 10vw, 140px) clamp(16px, 5vw, 24px)', background: 'linear-gradient(to bottom, #1243B2 0%, #0A1931 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <SectionEyebrow label="Antes e Depois" dark />
            </div>
            <h2 style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: 'white', letterSpacing: '-0.04em', lineHeight: 1.05, fontWeight: 900 }}>
              Com a Motorz.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px', maxWidth: '600px', margin: '32px auto 0', lineHeight: 1.6, fontWeight: 500 }}>
              Arraste para ver como a Motorz transforma horas de busca frustrante em segundos de clareza e confiança.
            </p>
          </div>
          <div style={{ borderRadius: '32px', padding: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.05))', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ borderRadius: '31px', overflow: 'hidden', background: '#0A1931' }}>
              <ComparisonSlider
                beforeImage="/assets/images/searching-chaos.png?v=1"
                afterImage="/assets/images/motorz-sucess.png?v=1"
              />
            </div>
          </div>
          
          <div style={{ marginTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <div style={{ width: '24px', height: '40px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: '4px', height: '6px', background: 'white', borderRadius: '2px' }}
              />
            </div>
          </div>
        </div>
      </section>

      <LeadBottomSheet
        vehicle={selectedVehicle}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
      
      <ZmChat />
      <LiveActivity vehicles={vehicles.slice(0, 12).map(v => ({ id: v.id, brand: v.brand, model: v.model, year: v.year, images: v.images ?? [] }))} />
    </div>
  );
}
