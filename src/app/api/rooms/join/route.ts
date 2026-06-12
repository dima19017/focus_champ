import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code, password } = await req.json()
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Укажите код" }, { status: 400 })
  }

  const room = await prisma.room.findUnique({ where: { joinCode: code.toUpperCase() } })
  if (!room) return NextResponse.json({ error: "Комната не найдена" }, { status: 404 })

  // Проверка пароля
  if (room.passwordHash) {
    if (!password) return NextResponse.json({ error: "Требуется пароль" }, { status: 403 })
    const valid = await bcrypt.compare(password, room.passwordHash)
    if (!valid) return NextResponse.json({ error: "Неверный пароль" }, { status: 403 })
  }

  const existing = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId: room.id, userId: session.user.id } },
  })
  if (existing) return NextResponse.json({ error: "Вы уже в комнате", id: room.id }, { status: 409 })

  await prisma.roomMember.create({ data: { roomId: room.id, userId: session.user.id } })
  return NextResponse.json({ id: room.id, name: room.name }, { status: 200 })
}
