import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

const schema = z.object({
  name: z.string().min(1, "Введите название").max(50),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const { name } = parsed.data

  let code = generateCode()
  while (await prisma.room.findUnique({ where: { joinCode: code } })) {
    code = generateCode()
  }

  const room = await prisma.room.create({
    data: {
      name,
      joinCode: code,
      creatorId: session.user.id,
      members: { create: { userId: session.user.id } },
      days: { create: { dayNumber: 1 } },
    },
  })

  return NextResponse.json({ id: room.id, joinCode: room.joinCode }, { status: 201 })
}
