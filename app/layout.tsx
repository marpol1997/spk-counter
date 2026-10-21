import type { Metadata } from "next";
import { Cinzel, Fraunces, Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400","600","700","900"], variable: "--font-cinzel", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const metadata: Metadata = {
  title: "✝ Боевой счётчик · СПК 🌸",
  description: "Считаем победы над Теплогазом. Между небом и землёй.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✝</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${cinzel.variable} ${fraunces.variable} ${geist.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-center" richColors closeButton theme="dark" />
      </body>
    </html>
  );
}