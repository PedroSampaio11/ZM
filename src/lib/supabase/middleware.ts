import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Lista de emails com acesso ao painel admin — separados por vírgula no .env
function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return new Set(
    raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  );
}

/**
 * Middleware Supabase — atualiza a sessão de autenticação em cada request.
 * Protege rotas /gestao/* com duas camadas:
 *   1. Autenticação: redireciona para /login se não logado
 *   2. Autorização: redireciona para / se o email não está na ADMIN_EMAILS allowlist
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/gestao');

  if (isAdminRoute) {
    // Camada 1: não autenticado → /login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Camada 2: email não autorizado → home (403 silencioso)
    const adminEmails = getAdminEmails();
    if (adminEmails.size > 0 && !adminEmails.has(user.email?.toLowerCase() ?? '')) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
