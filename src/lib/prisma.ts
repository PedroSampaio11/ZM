import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function isConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.message.includes("Can't reach database") ||
    err.message.includes('connect ECONNREFUSED') ||
    err.message.includes('Connection timed out') ||
    err.message.includes('Server has closed the connection') ||
    err.message.includes('Connection pool timeout')
  );
}

// Retry automático para erros de conexão (Supabase free tier pausa após inatividade)
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 400,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (isConnectionError(err) && attempt < retries - 1) {
        await new Promise(r => setTimeout(r, baseDelayMs * 2 ** attempt));
        try { await prisma.$connect(); } catch { /* ignora, a próxima query reconecta */ }
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
