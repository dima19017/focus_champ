import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { randomOutfit } from "@/lib/outfit"

const schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _"),
  password: z.string().min(6, "Минимум 6 символов"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    const { username, password } = parsed.data

    const exists = await prisma.user.findUnique({ where: { username } })
    if (exists) return NextResponse.json({ error: "Логин занят" }, { status: 409 })

    const hash = await bcrypt.hash(password, 10)
    const outfit = JSON.stringify(randomOutfit())
    await prisma.user.create({ data: { username, passwordHash: hash, displayName: username, outfit } })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Ошибка сервера" }, { status: 500 })
  }
}
