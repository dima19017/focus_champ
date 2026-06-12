"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CreateRoomPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name.trim()) { setError("Введите название"); return }
    setLoading(true)
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error || "Ошибка"); return }
    router.push(`/room/${json.id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center px-4 pt-4 pb-2 shrink-0">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Назад</Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>Новая комната</CardTitle>
            <CardDescription>Создайте комнату для соревнования</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input placeholder="Название комнаты" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Создаём..." : "Создать комнату"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
