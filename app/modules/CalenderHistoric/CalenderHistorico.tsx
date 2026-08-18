"use client"

import * as React from "react"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

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

export function CalendarCustomDays() {
  const year = new Date().getFullYear()
  const months = Array.from({ length: 12 }, (_, index) => new Date(year, index, 1))

  return (
    <div className="flex h-full w-full flex-col px-4 py-6 md:px-8">
      <Card className="flex-1 border-0 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <CardContent className="h-full p-4 md:p-6">
          <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {months.map((month) => {
              const nomeMes = month.toLocaleString("pt-BR", { month: "long" })

              return (
                <div
                  key={month.toISOString()}
                  className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 shadow-sm"
                >
                  <div className="mb-4 text-center text-base font-bold capitalize text-zinc-800">
                    {nomeMes}
                  </div>

                  <Calendar
                    mode="single"
                    month={month}
                    numberOfMonths={1}
                    hideNavigation
                    disableNavigation
                    showOutsideDays={false}
                    className="w-full p-0"
                    components={{
                      DayButton: ({ children, modifiers, day, ...props }) => {
                        const valor = getValorDoDia(day.date)
                        return (
                          <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                            <span className="text-sm font-bold leading-none text-zinc-800">
                              {children}
                            </span>
                            {!modifiers.outside && valor && (
                              <span className="mt-1 text-[10px] font-semibold leading-none text-green-600">
                                {valor}
                              </span>
                            )}
                          </CalendarDayButton>
                        )
                      },
                    }}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}