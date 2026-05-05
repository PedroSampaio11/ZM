import type { AdapterType } from '@prisma/client';
import { AutoCertoAdapter } from './autocerto-adapter';

export type AdapterFetchConfig = {
  credentials: Record<string, string>;
  config: Record<string, unknown>;
};

export interface InventoryAdapter {
  readonly providerName: string;
  fetchVehicles(fetchConfig: AdapterFetchConfig): Promise<Record<string, unknown>[]>;
}

// ── Registry de todos os adapters disponíveis ─────────────────────────────────
// Para adicionar um novo sistema: implemente InventoryAdapter e registre aqui.

export const ADAPTER_REGISTRY: Partial<Record<AdapterType, new () => InventoryAdapter>> = {
  AUTOCERTO:    AutoCertoAdapter,
  // COCKPIT:   CockpitAdapter,    // implementar quando necessário
  // REVENDA_MAIS: RevendaMaisAdapter,
  // MOTOR21:   Motor21Adapter,
};

export const ADAPTER_DISPLAY_NAMES: Record<AdapterType, string> = {
  AUTOCERTO:    'AutoCerto',
  COCKPIT:      'Cockpit DMS',
  REVENDA_MAIS: 'Revenda Mais',
  MOTOR21:      'Motor21',
  WEBMOTORS:    'WebMotors',
  OLX_AUTOS:    'OLX Autos',
  MOBIAUTO:     'Mobiauto',
  ICARROS:      'iCarros',
  REPASSE:      'Repasse',
  MANUAL:       'Manual',
};

export function getAdapter(type: AdapterType): InventoryAdapter {
  const AdapterClass = ADAPTER_REGISTRY[type];
  if (!AdapterClass) {
    const available = Object.keys(ADAPTER_REGISTRY).join(', ');
    throw new Error(`Adapter '${type}' não implementado. Disponíveis: ${available}`);
  }
  return new AdapterClass();
}
