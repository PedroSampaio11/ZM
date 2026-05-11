import { NextRequest, NextResponse } from 'next/server';
import { syncStore } from '@/lib/inventory-sync/engine';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stores = await prisma.store.findMany({
    where:  { isActive: true },
    select: { id: true, name: true },
  });

  const results = await Promise.allSettled(
    stores.map(store => syncStore(store.id, { dryRun: false }))
  );

  const summary = results.map((r, i) => {
    const base = { storeId: stores[i]!.id, store: stores[i]!.name, status: r.status };
    if (r.status === 'fulfilled') return { ...base, ...r.value };
    return { ...base, error: (r.reason as Error)?.message };
  });

  console.log('[CRON sync]', JSON.stringify(summary));

  return NextResponse.json({ ok: true, at: new Date().toISOString(), summary });
}
