"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function JoinPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [needsPassword, setNeedsPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (code.length !== 6) { setError("Код должен быть 6 символов"); return }
    setLoading(true)
    const res = await fetch("/api/rooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase(), password: password || undefined }),
    })
    const json = await res.json()
    setLoading(false)
    if (res.status === 403 && !password) {
      setNeedsPassword(true)
      setError("Требуется пароль")
      return
    }
    if (!res.ok) { setError(json.error || "Ошибка"); return }
    router.push(`/room/${json.id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2 shrink-0">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Назад</Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>Присоединиться</CardTitle>
            <CardDescription>Введите код комнаты из 6 символов</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                placeholder="Код (например, ABC123)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest uppercase"
              />
              {needsPassword && (
                <Input
                  type="password"
                  placeholder="Пароль комнаты"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? "Присоединяемся..." : "Присоединиться"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
