'use client';

import { login } from '@/lib/auth-actions';
import { useState, useTransition } from 'react';
import { Brain, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-4">
            <Brain className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter">
            SUPER<span className="text-blue-500">LOJA</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1">
            Painel de Controle
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/50 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-xs font-medium text-center">{error}</p>
              </div>
            )}

            <button
              disabled={isPending}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Acessar Painel'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-zinc-600 text-xs">
              Esqueceu sua senha? Entre em contato com o suporte.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 PedroSampaio Ecosystem
        </p>
      </div>
    </div>
  );
}
