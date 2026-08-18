"use client"

import * as React from "react"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Função para gerar uma variação determinística e realista de horas trabalhadas por dia
function getValorDoDia(date: Date): string | null {
  const dayOfWeek = date.getDay()

  // Sábado (6) e Domingo (0) são dias de folga
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return null
  }

  // Gera uma variação fixada em minutos (entre 0 e 45 min) baseada no dia/mês
  const dayNumber = date.getDate()
  const monthNumber = date.getMonth()
  const variationMinutes = ((dayNumber * 7 + monthNumber * 13) % 10) * 5

  const hours = 8
  const minutes = variationMinutes < 10 ? `0${variationMinutes}` : `${variationMinutes}`

  return `${hours}h ${minutes}m`
}

const JORNADA_MINUTOS = 8 * 60

// Converte "8h 15m" em minutos
function paraMinutos(valor: string): number {
  const [horas, minutos] = valor.split(" ")
  return Number(horas.replace("h", "")) * 60 + Number(minutos.replace("m", ""))
}

function formatarHora(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function formatarSaldo(minutos: number): string {
  const sinal = minutos < 0 ? "-" : "+"
  const absoluto = Math.abs(minutos)
  return `${sinal}${Math.floor(absoluto / 60)}h ${String(absoluto % 60).padStart(2, "0")}m`
}

// Marcações do dia derivadas do total trabalhado (1h de almoço)
function getPontosDoDia(date: Date) {
  const valor = getValorDoDia(date)
  if (!valor) return null

  const trabalhado = paraMinutos(valor)
  const entrada = 8 * 60
  const saidaAlmoco = 12 * 60
  const voltaAlmoco = 13 * 60
  const saida = voltaAlmoco + (trabalhado - (saidaAlmoco - entrada))

  return {
    valor,
    saldo: trabalhado - JORNADA_MINUTOS,
    marcacoes: [
      { rotulo: "Entrada", hora: formatarHora(entrada) },
      { rotulo: "Saída almoço", hora: formatarHora(saidaAlmoco) },
      { rotulo: "Volta almoço", hora: formatarHora(voltaAlmoco) },
      { rotulo: "Saída", hora: formatarHora(saida) },
    ],
  }
}

// Saldo acumulado do início do ano até a data de referência
function getBancoDeHoras(referencia: Date): number {
  const cursor = new Date(referencia.getFullYear(), 0, 1)
  let saldo = 0

  while (cursor <= referencia) {
    const valor = getValorDoDia(cursor)
    if (valor) saldo += paraMinutos(valor) - JORNADA_MINUTOS
    cursor.setDate(cursor.getDate() + 1)
  }

  return saldo
}

// Tipo dos dados sincronizados
type DayStatus = "idle" | "loading" | "success" | "error"
type DaySyncData = {
  status: DayStatus
  valor?: string
}

// Chave única para um dia: "month-day"
function dayKey(monthIndex: number, day: number) {
  return `${monthIndex}-${day}`
}

// Os 12 meses são memoizados: abrir/fechar o modal não precisa renderizar de novo
// os ~365 botões de dia, o que deixava a interação travada.
const GradeDeMeses = React.memo(function GradeDeMeses({
  year,
  mesAtual,
  onSelecionarDia,
}: {
  year: number
  mesAtual: number
  onSelecionarDia: (date: Date) => void
}) {
  const months = React.useMemo(
    () => Array.from({ length: 12 }, (_, index) => new Date(year, index, 1)),
    [year]
  )

  const mesAtualRef = React.useRef<HTMLDivElement>(null)

  // Estado de sincronização por dia
  const [daySync, setDaySync] = React.useState<Record<string, DaySyncData>>({})
  const [syncLoading, setSyncLoading] = React.useState<Record<number, boolean>>({})
  const [lastSync, setLastSync] = React.useState<Record<number, string>>({})

  React.useEffect(() => {
    mesAtualRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [])

  const sincronizar = React.useCallback(async (monthIndex: number) => {
    // Descobre dias úteis do mês
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const diasUteis: number[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIndex, d)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        diasUteis.push(d)
      }
    }

    // Marca todos como loading
    setSyncLoading((prev) => ({ ...prev, [monthIndex]: true }))
    setDaySync((prev) => {
      const next = { ...prev }
      for (const d of diasUteis) {
        next[dayKey(monthIndex, d)] = { status: "loading" }
      }
      return next
    })

    // Faz uma requisição por dia (em paralelo)
    const results = await Promise.allSettled(
      diasUteis.map(async (d) => {
        const res = await fetch(`/api/sync?year=${year}&month=${monthIndex}&day=${d}`)
        if (!res.ok) throw new Error("Falha")
        const data = await res.json()
        return { day: d, valor: data.valor as string }
      })
    )

    // Atualiza estado por dia
    setDaySync((prev) => {
      const next = { ...prev }
      for (let i = 0; i < diasUteis.length; i++) {
        const d = diasUteis[i]
        const result = results[i]
        if (result.status === "fulfilled") {
          next[dayKey(monthIndex, d)] = { status: "success", valor: result.value.valor }
        } else {
          next[dayKey(monthIndex, d)] = { status: "error" }
        }
      }
      return next
    })

    setSyncLoading((prev) => ({ ...prev, [monthIndex]: false }))
    setLastSync((prev) => ({ ...prev, [monthIndex]: new Date().toISOString() }))
  }, [year])

  return (
    <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {months.map((month) => {
        const nomeMes = month.toLocaleString("pt-BR", { month: "long" })
        const isAtual = month.getMonth() === mesAtual
        const monthIndex = month.getMonth()
        const isLoading = syncLoading[monthIndex] ?? false
        const ultimaSync = lastSync[monthIndex]

        return (
          <div
            key={month.toISOString()}
            ref={isAtual ? mesAtualRef : undefined}
            className={cn(
              "flex flex-col items-center rounded-2xl border p-4 shadow-sm",
              isAtual
                ? "border-green-300 bg-green-50/70 ring-2 ring-green-200"
                : "border-zinc-200 bg-zinc-50/70"
            )}
          >
            <div className="mb-4 text-center text-base font-bold capitalize text-zinc-800">
              {nomeMes}
            </div>

            <Calendar
              month={month}
              numberOfMonths={1}
              hideNavigation
              disableNavigation
              showOutsideDays={false}
              className="w-full p-0"
              onDayClick={onSelecionarDia}
              components={{
                DayButton: ({ children, modifiers, day, className, ...props }) => {
                  const key = dayKey(monthIndex, day.date.getDate())
                  const sync = daySync[key]
                  const valor = sync?.valor ?? getValorDoDia(day.date)
                  const abaixoDaJornada = valor && paraMinutos(valor) < JORNADA_MINUTOS
                  const isLoadingDay = sync?.status === "loading"
                  const isError = sync?.status === "error"

                  return (
                    <CalendarDayButton
                      day={day}
                      modifiers={modifiers}
                      {...props}
                      className={cn(
                        className,
                        "cursor-pointer group-data-[focused=true]/day:border-transparent group-data-[focused=true]/day:ring-0",
                        isError && "bg-red-50"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-bold leading-none",
                        isError ? "text-red-600" : "text-zinc-800"
                      )}>
                        {children}
                      </span>
                      {!modifiers.outside && isLoadingDay && (
                        <svg className="mt-1 size-3 animate-spin text-zinc-400" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {!modifiers.outside && !isLoadingDay && isError && (
                        <span className="mt-1 text-[9px] font-semibold leading-none text-red-500">
                          erro
                        </span>
                      )}
                      {!modifiers.outside && !isLoadingDay && !isError && valor && (
                        <span className={cn(
                          "mt-1 text-[10px] font-semibold leading-none",
                          abaixoDaJornada ? "text-red-600" : "text-green-600"
                        )}>
                          {valor}
                        </span>
                      )}
                    </CalendarDayButton>
                  )
                },
              }}
            />

            <div className="mt-4 flex w-full flex-col items-center gap-1">
              <button
                disabled={isLoading}
                onClick={() => sincronizar(monthIndex)}
                className={cn(
                  "w-full cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100",
                  isLoading && "cursor-not-allowed opacity-60"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sincronizando...
                  </span>
                ) : (
                  "Sincronizar"
                )}
              </button>
              <span className="text-[10px] text-zinc-400">
                {ultimaSync
                  ? `Última sinc: ${new Date(ultimaSync).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
                  : "Não sincronizado"}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
})

export function CalendarCustomDays() {
  const hoje = new Date()
  const year = hoje.getFullYear()
  const pontosDeHoje = getPontosDoDia(hoje)
  const bancoDeHoras = getBancoDeHoras(hoje)

  const [diaSelecionado, setDiaSelecionado] = React.useState<Date | null>(null)
  const pontosDoDiaSelecionado = diaSelecionado ? getPontosDoDia(diaSelecionado) : null

  const selecionarDia = React.useCallback((date: Date) => setDiaSelecionado(date), [])

  return (
    <div className="flex h-full w-full flex-col gap-4 px-4 py-6 md:px-8">
      <Card className="border-0 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Ponto de hoje
              </span>
              <p className="text-sm font-bold capitalize text-zinc-800">
                {hoje.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </p>
            </div>

            {pontosDeHoje ? (
              <div className="flex flex-wrap items-center gap-3">
                {pontosDeHoje.marcacoes.map((marcacao) => (
                  <div
                    key={marcacao.rotulo}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2"
                  >
                    <span className="block text-[10px] font-semibold uppercase leading-none text-zinc-500">
                      {marcacao.rotulo}
                    </span>
                    <span className="mt-1 block text-sm font-bold leading-none text-zinc-800">
                      {marcacao.hora}
                    </span>
                  </div>
                ))}
                <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2">
                  <span className="block text-[10px] font-semibold uppercase leading-none text-green-700">
                    Trabalhado
                  </span>
                  <span className="mt-1 block text-sm font-bold leading-none text-green-700">
                    {pontosDeHoje.valor}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm font-semibold text-zinc-500">Dia de folga, sem marcações.</p>
            )}
          </div>

          <div className="flex flex-col items-start rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 md:items-end">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Banco de horas
            </span>
            <span
              className={`mt-1 text-2xl font-bold leading-none ${
                bancoDeHoras < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {formatarSaldo(bancoDeHoras)}
            </span>
            <span className="mt-1 text-[11px] font-medium text-zinc-500">
              Acumulado em {year}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 border-0 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <CardContent className="h-full p-4 md:p-6">
          <GradeDeMeses year={year} mesAtual={hoje.getMonth()} onSelecionarDia={selecionarDia} />
        </CardContent>
      </Card>

      <Dialog
        isOpen={diaSelecionado !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setDiaSelecionado(null)
        }}
      >
        <DialogTitle className="capitalize">
          {diaSelecionado?.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </DialogTitle>

        {pontosDoDiaSelecionado ? (
          <div className="mt-4 flex flex-col gap-2">
            {pontosDoDiaSelecionado.marcacoes.map((marcacao) => (
              <div
                key={marcacao.rotulo}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2"
              >
                <span className="text-xs font-semibold uppercase text-zinc-500">
                  {marcacao.rotulo}
                </span>
                <span className="text-sm font-bold text-zinc-800">{marcacao.hora}</span>
              </div>
            ))}

            <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-3">
              <span className="text-xs font-semibold uppercase text-zinc-500">Total</span>
              <span className="text-sm font-bold text-green-600">
                {pontosDoDiaSelecionado.valor}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-zinc-500">Saldo do dia</span>
              <span
                className={`text-sm font-bold ${
                  pontosDoDiaSelecionado.saldo < 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatarSaldo(pontosDoDiaSelecionado.saldo)}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-zinc-500">
            Dia de folga, sem registro de ponto.
          </p>
        )}
      </Dialog>
    </div>
  )
}