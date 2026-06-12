"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"

type RoomData = {
  id: string; name: string; joinCode: string; currentDay: number
  members: { id: string; username: string; displayName: string }[]
  inviteUrl: string; isCreator: boolean
}

export default function RoomPage() {
  const { id } = useParams<{ id: string }>()
  const [room, setRoom] = useState<RoomData | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<"link" | "code" | null>(null)

  useEffect(() => {
    fetch(`/api/rooms/${id}`).then(async (r) => {
      const data = await r.json()
      if (r.ok) setRoom(data)
      else setError(data.error || "Ошибка загрузки")
    })
  }, [id])

  const copy = async (text: string, type: "link" | "code") => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (error) return <div className="flex h-full items-center justify-center"><p className="text-destructive">{error}</p></div>
  if (!room) return <div className="flex h-full items-center justify-center"><p className="text-muted-foreground">Загрузка...</p></div>

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center px-4 pt-4 pb-2 shrink-0">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Назад</Link>
      </header>

      <main className="flex-1 px-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-1">{room.name}</h1>
        <p className="text-sm text-muted-foreground mb-4">День {room.currentDay} • {room.members.length} участник{room.members.length > 1 ? "а" : ""}</p>

        {/* Код + ссылка */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Код комнаты</p>
                <p className="text-lg font-mono font-bold tracking-widest">{room.joinCode}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => copy(room.joinCode, "code")}>
                {copied === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ссылка-приглашение</p>
                <p className="text-xs font-mono text-muted-foreground truncate max-w-48">{room.inviteUrl}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => copy(room.inviteUrl, "link")}>
                {copied === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Участники */}
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Участники</h2>
        <div className="space-y-1">
          {room.members.map((m) => (
            <div key={m.id} className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                {(m.displayName || m.username)[0].toUpperCase()}
              </div>
              <span>{m.displayName || m.username}</span>
              {room.isCreator && m.id === room.members[0]?.id && (
                <span className="text-xs text-muted-foreground">(создатель)</span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
