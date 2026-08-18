import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CalendarCustomDays } from "./modules/CalenderHistoric/CalenderHistorico";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const roboto_mono = Roboto_Mono({
  weight: '400'
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meu pontinho",
  description: "Hehehe",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
          <div className="flex flex-col h-full w-full">
              <header className="sticky top-0 z-40 h-16 w-full bg-zinc-200 shadow-sm">
                <div className="h-full w-full flex items-center justify-between p-6">
                  <span className={`text-lg text-zinc-800 font-semibold ${roboto_mono.className}`}>Meu ponto</span>
                  <button className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700">
                    Registrar ponto
                  </button>
                </div>
              </header>
              <main className="flex flex-1 bg-zinc-100">
                <CalendarCustomDays/>
              </main>
          </div>
      </body>
    </html>
  );
}
