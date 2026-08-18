import { NextResponse } from "next/server"

// API fake de sincronização de um único dia
// GET /api/sync?year=2026&month=0&day=6
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = Number(searchParams.get("year"))
  const month = Number(searchParams.get("month")) // 0-indexed
  const day = Number(searchParams.get("day"))

  // Simula latência variável (300–1200ms)
  const latencia = 300 + ((day * 7 + month * 3) % 900)
  await new Promise((resolve) => setTimeout(resolve, latencia))

  // Simula erro aleatório em ~15% dos dias (baseado no dia para ser determinístico)
  const shouldFail = (day * 13 + month * 7) % 20 < 3
  if (shouldFail) {
    return NextResponse.json(
      { error: "Falha ao sincronizar", year, month, day },
      { status: 500 }
    )
  }

  const variationMinutes = ((day * 7 + month * 13) % 10) * 5
  const hours = 8
  const minutes = variationMinutes < 10 ? `0${variationMinutes}` : `${variationMinutes}`

  return NextResponse.json({
    year,
    month,
    day,
    valor: `${hours}h ${minutes}m`,
    syncedAt: new Date().toISOString(),
  })
}
