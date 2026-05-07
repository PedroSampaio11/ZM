import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed: criando store base motorz...')

  const store = await prisma.store.upsert({
    where:  { slug: 'motorz' },
    update: {},
    create: {
      name:     'motorz',
      slug:     'motorz',
      plan:     'PROFESSIONAL',
      isActive: true,
      // ownerId: defina após rodar — ver instruções abaixo
    },
  })

  console.log(`✅ Store criada: ${store.name} (id: ${store.id})`)
  console.log('')
  console.log('👉 Para vincular ao seu usuário (opcional mas recomendado):')
  console.log('   Supabase Dashboard → Authentication → Users → copie seu UUID')
  console.log('   Execute no SQL Editor:')
  console.log(`   UPDATE "Store" SET "ownerId" = '<seu-uuid>' WHERE slug = 'motorz';`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
