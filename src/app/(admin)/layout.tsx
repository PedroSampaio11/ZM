import type { Metadata } from "next";
import "./globals.css";
import { AdminSidebar } from "@/components/admin-sidebar";
import { prisma } from "@/lib/prisma";
import { getActiveStore } from "@/lib/get-store";

export const metadata: Metadata = {
  title: "motorz | Admin",
  description: "Painel de controle da plataforma motorz",
};

async function getSidebarMeta() {
  try {
    const store = await getActiveStore();
    if (!store) return null;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [partners, soldThisMonth] = await Promise.all([
      prisma.partner.findMany({
        where:  { storeId: store.id, isActive: true },
        select: { monthlyGoal: true },
      }),
      prisma.vehicle.findMany({
        where:   { storeId: store.id, status: "SOLD", updatedAt: { gte: startOfMonth } },
        select:  { price: true, partner: { select: { commission: true } } },
      }),
    ]);

    const goalTotal = partners.reduce((s, p) => s + Number(p.monthlyGoal ?? 0), 0);
    const revenue   = soldThisMonth.reduce((s, v) => {
      return s + Number(v.price) * (Number(v.partner.commission) / 100);
    }, 0);

    return { goalTotal, revenue };
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const meta = await getSidebarMeta();

  return (
    <html lang="pt-br" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-100 min-h-screen font-sans selection:bg-blue-500/30">
        <div className="flex">
          <AdminSidebar meta={meta} />
          <main className="flex-1 min-h-screen overflow-y-auto bg-grid">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
