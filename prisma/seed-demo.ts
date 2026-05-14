/**
 * Seed de demonstração — Hub de Suzano
 * Propósito: popular o estoque com 15 carros reais para apresentação.
 * Uso: npx tsx prisma/seed-demo.ts
 * Seguro de re-executar (upsert via externalId e CNPJ).
 */

import { PrismaClient, VehicleStatus } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Helper ──────────────────────────────────────────────────────────────────

function desc(marca: string, modelo: string, versao: string, ano: number, km: number): string {
  const kmFmt = km.toLocaleString('pt-BR')
  return (
    `${marca} ${modelo} ${versao} ${ano} com apenas ${kmFmt} km rodados. ` +
    `Veículo em excelente estado de conservação, revisado e com documentação em dia. ` +
    `Laudo cautelar aprovado. Financiamento facilitado, aceitamos seu usado na troca. ` +
    `Consulte condições especiais com nossos consultores.`
  )
}

// ─── Dados ───────────────────────────────────────────────────────────────────

const CARROS = [
  {
    brand: 'Volkswagen', model: 'Polo', version: 'Track 1.0 MPI',
    year: 2024, mileage: 8_200, price: 84_990,
    fuel: 'Flex', transmission: 'Manual', color: 'Prata',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Toyota', model: 'Corolla Cross', version: 'XRE 2.0 Flex',
    year: 2024, mileage: 12_500, price: 189_990,
    fuel: 'Flex', transmission: 'CVT', color: 'Branco Polar',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Hyundai', model: 'HB20', version: 'Diamond 1.0 Turbo',
    year: 2024, mileage: 5_800, price: 99_900,
    fuel: 'Flex', transmission: 'Automático', color: 'Azul Intense',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Fiat', model: 'Argo', version: 'Drive 1.3 Firefly',
    year: 2024, mileage: 14_200, price: 79_900,
    fuel: 'Flex', transmission: 'Manual', color: 'Vermelho Indiano',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Honda', model: 'Civic', version: 'EXL 2.0 CVT',
    year: 2023, mileage: 22_000, price: 147_000,
    fuel: 'Flex', transmission: 'CVT', color: 'Preto Cristal',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Chevrolet', model: 'Tracker', version: 'Premier 1.2 Turbo',
    year: 2024, mileage: 9_300, price: 162_990,
    fuel: 'Flex', transmission: 'Automático', color: 'Branco Summit',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Jeep', model: 'Compass', version: 'Longitude 1.3 T270',
    year: 2023, mileage: 28_500, price: 178_000,
    fuel: 'Flex', transmission: 'Automático', color: 'Cinza Granite',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Toyota', model: 'Hilux', version: 'SR 2.8 TDI 4x4 CD',
    year: 2023, mileage: 35_000, price: 252_000,
    fuel: 'Diesel', transmission: 'Automático', color: 'Prata Névoa',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Volkswagen', model: 'T-Cross', version: 'Highline 1.4 TSI',
    year: 2023, mileage: 18_700, price: 152_900,
    fuel: 'Flex', transmission: 'Automático', color: 'Branco Cristal',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Renault', model: 'Kwid', version: 'Intense 1.0 SCe',
    year: 2024, mileage: 6_100, price: 72_990,
    fuel: 'Flex', transmission: 'Manual', color: 'Laranja',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Fiat', model: 'Pulse', version: 'Audace 1.0 Turbo',
    year: 2023, mileage: 20_400, price: 112_990,
    fuel: 'Flex', transmission: 'Automático', color: 'Cinza Urban',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Ford', model: 'Territory', version: 'Titanium Plus 1.5 EcoBoost',
    year: 2023, mileage: 31_200, price: 189_000,
    fuel: 'Flex', transmission: 'Automático', color: 'Preto Shadow',
    status: VehicleStatus.RESERVED,
  },
  {
    brand: 'Jeep', model: 'Renegade', version: 'Sport 1.3 T270',
    year: 2024, mileage: 7_600, price: 119_990,
    fuel: 'Flex', transmission: 'Automático', color: 'Branco',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Honda', model: 'HR-V', version: 'Touring 1.5 VTEC Turbo',
    year: 2023, mileage: 25_800, price: 175_000,
    fuel: 'Flex', transmission: 'CVT', color: 'Preto Cristal',
    status: VehicleStatus.AVAILABLE,
  },
  {
    brand: 'Toyota', model: 'Yaris', version: 'Sedan XLS Connect 1.5 CVT',
    year: 2023, mileage: 19_500, price: 112_000,
    fuel: 'Flex', transmission: 'CVT', color: 'Prata Cintilante',
    status: VehicleStatus.AVAILABLE,
  },
] as const

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seed Demo — Hub de Suzano\n')

  // 1. Store
  const store = await prisma.store.findUniqueOrThrow({ where: { slug: 'motorz' } })
  console.log(`✅ Store: ${store.name} (${store.id})`)

  // 2. Partner
  const partner = await prisma.partner.upsert({
    where:  { document: '12897456000183' },
    update: {},
    create: {
      storeId:     store.id,
      name:        'Hub de Suzano',
      document:    '12897456000183',
      email:       'contato@hubdesuzano.com.br',
      phone:       '1147890000',
      address:     'Av. Francisco Marengo, 1500',
      city:        'Suzano',
      state:       'SP',
      commission:  2.5,
      monthlyGoal: 80_000,
      locationNote: '25 min do Centro de São Paulo pela Rodovia Ayrton Senna',
      isActive:    true,
    },
  })
  console.log(`✅ Partner: ${partner.name} (${partner.id})\n`)

  // 3. Veículos
  let criados = 0
  let existentes = 0

  for (const [i, carro] of CARROS.entries()) {
    const externalId = `DEMO-HUB-${String(i + 1).padStart(3, '0')}`

    const vehicle = await prisma.vehicle.upsert({
      where:  { externalId },
      update: {
        price:       carro.price,
        mileage:     carro.mileage,
        status:      carro.status,
      },
      create: {
        storeId:     store.id,
        partnerId:   partner.id,
        externalId,
        brand:       carro.brand,
        model:       carro.model,
        version:     carro.version,
        year:        carro.year,
        mileage:     carro.mileage,
        price:       carro.price,
        fuel:        carro.fuel,
        transmission: carro.transmission,
        color:       carro.color,
        status:      carro.status,
        description: desc(carro.brand, carro.model, carro.version, carro.year, carro.mileage),
        images:      [],
        lastSyncAt:  new Date(),
      },
    })

    const isNew = vehicle.createdAt.getTime() === vehicle.updatedAt.getTime()
    if (isNew) {
      criados++
      console.log(`  ➕ ${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.year} — R$ ${Number(vehicle.price).toLocaleString('pt-BR')}`)
    } else {
      existentes++
      console.log(`  ♻️  ${vehicle.brand} ${vehicle.model} ${vehicle.year} (atualizado)`)
    }
  }

  console.log(`\n✅ Concluído: ${criados} criados, ${existentes} atualizados.`)
  console.log(`   Parceiro: ${partner.name} | Store: ${store.name}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
