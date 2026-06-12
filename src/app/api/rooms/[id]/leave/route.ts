import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const room = await prisma.room.findUnique({
    where: { id },
    include: { members: { orderBy: { joinedAt: "asc" } } },
  })
  if (!room) return NextResponse.json({ error: "Комната не найдена" }, { status: 404 })

  const isMember = room.members.some((m) => m.userId === session.user.id)
  if (!isMember) return NextResponse.json({ error: "Вы не участник" }, { status: 403 })

  // Если выходит админ — передать роль следующему
  if (room.creatorId === session.user.id && room.members.length > 1) {
    const nextAdmin = room.members.find((m) => m.userId !== session.user.id)
    if (nextAdmin) {
      await prisma.room.update({ where: { id }, data: { creatorId: nextAdmin.userId } })
    }
  }

  // Удалить себя из участников
  await prisma.roomMember.delete({
    where: { roomId_userId: { roomId: id, userId: session.user.id } },
  })

  // Проверить, остались ли участники
  const remaining = await prisma.roomMember.count({ where: { roomId: id } })
  if (remaining === 0) {
    await prisma.room.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  }

  return NextResponse.json({ success: true })
}
