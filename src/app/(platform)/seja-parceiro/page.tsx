import type { Metadata } from 'next';
import { SejaParceiroClient } from './seja-parceiro-client';

export const metadata: Metadata = {
  title: 'Seja Parceiro — Cadastre sua Loja no ABCD Paulista | Motorz',
  description: 'Torne-se parceiro Motorz e coloque sua concessionária no maior marketplace automotivo do ABCD Paulista. Visibilidade premium, leads qualificados e sincronização automática de estoque.',
  alternates: {
    canonical: 'https://motorz.com.br/seja-parceiro',
  },
  openGraph: {
    title: 'Seja Parceiro Motorz — ABCD Paulista',
    description: 'Visibilidade premium, leads qualificados e sincronização automática de estoque para sua concessionária no ABCD Paulista.',
    url: 'https://motorz.com.br/seja-parceiro',
  },
};

export default function SejaParceiroPage() {
  return <SejaParceiroClient />;
}
