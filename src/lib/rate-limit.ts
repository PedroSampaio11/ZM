// SEC-05: rate limiter com Upstash Redis (persistente entre deploys).
// Se UPSTASH_REDIS_REST_URL não estiver configurado, cai no fallback em memória (dev).
// Setup: upstash.com → criar Redis DB → copiar URL e TOKEN para .env.local e Vercel.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

// ── Fallback em memória (dev / Upstash não configurado) ────────────────────────
interface MemWindow { count: number; resetAt: number }
const memStore = new Map<string, MemWindow>();

function memLimit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const win = memStore.get(ip);
  if (!win || win.resetAt <= now) {
    memStore.set(ip, { count: 1, resetAt: now + windowMs });
    // limpa entradas antigas a cada novo registro
    for (const [k, w] of memStore) {
      if (w.resetAt < now - 10 * 60_000) memStore.delete(k);
    }
    return true;
  }
  win.count++;
  return win.count <= max;
}

// ── Upstash (sliding window, persistente) ─────────────────────────────────────
async function upstashLimit(ip: string, max: number, windowSec: number): Promise<boolean> {
  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis }     = await import('@upstash/redis');

  const rl = new Ratelimit({
    redis:   Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(max, `${windowSec}s`),
    prefix:  'mz_rl',
  });

  const { success } = await rl.limit(ip);
  return success;
}

// ── Exportação principal ───────────────────────────────────────────────────────
export async function rateLimit(req: NextRequest, opts: RateLimitOptions): Promise<NextResponse | null> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  let allowed: boolean;

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      allowed = await upstashLimit(ip, opts.maxRequests, Math.ceil(opts.windowMs / 1000));
    } catch {
      // Upstash indisponível → fallback silencioso, não bloqueia tráfego legítimo
      allowed = memLimit(ip, opts.maxRequests, opts.windowMs);
    }
  } else {
    allowed = memLimit(ip, opts.maxRequests, opts.windowMs);
  }

  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em breve.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  return null;
}
