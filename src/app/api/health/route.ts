import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/health
 * Verifica a conectividade com o Supabase.
 * Retorna status, latência e informações do projeto.
 */
export async function GET() {
  const start = Date.now();

  try {
    const supabase = await createClient();

    // Testa conectividade com uma query simples
    const { error } = await supabase
      .from('_prisma_migrations') // tabela criada pelo Prisma após a migration
      .select('id')
      .limit(1);

    const latency = Date.now() - start;

    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // PGRST116 = tabela não existe ainda (ok antes da migration)
      // 42P01 = relation does not exist (ok antes da migration)
      throw error;
    }

    return NextResponse.json({
      status: 'ok',
      supabase: 'connected',
      latency_ms: latency,
      db_ready: !error, // false se migration ainda não foi executada
      message: error
        ? '⚠️ Supabase conectado, mas migration ainda não executada. Rode: npx prisma migrate dev'
        : '✅ Supabase e banco prontos.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const latency = Date.now() - start;
    console.error('[GET /api/health]', err);

    return NextResponse.json(
      {
        status: 'error',
        supabase: 'disconnected',
        latency_ms: latency,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        hint: 'Verifique DATABASE_URL e DIRECT_URL no .env.local',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
