import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

type AuthGuardResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse };

function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return new Set(
    raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  );
}

/**
 * Verifica autenticação E autorização para rotas API do admin.
 * - 401 se não autenticado
 * - 403 se autenticado mas email não está na ADMIN_EMAILS allowlist
 */
export async function requireAuth(): Promise<AuthGuardResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }),
    };
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.size > 0 && !adminEmails.has(user.email?.toLowerCase() ?? '')) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }),
    };
  }

  return { user, error: null };
}
