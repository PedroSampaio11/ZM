import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://motorz.com.br';

  let vehicleUrls: MetadataRoute.Sitemap = [];
  try {
    const vehicles = await prisma.vehicle.findMany({
      where:   { status: 'AVAILABLE' },
      select:  { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    vehicleUrls = vehicles.map(v => ({
      url: `${base}/veiculo/${v.id}`,
      lastModified: v.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch {
    // silently skip on DB error — static routes still get indexed
  }

  return [
    { url: base,                      lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/estoque`,          lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${base}/seja-parceiro`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...vehicleUrls,
  ];
}
