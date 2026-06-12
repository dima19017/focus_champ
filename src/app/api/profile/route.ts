import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { parseOutfit } from "@/lib/outfit"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, username: true, displayName: true, outfit: true } })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    outfit: parseOutfit(user.outfit),
  })
}
