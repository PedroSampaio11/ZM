import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoreBrain | Dashboard",
  description: "Sistema Operacional de Inteligência FourCoders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="antialiased bg-grid min-h-screen">
        {children}
      </body>
    </html>
  );
}
