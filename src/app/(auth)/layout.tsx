import "@/app/(admin)/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: '/assets/images/MZAPP.png',
    apple: '/assets/images/MZAPP.png',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
