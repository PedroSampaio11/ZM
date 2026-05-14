import { redirect } from 'next/navigation'
import { getActiveStore } from '@/lib/get-store'
import { prisma } from '@/lib/prisma'
import { VehicleForm } from './vehicle-form'

export const metadata = { title: 'Novo veículo — motorz' }

export default async function NovoVeiculoPage() {
  const store = await getActiveStore()
  if (!store) redirect('/gestao')

  const partners = await prisma.partner.findMany({
    where:   { storeId: store.id, isActive: true },
    select:  { id: true, name: true, city: true },
    orderBy: { name: 'asc' },
  })

  if (!partners.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <p className="text-zinc-400 font-medium">Nenhum parceiro cadastrado.</p>
        <p className="text-zinc-600 text-sm">Cadastre um parceiro antes de adicionar veículos.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <VehicleForm partners={partners} />
    </div>
  )
}
