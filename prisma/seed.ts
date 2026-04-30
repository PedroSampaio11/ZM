import { PrismaClient, VehicleStatus, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Parceiros
  const daitan = await prisma.partner.upsert({
    where: { document: '12.345.678/0001-90' },
    update: {},
    create: {
      name: 'Daitan Motors',
      document: '12.345.678/0001-90',
      email: 'contato@daitan.com.br',
      phone: '11999990001',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      commission: 2.5,
      scrapingUrl: 'https://daitan.com.br/estoque',
    },
  });

  const euroville = await prisma.partner.upsert({
    where: { document: '98.765.432/0001-10' },
    update: {},
    create: {
      name: 'Euroville Premium',
      document: '98.765.432/0001-10',
      email: 'vendas@euroville.com.br',
      phone: '11999990002',
      address: 'Rua Oscar Freire, 500',
      city: 'São Paulo',
      state: 'SP',
      commission: 3.0,
      scrapingUrl: 'https://euroville.com.br/veiculos',
    },
  });

  // Veículos
  await prisma.vehicle.upsert({
    where: { externalId: 'DAITAN-001' },
    update: {},
    create: {
      partnerId: daitan.id,
      brand: 'Porsche',
      model: '911 Carrera S',
      version: 'PDK',
      year: 2023,
      mileage: 8500,
      price: 1150000,
      fuel: 'Gasolina',
      transmission: 'PDK',
      color: 'Guards Red',
      description: 'Único dono, revisões em concessionária autorizada.',
      images: [],
      status: VehicleStatus.AVAILABLE,
      externalId: 'DAITAN-001',
    },
  });

  await prisma.vehicle.upsert({
    where: { externalId: 'EURO-001' },
    update: {},
    create: {
      partnerId: euroville.id,
      brand: 'BMW',
      model: 'M4 Competition',
      version: 'xDrive',
      year: 2024,
      mileage: 3200,
      price: 780000,
      fuel: 'Gasolina',
      transmission: 'Automático',
      color: 'Isle of Man Green',
      description: 'Emplacado 2024, teto solar panorâmico, Harman Kardon.',
      images: [],
      status: VehicleStatus.RESERVED,
      externalId: 'EURO-001',
    },
  });

  await prisma.vehicle.upsert({
    where: { externalId: 'EURO-002' },
    update: {},
    create: {
      partnerId: euroville.id,
      brand: 'Audi',
      model: 'RS6 Avant',
      version: 'Performance',
      year: 2022,
      mileage: 22000,
      price: 950000,
      fuel: 'Gasolina',
      transmission: 'Automático',
      color: 'Nardo Gray',
      description: 'Pacote Dynamic Plus, rodas 22", IPVA pago.',
      images: [],
      status: VehicleStatus.AVAILABLE,
      externalId: 'EURO-002',
    },
  });

  await prisma.vehicle.upsert({
    where: { externalId: 'DAITAN-002' },
    update: {},
    create: {
      partnerId: daitan.id,
      brand: 'Land Rover',
      model: 'Defender 110',
      version: 'V8',
      year: 2023,
      mileage: 15000,
      price: 650000,
      fuel: 'Gasolina',
      transmission: 'Automático',
      color: 'Gondwana Stone',
      description: 'Pacote X-Dynamic, 7 lugares, todas as revisões em dia.',
      images: [],
      status: VehicleStatus.SOLD,
      externalId: 'DAITAN-002',
    },
  });

  // Leads
  const porsche = await prisma.vehicle.findUnique({ where: { externalId: 'DAITAN-001' } });
  const bmw = await prisma.vehicle.findUnique({ where: { externalId: 'EURO-001' } });

  const lead1 = await prisma.lead.upsert({
    where: { id: 'seed-lead-001' },
    update: {},
    create: {
      id: 'seed-lead-001',
      name: 'Carlos Mendes',
      phone: '5511991110001',
      email: 'carlos.mendes@gmail.com',
      origin: 'GOOGLE_ADS',
      vehicleId: porsche?.id,
      partnerId: daitan.id,
      status: LeadStatus.QUALIFIED,
      score: 87,
      summary: 'Cliente com renda comprovada acima de R$30k/mês. Interesse no Porsche 911. Aguarda proposta de financiamento.',
    },
  });

  const lead2 = await prisma.lead.upsert({
    where: { id: 'seed-lead-002' },
    update: {},
    create: {
      id: 'seed-lead-002',
      name: 'Fernanda Lima',
      phone: '5511992220002',
      email: 'fernanda.lima@empresa.com',
      origin: 'FACEBOOK_ADS',
      vehicleId: bmw?.id,
      partnerId: euroville.id,
      status: LeadStatus.AI_QUALIFYING,
      score: 62,
      summary: 'Aguardando retorno sobre entrada. Mensagem recebida hoje às 09h via WhatsApp.',
    },
  });

  await prisma.lead.upsert({
    where: { id: 'seed-lead-003' },
    update: {},
    create: {
      id: 'seed-lead-003',
      name: 'Roberto Alves',
      phone: '5511993330003',
      email: null,
      origin: 'ORGANIC',
      status: LeadStatus.NEW,
      score: 40,
    },
  });

  // Interactions para lead1
  await prisma.interaction.createMany({
    data: [
      {
        leadId: lead1.id,
        channel: 'WHATSAPP',
        direction: 'INBOUND',
        content: 'Olá, vi o Porsche 911 no site e quero mais informações sobre financiamento.',
      },
      {
        leadId: lead1.id,
        channel: 'WHATSAPP',
        direction: 'OUTBOUND',
        content: 'Olá Carlos! Tudo bem? Vou te passar as condições disponíveis. Qual seria o valor de entrada?',
      },
    ],
    skipDuplicates: true,
  });

  // Interaction para lead2
  await prisma.interaction.createMany({
    data: [
      {
        leadId: lead2.id,
        channel: 'WHATSAPP',
        direction: 'INBOUND',
        content: 'Tenho interesse no BMW M4. Aceita troca?',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed concluído: 2 parceiros, 4 veículos, 3 leads, 3 interações');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
