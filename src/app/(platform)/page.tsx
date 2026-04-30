import { Vehicle } from "@/modules/inventory/types";

// Mock Data para validação visual
const MOCK_VEHICLES: Partial<Vehicle>[] = [
  {
    id: '1',
    brand: 'Porsche',
    model: '911 Carrera S',
    year: 2023,
    mileage: 5000,
    price: 1150000,
    transmission: 'PDK',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'],
  },
  {
    id: '2',
    brand: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    mileage: 0,
    price: 780000,
    transmission: 'Automático',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
  },
  {
    id: '3',
    brand: 'Audi',
    model: 'RS6 Avant',
    year: 2022,
    mileage: 12000,
    price: 950000,
    transmission: 'Automático',
    images: ['https://images.unsplash.com/photo-1606148664062-8480392026e7?auto=format&fit=crop&q=80&w=800'],
  }
];

export default function PlatformHome() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center max-w-3xl px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Não compre apenas um carro. <br />
            <span className="text-blue-500">Encontre o seu ativo.</span>
          </h1>
          <p className="text-xl text-zinc-300 mb-8 font-medium">
            Consultoria especializada em veículos premium. Curadoria total e aprovação de crédito simplificada.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20">
              Ver Estoque Curado
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              Avaliar meu Crédito
            </button>
          </div>
        </div>
      </section>

      {/* Vitrine Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-zinc-900">Estoque em Destaque</h2>
            <p className="text-zinc-500">Veículos selecionados com garantia de procedência.</p>
          </div>
          <button className="text-blue-600 font-bold hover:underline">Ver todos</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_VEHICLES.map((vehicle) => (
            <div key={vehicle.id} className="group bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={vehicle.images?.[0]} 
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-900">
                  {vehicle.year}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{vehicle.brand}</h3>
                    <h4 className="text-xl font-bold text-zinc-900">{vehicle.model}</h4>
                  </div>
                  <p className="text-xl font-black text-zinc-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price || 0)}
                  </p>
                </div>
                <div className="flex gap-4 mt-4 text-xs text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">📍 {vehicle.mileage?.toLocaleString()} km</span>
                  <span className="flex items-center gap-1">⚙️ {vehicle.transmission}</span>
                </div>
                <button className="w-full mt-6 bg-zinc-100 group-hover:bg-blue-600 group-hover:text-white text-zinc-900 font-bold py-3 rounded-2xl transition-all">
                  Tenho Interesse
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
