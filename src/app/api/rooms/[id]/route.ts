import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, username: true, displayName: true } } } },
      days: { where: { status: "ACTIVE" }, orderBy: { dayNumber: "desc" }, take: 1 },
    },
  })

  if (!room) return NextResponse.json({ error: "Комната не найдена" }, { status: 404 })

  // Проверяем, участник ли пользователь
  const isMember = room.members.some((m) => m.userId === session.user.id)
  if (!isMember) return NextResponse.json({ error: "Вы не участник" }, { status: 403 })

  return NextResponse.json({
    id: room.id,
    name: room.name,
    joinCode: room.joinCode,
    currentDay: room.days[0]?.dayNumber ?? 1,
    members: room.members.map((m) => ({
      id: m.user.id,
      username: m.user.username,
      displayName: m.user.displayName || m.user.username,
    })),
    inviteUrl: `http://localhost:3000/join/${room.joinCode}`,
    isCreator: room.creatorId === session.user.id,
  })
}
