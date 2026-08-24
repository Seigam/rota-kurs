import type { Metadata } from "next";
import "./globals.css";
import { NextAuthSessionProvider } from "@/components/providers/session-provider";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "FutuRoute | Hayat Boyu Öğrenme",
  description: "Lise öğrencileri için kişiselleştirilmiş kariyer, aile ve psikolojik rehberlik keşif platformu. Kişilik testini çöz, kariyer hedefini belirle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem('futuroute-theme');var theme=saved||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;}catch(e){document.documentElement.dataset.theme='light';}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col selection:bg-indigo-500 selection:text-white">
        <NextAuthSessionProvider>
          <a href="#ana-icerik" className="skip-link">
            Ana içeriğe geç
          </a>
          <AppShell>{children}</AppShell>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
