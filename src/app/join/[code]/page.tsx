import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function JoinByCodePage({ params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  const { code } = await params

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/join/${code}`)
  }

  const room = await prisma.room.findUnique({ where: { joinCode: code.toUpperCase() } })
  if (!room) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <p className="text-destructive text-center">
          Комната с кодом <span className="font-mono font-bold">{code}</span> не найдена
        </p>
      </div>
    )
  }

  // Проверить, не участник ли уже
  const existing = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId: room.id, userId: session.user.id } },
  })

  if (!existing) {
    await prisma.roomMember.create({ data: { roomId: room.id, userId: session.user.id } })
  }

  redirect(`/room/${room.id}`)
}
