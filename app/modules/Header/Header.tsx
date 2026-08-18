"use client"

import * as React from "react"
import { PontoReminder } from "@/app/modules/PontoReminder/PontoReminder"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function Header() {
  const [configOpen, setConfigOpen] = React.useState(false)
  const [apiLogin, setApiLogin] = React.useState("")
  const [apiSenha, setApiSenha] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  // Carrega credenciais salvas ao montar
  React.useEffect(() => {
    const stored = localStorage.getItem("api_credentials")
    if (stored) {
      const { login, senha } = JSON.parse(stored)
      setApiLogin(login || "")
      setApiSenha(senha || "")
    }
  }, [])

  function salvar() {
    setSaving(true)
    // Salva no localStorage (depois migra pro banco via API)
    localStorage.setItem("api_credentials", JSON.stringify({ login: apiLogin, senha: apiSenha }))
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 500)
  }

  return (
    <>
      <header className="sticky top-0 z-40 h-16 w-full bg-zinc-200 shadow-sm">
        <div className="h-full w-full flex items-center justify-between px-6">
          <span className="text-lg text-zinc-800 font-semibold font-mono">Meu ponto</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfigOpen(true)}
              className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              ⚙️ Configurar API
            </button>
            <PontoReminder />
            <button className="cursor-pointer rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700">
              Registrar ponto
            </button>
          </div>
        </div>
      </header>

      <Dialog
        isOpen={configOpen}
        onOpenChange={(open) => {
          if (!open) setConfigOpen(false)
        }}
      >
        <DialogTitle>Credenciais da API de Ponto</DialogTitle>
        <p className="mt-1 text-xs text-zinc-500">
          Login e senha usados para sincronizar e registrar ponto na API do terceiro.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Login / Matrícula</label>
            <input
              type="text"
              value={apiLogin}
              onChange={(e) => setApiLogin(e.target.value)}
              placeholder="Ex: 12345 ou usuario@empresa.com"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Senha</label>
            <input
              type="password"
              value={apiSenha}
              onChange={(e) => setApiSenha(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <button
            onClick={salvar}
            disabled={saving || !apiLogin || !apiSenha}
            className={cn(
              "mt-2 w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all",
              saved
                ? "bg-green-600"
                : "bg-zinc-800 hover:bg-zinc-700",
              (saving || !apiLogin || !apiSenha) && "cursor-not-allowed opacity-60"
            )}
          >
            {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar credenciais"}
          </button>
        </div>
      </Dialog>
    </>
  )
}
