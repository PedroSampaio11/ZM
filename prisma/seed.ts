import { PrismaClient, VehicleStatus, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── Store padrão (tenant inicial: Via Brasil) ─────────────────────────────
  const store = await prisma.store.upsert({
    where:  { slug: 'via-brasil' },
    update: {},
    create: {
      name:     'Via Brasil Multimarcas',
      slug:     'via-brasil',
      document: '12345678000190',
      plan:     'PROFESSIONAL',
      isActive: true,
    },
  });

  // ── Parceiros ─────────────────────────────────────────────────────────────
  const daitan = await prisma.partner.upsert({
    where:  { document: '12345678000190' },
    update: {},
    create: {
      storeId:    store.id,
      name:       'Daitan Motors',
      document:   '12345678000190',
      email:      'contato@daitan.com.br',
      phone:      '11999990001',
      address:    'Av. Paulista, 1000',
      city:       'São Paulo',
      state:      'SP',
      commission: 2.5,
      isActive:   true,
    },
  });

  const euroville = await prisma.partner.upsert({
    where:  { document: '98765432000110' },
    update: {},
    create: {
      storeId:    store.id,
      name:       'Euroville Premium',
      document:   '98765432000110',
      email:      'vendas@euroville.com.br',
      phone:      '11999990002',
      address:    'Rua Oscar Freire, 500',
      city:       'São Paulo',
      state:      'SP',
      commission: 3.0,
      isActive:   true,
    },
  });

  // ── Integrations ──────────────────────────────────────────────────────────
  // Daitan usa AutoCerto (credenciais via env)
  await prisma.integrationConfig.upsert({
    where:  { partnerId_adapter: { partnerId: daitan.id, adapter: 'AUTOCERTO' } },
    update: {},
    create: {
      partnerId:   daitan.id,
      storeId:     store.id,
      adapter:     'AUTOCERTO',
      isActive:    true,
      credentials: {},   // lidas do .env.local (AUTOCERTO_CLIENT_ID, etc.)
      config:      { syncIntervalMinutes: 60 },
    },
  });

  // Euroville usa cadastro manual por enquanto
  await prisma.integrationConfig.upsert({
    where:  { partnerId_adapter: { partnerId: euroville.id, adapter: 'MANUAL' } },
    update: {},
    create: {
      partnerId:   euroville.id,
      storeId:     store.id,
      adapter:     'MANUAL',
      isActive:    true,
      credentials: {},
      config:      {},
    },
  });

  // ── Veículos ──────────────────────────────────────────────────────────────
  await prisma.vehicle.upsert({
    where:  { externalId: 'DAITAN-001' },
    update: {},
    create: {
      storeId:      store.id,
      partnerId:    daitan.id,
      brand:        'Porsche',
      model:        '911 Carrera S',
      version:      'PDK',
      year:         2023,
      mileage:      8500,
      price:        1150000,
      fuel:         'Gasolina',
      transmission: 'PDK',
      color:        'Guards Red',
      description:  'Único dono, revisões em concessionária autorizada.',
      images:       [],
      status:       VehicleStatus.AVAILABLE,
      externalId:   'DAITAN-001',
    },
  });

  await prisma.vehicle.upsert({
    where:  { externalId: 'EURO-001' },
    update: {},
    create: {
      storeId:      store.id,
      partnerId:    euroville.id,
      brand:        'BMW',
      model:        'M4 Competition',
      version:      'xDrive',
      year:         2024,
      mileage:      3200,
      price:        780000,
      fuel:         'Gasolina',
      transmission: 'Automático',
      color:        'Isle of Man Green',
      description:  'Emplacado 2024, teto solar panorâmico, Harman Kardon.',
      images:       [],
      status:       VehicleStatus.RESERVED,
      externalId:   'EURO-001',
    },
  });

  await prisma.vehicle.upsert({
    where:  { externalId: 'EURO-002' },
    update: {},
    create: {
      storeId:      store.id,
      partnerId:    euroville.id,
      brand:        'Audi',
      model:        'RS6 Avant',
      version:      'Performance',
      year:         2022,
      mileage:      22000,
      price:        950000,
      fuel:         'Gasolina',
      transmission: 'Automático',
      color:        'Nardo Gray',
      description:  'Pacote Dynamic Plus, rodas 22", IPVA pago.',
      images:       [],
      status:       VehicleStatus.AVAILABLE,
      externalId:   'EURO-002',
    },
  });

  await prisma.vehicle.upsert({
    where:  { externalId: 'DAITAN-002' },
    update: {},
    create: {
      storeId:      store.id,
      partnerId:    daitan.id,
      brand:        'Land Rover',
      model:        'Defender 110',
      version:      'V8',
      year:         2023,
      mileage:      15000,
      price:        650000,
      fuel:         'Gasolina',
      transmission: 'Automático',
      color:        'Gondwana Stone',
      description:  'Pacote X-Dynamic, 7 lugares, todas as revisões em dia.',
      images:       [],
      status:       VehicleStatus.SOLD,
      externalId:   'DAITAN-002',
    },
  });

  // ── Leads ─────────────────────────────────────────────────────────────────
  const porsche = await prisma.vehicle.findUnique({ where: { externalId: 'DAITAN-001' } });
  const bmw     = await prisma.vehicle.findUnique({ where: { externalId: 'EURO-001' } });

  const lead1 = await prisma.lead.upsert({
    where:  { id: 'seed-lead-001' },
    update: {},
    create: {
      id:        'seed-lead-001',
      storeId:   store.id,
      name:      'Carlos Mendes',
      phone:     '5511991110001',
      email:     'carlos.mendes@gmail.com',
      origin:    'GOOGLE_ADS',
      vehicleId: porsche?.id,
      partnerId: daitan.id,
      status:    LeadStatus.QUALIFIED,
      score:     87,
      summary:   'Cliente com renda comprovada acima de R$30k/mês. Interesse no Porsche 911. Aguarda proposta de financiamento.',
    },
  });

  const lead2 = await prisma.lead.upsert({
    where:  { id: 'seed-lead-002' },
    update: {},
    create: {
      id:        'seed-lead-002',
      storeId:   store.id,
      name:      'Fernanda Lima',
      phone:     '5511992220002',
      email:     'fernanda.lima@empresa.com',
      origin:    'FACEBOOK_ADS',
      vehicleId: bmw?.id,
      partnerId: euroville.id,
      status:    LeadStatus.AI_QUALIFYING,
      score:     62,
      summary:   'Aguardando retorno sobre entrada. Mensagem recebida hoje às 09h via WhatsApp.',
    },
  });

  await prisma.lead.upsert({
    where:  { id: 'seed-lead-003' },
    update: {},
    create: {
      id:      'seed-lead-003',
      storeId: store.id,
      name:    'Roberto Alves',
      phone:   '5511993330003',
      origin:  'ORGANIC',
      status:  LeadStatus.NEW,
      score:   40,
    },
  });

  // ── Interactions ──────────────────────────────────────────────────────────
  await prisma.interaction.createMany({
    data: [
      {
        leadId:    lead1.id,
        channel:   'WHATSAPP',
        direction: 'INBOUND',
        content:   'Olá, vi o Porsche 911 no site e quero mais informações sobre financiamento.',
      },
      {
        leadId:    lead1.id,
        channel:   'WHATSAPP',
        direction: 'OUTBOUND',
        content:   'Olá Carlos! Tudo bem? Vou te passar as condições disponíveis. Qual seria o valor de entrada?',
      },
      {
        leadId:    lead2.id,
        channel:   'WHATSAPP',
        direction: 'INBOUND',
        content:   'Tenho interesse no BMW M4. Aceita troca?',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed concluído: 1 store, 2 parceiros, 2 integrações, 4 veículos, 3 leads, 3 interações');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
