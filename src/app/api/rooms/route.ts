import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

const schema = z.object({
  name: z.string().min(1, "Введите название").max(50),
  password: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const { name, password } = parsed.data
  const passwordHash = password ? await bcrypt.hash(password, 10) : null

  let code = generateCode()
  while (await prisma.room.findUnique({ where: { joinCode: code } })) {
    code = generateCode()
  }

  const room = await prisma.room.create({
    data: {
      name,
      joinCode: code,
      passwordHash,
      creatorId: session.user.id,
      members: { create: { userId: session.user.id } },
      days: { create: { dayNumber: 1 } },
    },
  })

  return NextResponse.json({ id: room.id, joinCode: room.joinCode }, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const memberships = await prisma.roomMember.findMany({
    where: { userId: session.user.id },
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

  return NextResponse.json(memberships.map((m) => ({
    id: m.room.id, name: m.room.name, joinCode: m.room.joinCode,
    membersCount: m.room._count.members, currentDay: m.room.days[0]?.dayNumber ?? 1,
  })))
}
