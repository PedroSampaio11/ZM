import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SimulationSchema } from '@/lib/schemas';
import { calculateInstallment } from '@/modules/finance/types';
import { ZodError } from 'zod';

// POST /api/simulations — Cria uma simulação de financiamento
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = SimulationSchema.parse(body);

    const DEFAULT_MONTHLY_RATE = 1.59; // % ao mês (taxa base de mercado)
    const monthlyRate = data.monthlyRate ?? DEFAULT_MONTHLY_RATE;

    const financedAmount = data.vehiclePrice - data.downPayment;

    if (financedAmount <= 0) {
      return NextResponse.json(
        { error: 'Entrada não pode ser maior que o valor do veículo' },
        { status: 400 }
      );
    }

    const monthlyPayment = calculateInstallment(financedAmount, monthlyRate, data.installments);
    const totalAmount = monthlyPayment * data.installments;
    const totalInterest = totalAmount - financedAmount;

    const simulation = await prisma.simulation.create({
      data: {
        leadId: data.leadId,
        vehiclePrice: data.vehiclePrice,
        downPayment: data.downPayment,
        financedAmount,
        installments: data.installments,
        monthlyRate,
        monthlyPayment,
        totalAmount,
        totalInterest,
        bankName: data.bankName,
      },
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('[POST /api/simulations]', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
