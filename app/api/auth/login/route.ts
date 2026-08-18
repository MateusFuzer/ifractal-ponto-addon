import { NextResponse } from "next/server"

// Usuário fixo para desenvolvimento local (não depende do banco)
const MOCK_USER = {
  id: "dev-user-001",
  email: "mateus@test.com",
  name: "Mateus",
  password: "123456",
}

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
  }

  // Valida contra o usuário mock
  if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
  }

  return NextResponse.json({
    id: MOCK_USER.id,
    email: MOCK_USER.email,
    name: MOCK_USER.name,
  })
}
