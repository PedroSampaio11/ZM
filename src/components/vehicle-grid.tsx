'use client';

import { useState } from 'react';
import { Vehicle } from "@/modules/inventory/types";
import { LeadCaptureModal } from '@/components/lead-capture-modal';

interface VehicleGridProps {
  vehicles: Vehicle[];
}

export function VehicleGrid({ vehicles }: VehicleGridProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInterest = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="group bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:shadow-2xl transition-all duration-300">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800'} 
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
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(vehicle.price) || 0)}
                </p>
              </div>
              <div className="flex gap-4 mt-4 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-1">📍 {vehicle.mileage?.toLocaleString()} km</span>
                <span className="flex items-center gap-1">⚙️ {vehicle.transmission}</span>
              </div>
              <button 
                onClick={() => handleInterest(vehicle)}
                className="w-full mt-6 bg-zinc-100 group-hover:bg-blue-600 group-hover:text-white text-zinc-900 font-bold py-3 rounded-2xl transition-all"
              >
                Tenho Interesse
              </button>
            </div>
          </div>
        ))}
      </div>

      <LeadCaptureModal 
        vehicle={selectedVehicle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
