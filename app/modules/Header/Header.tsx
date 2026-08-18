"use client"

import { PontoReminder } from "@/app/modules/PontoReminder/PontoReminder"

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-zinc-200 shadow-sm">
      <div className="h-full w-full flex items-center justify-between px-6">
        <span className="text-lg text-zinc-800 font-semibold font-mono">Meu ponto</span>
        <div className="flex items-center gap-3">
          <PontoReminder />
          <button className="cursor-pointer rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700">
            Registrar ponto
          </button>
        </div>
      </div>
    </header>
  )
}
