import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/vehicles — Lista veículos disponíveis (vitrine pública)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minYear = searchParams.get('minYear');
    const transmission = searchParams.get('transmission');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '12');

    const where = {
      status: 'AVAILABLE' as const,
      ...(brand && { brand: { contains: brand, mode: 'insensitive' as const } }),
      ...(transmission && { transmission }),
      ...(minYear && { year: { gte: parseInt(minYear) } }),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
          }
        : {}),
    };

    const [vehicles, total] = await prisma.$transaction([
      prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          partner: { select: { name: true, city: true, state: true } },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({ vehicles, total, page, limit });
  } catch (error) {
    console.error('[GET /api/vehicles]', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
