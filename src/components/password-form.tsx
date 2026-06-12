"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function PasswordForm({ code }: { code: string }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/rooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, password }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error || "Ошибка"); return }
    router.push(`/room/${json.id}`)
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
      <h2 className="text-lg font-bold text-center">Требуется пароль</h2>
      <p className="text-sm text-muted-foreground text-center">
        Комната <span className="font-mono">{code}</span> защищена паролем
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
        autoFocus
      />
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
        {loading ? "..." : "Присоединиться"}
      </button>
    </form>
  )
}
