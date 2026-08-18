import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { email, password, name } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: { email, password, name },
  })

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
  })
}
