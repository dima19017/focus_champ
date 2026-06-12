import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, userId } = await params
  const room = await prisma.room.findUnique({ where: { id } })
  if (!room) return NextResponse.json({ error: "Комната не найдена" }, { status: 404 })

  // Только создатель может кикать
  if (room.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Только создатель может удалять участников" }, { status: 403 })
  }

  // Нельзя кикнуть самого себя (для этого есть leave)
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Используйте выход, а не удаление" }, { status: 400 })
  }

  await prisma.roomMember.delete({
    where: { roomId_userId: { roomId: id, userId } },
  })

  return NextResponse.json({ success: true })
}
