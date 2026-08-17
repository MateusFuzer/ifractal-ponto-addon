import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <div className="flex flex-col h-full w-full">
              <header className="h-[6%] w-full bg-zinc-200">
                <div className="h-full w-full flex items-center gap-2">
                  <Image src={'/logo.png'} alt="Logo" width={50} height={50}/>
                  <span className={`text-zinc-800 ${roboto_mono.className}`}>Meu pontinho</span>
                </div>
              </header>
              <main className="flex flex-1 bg-zinc-100">
                {children}
              </main>
          </div>
      </body>
    </html>
  );
}
