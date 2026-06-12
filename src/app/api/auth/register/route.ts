import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _"),
  password: z.string().min(6, "Минимум 6 символов"),
})

export async function POST(req: Request) {
  try {
    const { username, password } = schema.parse(await req.json())
    const exists = await prisma.user.findUnique({ where: { username } })
    if (exists) return NextResponse.json({ error: "Логин занят" }, { status: 409 })
    const hash = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { username, passwordHash: hash, displayName: username } })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
