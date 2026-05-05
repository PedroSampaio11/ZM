import { prisma } from "@/lib/prisma";
import { VehicleGrid } from "@/components/vehicle-grid";
import { Vehicle } from "@/modules/inventory/types";

export default async function PlatformHome() {
  const rawVehicles = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' },
    take: 9,
  });

  const vehicles: Vehicle[] = rawVehicles.map(v => ({
    ...v,
    price: Number(v.price),
  }));

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
            CURADORIA <br />
            <span className="text-primary">AUTOMOTIVA.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-10 font-medium max-w-2xl mx-auto">
            Não somos apenas um classificado. Somos sua assessoria premium na escolha do próximo ativo.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40">
              Explorar Estoque
            </button>
            <button className="bg-white/5 backdrop-blur-xl text-white border border-white/10 px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all">
              Falar com Consultor
            </button>
          </div>
        </div>
      </section>

      {/* Vitrine Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-black text-foreground tracking-tight">Estoque Selecionado</h2>
            <p className="text-muted-foreground text-lg">Veículos com procedência garantida e inspeção rigorosa.</p>
          </div>
          <button className="px-6 py-2 border-2 border-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all text-primary">
            Ver Catálogo Completo
          </button>
        </div>

        {vehicles.length > 0 ? (
          <VehicleGrid vehicles={vehicles} />
        ) : (
          <div className="text-center py-20 bg-card rounded-[40px] border-2 border-dashed border-white/5">
            <p className="text-muted-foreground font-bold">Nenhum veículo disponível no momento.</p>
          </div>
        )}
      </section>
    </div>
  );
}
