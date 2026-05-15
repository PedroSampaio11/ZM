import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import localFont from 'next/font/local';
import './platform.css';
import { TopNav, BottomNav } from './nav-client';
import { Footer } from './footer-client';
import { PWARegister } from '@/components/pwa-register';

const onest = Onest({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-onest',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  preload: true,
});

const calSans = localFont({
  src: '../../../public/fonts/CalSans-SemiBold.woff2',
  variable: '--font-cal',
  display: 'swap',
  weight: '600',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://motorz.com.br'),
  title: {
    default: 'Motorz — Marketplace Automotivo do ABCD Paulista',
    template: '%s | Motorz',
  },
  description: 'O maior marketplace automotivo do ABCD Paulista. Encontre veículos em Santo André, São Bernardo do Campo, São Caetano do Sul e Diadema com segurança, curadoria premium e tecnologia.',
  keywords: [
    'comprar carro ABCD paulista',
    'veículos Santo André SP',
    'carros São Bernardo do Campo',
    'marketplace automotivo ABCD',
    'carros São Caetano do Sul',
    'concessionária Diadema',
    'motorz marketplace',
    'comprar carro seminovo ABCD',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Motorz',
    url: 'https://motorz.com.br',
    title: 'Motorz — Marketplace Automotivo do ABCD Paulista',
    description: 'Encontre o carro ideal em Santo André, São Bernardo, São Caetano e Diadema. Curadoria premium, tecnologia e transparência total.',
    images: [{ url: '/assets/brand/banners/OG.png', width: 1200, height: 630, alt: 'Motorz Marketplace Automotivo ABCD Paulista' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motorz — Marketplace Automotivo do ABCD Paulista',
    description: 'Encontre o carro ideal em Santo André, São Bernardo, São Caetano e Diadema.',
    images: ['/assets/brand/banners/OG.png'],
  },
  alternates: {
    canonical: 'https://motorz.com.br',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: '/assets/images/MZAPP.png',
    apple: '/assets/images/MZAPP.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Motorz',
  },
  themeColor: '#1243B2',
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${onest.variable} ${calSans.variable}`}>
      <body>
        <PWARegister />
        <TopNav />
        <main className="main-content">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
