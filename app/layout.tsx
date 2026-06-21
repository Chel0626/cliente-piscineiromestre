import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Bloco de SEO e Informações (Sem o themeColor)
export const metadata: Metadata = {
  title: "Piscineiro Mestre",
  description: "Painel do Cliente - Manutenção de Piscinas",
  manifest: "/manifest.json",
};

// 2. NOVO: Bloco de visualização da tela (Viewport)
export const viewport: Viewport = {
  themeColor: "#0891b2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-200">
        
        {/* Conteúdo Principal do App */}
        {children}

        {/* --- INÍCIO DO RODAPÉ (ASSINATURA) --- */}
        <footer className="w-full py-6 px-4 mt-auto text-center pb-8">
          <p className="text-xs text-slate-500 tracking-tight font-medium">
            Cliente Piscineiro Mestre • © {new Date().getFullYear()} • by{" "}
            <span className="text-cyan-700 font-bold">
              Michel Henrique
            </span>
          </p>
        </footer>
        {/* --- FIM DO RODAPÉ --- */}

      </body>
    </html>
  );
}