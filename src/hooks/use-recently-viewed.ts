'use client';
import { useState, useEffect } from 'react';

export type RecentVehicle = {
  id:    string;
  brand: string;
  model: string;
  year:  number;
  price: number;
  image: string | null;
};

const KEY = 'mz_recent';
const MAX = 8;

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentVehicle[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as RecentVehicle[]);
    } catch {}
  }, []);

  function track(v: RecentVehicle) {
    setItems(prev => {
      const next = [v, ...prev.filter(x => x.id !== v.id)].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return { items, track };
}
