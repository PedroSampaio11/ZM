export type SimulationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Bank {
  id: string;
  name: string;
  minRate: number; // Taxa mínima mensal (%)
  maxRate: number; // Taxa máxima mensal (%)
  maxInstallments: number;
  minDownPaymentPct: number; // Entrada mínima como % do valor do veículo
}

export interface Simulation {
  id: string;
  leadId: string;

  vehiclePrice: number;
  downPayment: number;
  financedAmount: number; // vehiclePrice - downPayment
  installments: number;
  monthlyRate: number;
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number; // totalAmount - financedAmount

  bankName?: string;
  status: SimulationStatus;
  createdAt: Date;
}

export interface SimulationInputDTO {
  vehiclePrice: number;
  downPayment: number;
  installments: number; // Ex: 12, 24, 36, 48, 60
  monthlyRate?: number; // Se não informado, usa a taxa padrão do banco
}

export interface SimulationResultDTO extends SimulationInputDTO {
  financedAmount: number;
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
}

// Helper function para calcular parcela (SAC / Price)
export function calculateInstallment(
  principal: number,
  monthlyRate: number,
  installments: number
): number {
  if (monthlyRate === 0) return principal / installments;
  const r = monthlyRate / 100;
  return (principal * r * Math.pow(1 + r, installments)) / (Math.pow(1 + r, installments) - 1);
}
