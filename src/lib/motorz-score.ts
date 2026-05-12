type ScoreInput = {
  year: number;
  mileage: number;
  transmission?: string | null;
  version?: string | null;
};

// Base 65 garante que TODO veículo curado começa em "Bom" (mínimo 66).
// Pior caso real: 2010, 200k km, manual, sem versão → 65 + 0 + 0 + 1 + 0 = 66.
export function computeMotorzScore(v: ScoreInput): number {
  const yearPts    = Math.min(13, Math.max(0, ((v.year - 2010) / (2025 - 2010)) * 13));
  const mileagePts = Math.min(13, Math.max(0, (1 - v.mileage / 200_000) * 13));
  const transPts   = v.transmission === 'AUTOMATIC' || v.transmission === 'CVT' ? 6
                   : v.transmission === 'SEMI_AUTOMATIC' ? 3 : 1;
  const versionPts = v.version ? 3 : 0;
  return Math.min(100, Math.round(65 + yearPts + mileagePts + transPts + versionPts));
}

// Cores: Bom → ouro Motorz | Muito Bom → azul Motorz | Excelente → verde
export function getScoreDisplay(score: number): {
  label: string;
  color: string;
  bg: string;
  ring: string;
} {
  if (score >= 90) return { label: 'Excelente',  color: '#15803d', bg: '#F0FDF4', ring: '#22C55E' };
  if (score >= 80) return { label: 'Muito Bom',  color: '#1e3a8a', bg: '#EFF6FF', ring: '#1243B2' };
  return               { label: 'Bom',          color: '#92400e', bg: '#FFFBEB', ring: '#FFC107' };
}
