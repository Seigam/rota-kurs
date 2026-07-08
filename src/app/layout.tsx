import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthSessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ROTA | Lise RPG Kariyer & Rehberlik Platformu",
  description: "Lise öğrencileri için oyunlaştırılmış RPG temelli kariyer, aile ve psikolojik rehberlik keşif platformu. Kişilik tipini keşfet, kariyer rotanı çiz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-indigo-500 selection:text-white">
        <NextAuthSessionProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
