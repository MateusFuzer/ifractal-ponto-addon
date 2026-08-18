import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/pontos?userId=xxx&year=2026&month=0
// Retorna todos os pontos de um mês para o usuário
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const year = Number(searchParams.get("year"))
  const month = Number(searchParams.get("month")) // 0-indexed

  if (!userId) {
    return NextResponse.json({ error: "userId obrigatório" }, { status: 400 })
  }

  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  const pontos = await prisma.ponto.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  })

  return NextResponse.json({ pontos })
}

// POST /api/pontos
// Salva ou atualiza o ponto de um dia
export async function POST(request: Request) {
  const { userId, date, valor, entrada, saidaAlmoco, voltaAlmoco, saida } =
    await request.json()

  if (!userId || !date || !valor) {
    return NextResponse.json(
      { error: "userId, date e valor são obrigatórios" },
      { status: 400 }
    )
  }

  const parsedDate = new Date(date)

  const ponto = await prisma.ponto.upsert({
    where: {
      userId_date: {
        userId,
        date: parsedDate,
      },
    },
    update: {
      valor,
      entrada,
      saidaAlmoco,
      voltaAlmoco,
      saida,
      syncedAt: new Date(),
    },
    create: {
      userId,
      date: parsedDate,
      valor,
      entrada,
      saidaAlmoco,
      voltaAlmoco,
      saida,
    },
  })

  return NextResponse.json({ ponto })
}
