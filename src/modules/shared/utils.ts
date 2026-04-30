/**
 * Formata um valor para moeda BRL.
 * Ex: 1150000 → "R$ 1.150.000,00"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata quilometragem.
 * Ex: 5000 → "5.000 km"
 */
export function formatMileage(km: number): string {
  return `${km.toLocaleString('pt-BR')} km`;
}

/**
 * Formata telefone BR para exibição.
 * Ex: "5511999999999" → "(11) 99999-9999"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '').replace(/^55/, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Retorna uma string relativa de data.
 * Ex: "há 2 dias"
 */
export function formatRelativeDate(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 1) return 'hoje';
  return rtf.format(diffDays, 'day');
}

/**
 * Gera iniciais a partir de um nome.
 * Ex: "Pedro Sampaio" → "PS"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}
