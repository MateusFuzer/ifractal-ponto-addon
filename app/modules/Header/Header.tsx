"use client"

import * as React from "react"
import { PontoReminder } from "@/app/modules/PontoReminder/PontoReminder"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const [configOpen, setConfigOpen] = React.useState(false)
  const [perfilOpen, setPerfilOpen] = React.useState(false)
  const [notificacoesAtivas, setNotificacoesAtivas] = React.useState(false)
  const [apiLogin, setApiLogin] = React.useState("")
  const [apiSenha, setApiSenha] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  // Perfil
  const [perfilNome, setPerfilNome] = React.useState("")
  const [perfilEmail, setPerfilEmail] = React.useState("")
  const [perfilSenha, setPerfilSenha] = React.useState("")
  const [perfilSaving, setPerfilSaving] = React.useState(false)
  const [perfilSaved, setPerfilSaved] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("api_credentials")
    if (stored) {
      const { login, senha } = JSON.parse(stored)
      setApiLogin(login || "")
      setApiSenha(senha || "")
    }
    const user = localStorage.getItem("user")
    if (user) {
      const { name, email } = JSON.parse(user)
      setPerfilNome(name || "")
      setPerfilEmail(email || "")
    }
  }, [])

  function salvarCredenciais() {
    setSaving(true)
    localStorage.setItem("api_credentials", JSON.stringify({ login: apiLogin, senha: apiSenha }))
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 500)
  }

  function salvarPerfil() {
    setPerfilSaving(true)
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const updated = { ...user, name: perfilNome, email: perfilEmail }
    if (perfilSenha) updated.password = perfilSenha
    localStorage.setItem("user", JSON.stringify(updated))
    setTimeout(() => {
      setPerfilSaving(false)
      setPerfilSaved(true)
      setPerfilSenha("")
      setTimeout(() => setPerfilSaved(false), 2000)
    }, 500)
  }

  function toggleNotificacoes() {
    if (!notificacoesAtivas) {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then((p) => {
          if (p === "granted") setNotificacoesAtivas(true)
        })
      } else {
        setNotificacoesAtivas(true)
      }
    } else {
      setNotificacoesAtivas(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 h-16 w-full bg-zinc-200 shadow-sm">
        <div className="h-full w-full flex items-center justify-between px-6">
          <span className="text-lg text-zinc-800 font-semibold font-mono">Meu ponto</span>
          <div className="flex items-center gap-3">
            <button className="cursor-pointer rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700">
              Registrar ponto
            </button>

            <DropdownMenuTrigger>
              <Button variant="outline" size="icon" aria-label="Menu">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <DropdownMenu placement="bottom end" className="min-w-[240px]">
                <DropdownMenuItem onAction={() => setPerfilOpen(true)} className="py-2.5 text-sm">
                  <svg className="size-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Meu perfil
                </DropdownMenuItem>
                <DropdownMenuItem onAction={() => setConfigOpen(true)} className="py-2.5 text-sm">
                  <svg className="size-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.007.38.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurar API
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onAction={toggleNotificacoes} className="py-2.5 text-sm">
                  <svg className="size-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {notificacoesAtivas ? "Desativar lembretes" : "Ativar lembretes"}
                </DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
          </div>
        </div>
      </header>

      {/* Modal Configurar API */}
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
            onClick={salvarCredenciais}
            disabled={saving || !apiLogin || !apiSenha}
            className={cn(
              "mt-2 w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all",
              saved ? "bg-green-600" : "bg-zinc-800 hover:bg-zinc-700",
              (saving || !apiLogin || !apiSenha) && "cursor-not-allowed opacity-60"
            )}
          >
            {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar credenciais"}
          </button>
        </div>
      </Dialog>

      {/* Modal Perfil */}
      <Dialog
        isOpen={perfilOpen}
        onOpenChange={(open) => {
          if (!open) setPerfilOpen(false)
        }}
      >
        <DialogTitle>Editar Perfil</DialogTitle>
        <p className="mt-1 text-xs text-zinc-500">
          Atualize seu nome, email ou senha.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Nome</label>
            <input
              type="text"
              value={perfilNome}
              onChange={(e) => setPerfilNome(e.target.value)}
              placeholder="Seu nome"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Email</label>
            <input
              type="email"
              value={perfilEmail}
              onChange={(e) => setPerfilEmail(e.target.value)}
              placeholder="seu@email.com"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Nova senha (deixe vazio para manter)</label>
            <input
              type="password"
              value={perfilSenha}
              onChange={(e) => setPerfilSenha(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <button
            onClick={salvarPerfil}
            disabled={perfilSaving || !perfilNome || !perfilEmail}
            className={cn(
              "mt-2 w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all",
              perfilSaved ? "bg-green-600" : "bg-zinc-800 hover:bg-zinc-700",
              (perfilSaving || !perfilNome || !perfilEmail) && "cursor-not-allowed opacity-60"
            )}
          >
            {perfilSaving ? "Salvando..." : perfilSaved ? "✓ Salvo!" : "Salvar perfil"}
          </button>
        </div>
      </Dialog>
    </>
  )
}
