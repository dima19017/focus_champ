import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { parseOutfit } from "@/lib/outfit"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { MiniCharacter } from "@/components/mini-character"

async function getRooms(userId: string) {
  const memberships = await prisma.roomMember.findMany({
    where: { userId },
    include: {
      room: {
        include: {
          _count: { select: { members: true } },
          days: { where: { status: "ACTIVE" }, orderBy: { dayNumber: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  })
  return memberships.map((m) => ({
    id: m.room.id, name: m.room.name, joinCode: m.room.joinCode,
    membersCount: m.room._count.members, currentDay: m.room.days[0]?.dayNumber ?? 1,
  }))
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { outfit: true } })
  const outfit = parseOutfit(user?.outfit || "{}")
  const rooms = await getRooms(session.user.id)

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center px-4 pt-4 pb-2 shrink-0">
        <MiniCharacter color={outfit.color} />
        <div className="ml-2">
          <h1 className="text-lg font-bold">Привет, {session.user.name || "Игрок"}!</h1>
          <p className="text-xs text-muted-foreground">Уровень 1</p>
        </div>
      </header>

      <main className="flex-1 px-4 overflow-y-auto">
        {rooms.length > 0 ? (
          <>
            <h2 className="text-sm font-medium text-muted-foreground mb-2 mt-2">Мои комнаты</h2>
            <div className="space-y-2">
              {rooms.map((room) => (
                <Link key={room.id} href={`/room/${room.id}`}>
                  <Card className="transition-colors hover:border-primary/30">
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium text-sm">{room.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {room.membersCount} участник{room.membersCount > 1 ? "а" : ""} • День {room.currentDay}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{room.joinCode}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-base font-medium mb-1">У вас пока нет комнат</p>
            <p className="text-sm text-muted-foreground mb-4">Создайте первую или присоединитесь по коду</p>
          </div>
        )}

        <div className="mt-4 space-y-2 pb-2">
          <Button asChild className="w-full h-11"><Link href="/room/create">Создать комнату</Link></Button>
          <Button asChild variant="secondary" className="w-full h-11"><Link href="/room/join">Присоединиться</Link></Button>
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  )
}
