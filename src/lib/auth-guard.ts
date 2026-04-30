import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

type AuthGuardResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse };

export async function requireAuth(): Promise<AuthGuardResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }),
    };
  }

  return { user, error: null };
}
