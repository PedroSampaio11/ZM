import type { Metadata } from "next";
import "../(admin)/globals.css"; // Reutilizando os estilos base

export const metadata: Metadata = {
  title: "Super Loja | Consultoria Automotiva",
  description: "A melhor seleção de veículos com garantia e procedência.",
};

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="antialiased bg-zinc-50 text-zinc-900 min-h-screen font-sans">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">SL</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900 uppercase">
                  Super<span className="text-blue-600">Loja</span>
                </span>
              </div>
              <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-600">
                <a href="#" className="hover:text-blue-600 transition-colors">Estoque</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Como Funciona</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Sobre</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Contato</a>
              </nav>
              <button className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition-all">
                Falar com Consultor
              </button>
            </div>
          </div>
        </header>
        
        <main>{children}</main>

        <footer className="bg-white border-t py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-zinc-500 text-sm">© 2026 Super Loja. Todos os direitos reservados.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
