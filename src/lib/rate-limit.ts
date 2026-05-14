// SEC-05: rate limiter em memória — resetado a cada deploy na Vercel.
// Antes do 1º cliente pagar, migrar para Upstash Redis:
//   npm i @upstash/ratelimit @upstash/redis
//   https://upstash.com (plano grátis cobre o MVP)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

function pruneStore() {
  const now = Date.now();
  for (const [key, win] of store) {
    if (win.resetAt < now - 10 * 60_000) store.delete(key);
  }
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(req: NextRequest, opts: RateLimitOptions): NextResponse | null {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const now = Date.now();
  const win = store.get(ip);

  if (!win || win.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + opts.windowMs });
    pruneStore();
    return null;
  }

  win.count++;
  if (win.count > opts.maxRequests) {
    const retryAfter = Math.ceil((win.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em breve.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  return null;
}
