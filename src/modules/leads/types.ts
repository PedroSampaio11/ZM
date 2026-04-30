export type LeadStatus =
  | 'NEW'
  | 'AI_QUALIFYING'
  | 'QUALIFIED'
  | 'HANDOFF_HUMAN'
  | 'LOST'
  | 'CONVERTED';

export type LeadOrigin =
  | 'FACEBOOK_ADS'
  | 'GOOGLE_ADS'
  | 'ORGANIC'
  | 'WHATSAPP'
  | 'REFERRAL'
  | 'PARTNER';

export interface Lead {
  id: string;
  name: string;
  phone: string; // Formato: 55119XXXXXXXX (para Evolution API)
  email?: string;
  origin?: LeadOrigin;
  vehicleId?: string;
  partnerId?: string;

  // Qualificação pela IA
  status: LeadStatus;
  score: number; // 0-100
  summary?: string; // Resumo da triagem feita pelo agente

  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  leadId: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'PHONE' | 'INTERNAL';
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  createdAt: Date;
}

export interface CreateLeadDTO {
  name: string;
  phone: string;
  email?: string;
  origin?: LeadOrigin;
  vehicleId?: string;
  message?: string; // Primeira mensagem do lead
}
