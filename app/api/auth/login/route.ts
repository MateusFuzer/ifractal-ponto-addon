import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Login simples com email/senha (sem hash por enquanto — adicionar bcrypt depois)
export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
  }

  // Retorna dados do usuário (em produção, retornaria um JWT)
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
  })
}
