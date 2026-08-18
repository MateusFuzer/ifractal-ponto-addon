"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const HORARIOS_PONTO = [
  { label: "Entrada", hora: "08:00" },
  { label: "Saída almoço", hora: "12:00" },
  { label: "Volta almoço", hora: "13:00" },
  { label: "Saída", hora: "18:00" },
]

const ALERTAS_ANTES_MIN = [5, 2] // Notifica 5min e 2min antes

function parseHora(hora: string): Date {
  const [h, m] = hora.split(":").map(Number)
  const agora = new Date()
  agora.setHours(h, m, 0, 0)
  return agora
}

function pedirPermissao() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}

function enviarNotificacao(titulo: string, corpo: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(titulo, {
      body: corpo,
      icon: "/logo.png",
    })
  }
}

export function PontoReminder() {
  const [permissao, setPermissao] = React.useState<NotificationPermission | "unsupported">(
    "default"
  )
  const [ativo, setAtivo] = React.useState(false)
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([])

  React.useEffect(() => {
    if (!("Notification" in window)) {
      setPermissao("unsupported")
      return
    }
    setPermissao(Notification.permission)
  }, [])

  const ativarLembretes = React.useCallback(() => {
    if (!("Notification" in window)) return

    if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => {
        setPermissao(p)
        if (p === "granted") agendarLembretes()
      })
    } else if (Notification.permission === "granted") {
      agendarLembretes()
    }
  }, [])

  function agendarLembretes() {
    // Limpa timeouts antigos
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    const agora = Date.now()

    for (const ponto of HORARIOS_PONTO) {
      const horaPonto = parseHora(ponto.hora).getTime()

      for (const minAntes of ALERTAS_ANTES_MIN) {
        const momentoAlerta = horaPonto - minAntes * 60 * 1000
        const delay = momentoAlerta - agora

        if (delay > 0) {
          const timeout = setTimeout(() => {
            enviarNotificacao(
              "🕐 Lembrete de Ponto",
              `Faltam ${minAntes} minuto${minAntes > 1 ? "s" : ""} para ${ponto.label.toLowerCase()} (${ponto.hora})`
            )
          }, delay)
          timeoutsRef.current.push(timeout)
        }
      }
    }

    setAtivo(true)
  }

  function desativar() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setAtivo(false)
  }

  // Cleanup ao desmontar
  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  if (permissao === "unsupported") return null

  return (
    <button
      onClick={ativo ? desativar : ativarLembretes}
      className={cn(
        "cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
        ativo
          ? "bg-amber-500 text-white hover:bg-amber-600"
          : "bg-zinc-700 text-white hover:bg-zinc-800"
      )}
    >
      {ativo ? "🔔 Lembretes ativos" : "🔕 Ativar lembretes"}
    </button>
  )
}
