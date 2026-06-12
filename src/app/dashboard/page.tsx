import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { MiniCharacter } from "@/components/mini-character"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-3">
          <MiniCharacter />
          <div>
            <h1 className="text-lg font-bold">Привет, {session.user.name || "Игрок"}!</h1>
            <p className="text-xs text-muted-foreground">Уровень 1</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <p className="text-base font-medium mb-1">У вас пока нет комнат</p>
        <p className="text-sm text-muted-foreground mb-6">Создайте первую или присоединитесь по коду</p>

        <div className="w-full max-w-xs space-y-3">
          <Button asChild className="w-full h-12"><Link href="/room/create">Создать комнату</Link></Button>
          <Button asChild variant="secondary" className="w-full h-12"><Link href="/room/join">Присоединиться</Link></Button>
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  )
}
