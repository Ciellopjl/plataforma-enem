import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plataforma ENEM 2026",
  description: "A melhor plataforma de estudos gamificada para o ENEM 2026",
  icons: {
    icon: "/logo-enem.png",
    shortcut: "/logo-enem.png",
    apple: "/logo-enem.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Providers } from "@/components/Providers";
import { AiTutor } from "@/components/ui/ai-tutor";
import { Heartbeat } from "@/components/auth/heartbeat";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={cn(inter.className, "antialiased bg-black text-zinc-100 min-h-screen selection:bg-primary-500/30")}>
        <Providers>
          <Navbar />
          <AnnouncementBanner />
          {/* Padding superior para Desktop (Navbar Top) e Padding inferior para Mobile (Navbar Bottom) */}
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 pb-32 md:pb-16 transition-all duration-300">
            <div className="animate-in fade-in duration-1000">
              {children}
            </div>
          </main>
          <AiTutor />
          <Heartbeat />
        </Providers>
        
        {/* Background glow global sênior */}
        
        {/* Background glow global sênior */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/10 blur-[150px] rounded-full" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[150px] rounded-full" />
        </div>
      </body>
    </html>
  );
}
