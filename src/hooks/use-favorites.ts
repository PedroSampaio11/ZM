'use client';
import { useState, useEffect } from 'react';

export type FavVehicle = {
  id:    string;
  brand: string;
  model: string;
  year:  number;
  price: number;
  image: string | null;
};

const KEY = 'mz_favorites';

export function useFavorites() {
  const [items, setItems]   = useState<FavVehicle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as FavVehicle[]);
    } catch {}
  }, []);

  function toggle(v: FavVehicle) {
    setItems(prev => {
      const exists = prev.some(x => x.id === v.id);
      const next   = exists ? prev.filter(x => x.id !== v.id) : [v, ...prev];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function isFav(id: string) {
    return mounted && items.some(x => x.id === id);
  }

  return { items, toggle, isFav, mounted };
}
