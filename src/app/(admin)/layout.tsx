import type { Metadata } from "next";
import { Onest } from 'next/font/google';
import localFont from 'next/font/local';
import "./globals.css";
import { AdminSidebar } from "@/components/admin-sidebar";
import { prisma } from "@/lib/prisma";
import { getActiveStore } from "@/lib/get-store";
import { COMMISSION_PER_VEHICLE } from "@/lib/constants";

const onest = Onest({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-onest',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  preload: true,
});

const calSans = localFont({
  src: '../../../public/fonts/CalSans-SemiBold.woff2',
  variable: '--font-cal',
  display: 'swap',
  weight: '600',
  preload: true,
});

export const metadata: Metadata = {
  title: "motorz | Gestão",
  description: "Painel de controle da plataforma motorz",
  icons: {
    icon: '/assets/images/MZAPP.png',
    apple: '/assets/images/MZAPP.png',
  },
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
        where:  { storeId: store.id, status: "SOLD", updatedAt: { gte: startOfMonth } },
        select: { id: true },
      }),
    ]);

    const goalTotal = partners.reduce((s, p) => s + Number(p.monthlyGoal ?? 0), 0);
    const revenue   = soldThisMonth.length * COMMISSION_PER_VEHICLE;

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
    <html lang="pt-br" className={`${onest.variable} ${calSans.variable} dark`}>
      <body className="antialiased bg-[#09090b] text-zinc-100 min-h-screen selection:bg-primary/20">
        <div className="flex min-h-screen">
          <AdminSidebar meta={meta} />
          <main className="flex-1 min-h-screen overflow-y-auto">
            <div className="p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
