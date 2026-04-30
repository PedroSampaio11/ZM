import type { Metadata } from "next";
import "./globals.css";
import { AdminSidebar } from "@/components/admin-sidebar";

export const metadata: Metadata = {
  title: "Super Loja | Admin",
  description: "Painel de controle da plataforma Super Loja",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-100 min-h-screen font-sans selection:bg-blue-500/30">
        <div className="flex">
          <AdminSidebar />
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
