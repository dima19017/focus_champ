import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PasswordForm } from "@/components/password-form"

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

  const existing = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId: room.id, userId: session.user.id } },
  })
  if (existing) redirect(`/room/${room.id}`)

  // Без пароля — авто-присоединение
  if (!room.passwordHash) {
    await prisma.roomMember.create({ data: { roomId: room.id, userId: session.user.id } })
    redirect(`/room/${room.id}`)
  }

  // С паролем — форма
  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2 shrink-0">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Назад</Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <PasswordForm code={code} />
      </main>
    </div>
  )
}
