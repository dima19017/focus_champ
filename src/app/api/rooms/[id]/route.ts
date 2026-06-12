import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/rooms/[id] — детали комнаты с участниками и их цветами

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, username: true, displayName: true, outfit: true } } } },
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
      outfit: JSON.parse(m.user.outfit || "{}"),
    })),
    inviteUrl: `http://localhost:3000/join/${room.joinCode}`,
    isCreator: room.creatorId === session.user.id,
  })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const room = await prisma.room.findUnique({ where: { id } })
  if (!room) return NextResponse.json({ error: "Не найдена" }, { status: 404 })
  if (room.creatorId !== session.user.id) return NextResponse.json({ error: "Только создатель" }, { status: 403 })

  // Удаляем связанные записи (SQLite не каскадит)
  await prisma.$transaction([
    prisma.taskSubmission.deleteMany({ where: { task: { roomId: id } } }),
    prisma.dayScore.deleteMany({ where: { day: { roomId: id } } }),
    prisma.dayWinner.deleteMany({ where: { day: { roomId: id } } }),
    prisma.competitionDay.deleteMany({ where: { roomId: id } }),
    prisma.task.deleteMany({ where: { roomId: id } }),
    prisma.roomMember.deleteMany({ where: { roomId: id } }),
    prisma.room.delete({ where: { id } }),
  ])

  return NextResponse.json({ success: true })
}
