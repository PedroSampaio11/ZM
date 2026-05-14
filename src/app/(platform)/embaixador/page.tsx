import type { Metadata } from 'next';
import { EmbaixadorClient } from './embaixador-client';

export const metadata: Metadata = {
  title: 'Faça Parte — Seja um Embaixador Motorz | Motorz',
  description: 'Faça parte da Motorz e torne-se um embaixador da marca. Represente nossa marca, seja um influenciador e revolucione o mercado automotivo conosco.',
  alternates: {
    canonical: 'https://motorz.com.br/embaixador',
  },
  openGraph: {
    title: 'Faça Parte Motorz — Seja um Embaixador',
    description: 'Faça parte da Motorz e torne-se um embaixador da marca. Represente nossa marca, seja um influenciador e revolucione o mercado automotivo conosco.',
    url: 'https://motorz.com.br/embaixador',
    images: [{ url: '/assets/brand/banners/OG.png', width: 1200, height: 630, alt: 'Motorz — Seja um Embaixador' }],
  },
};

export default function EmbaixadorPage() {
  return <EmbaixadorClient />;
}
