"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [name, setName] = React.useState("")
  const [isRegister, setIsRegister] = React.useState(false)
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login"
    const body = isRegister
      ? { email, password, name }
      : { email, password }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao autenticar")
        return
      }

      // Salva o usuário no localStorage
      localStorage.setItem("user", JSON.stringify(data))
      router.push("/")
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-xl font-bold text-zinc-800">
          {isRegister ? "Criar conta" : "Entrar"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />

          {error && (
            <p className="text-center text-xs font-semibold text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Aguarde..." : isRegister ? "Cadastrar" : "Entrar"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsRegister(!isRegister)
            setError("")
          }}
          className="mt-4 w-full cursor-pointer text-center text-xs font-medium text-zinc-500 hover:text-zinc-800"
        >
          {isRegister
            ? "Já tem conta? Faça login"
            : "Não tem conta? Cadastre-se"}
        </button>
      </div>
    </div>
  )
}
