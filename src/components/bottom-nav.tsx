"use client"

import Link from "next/link"
import { Home, User, Users, Trophy } from "lucide-react"

type Props = { active: "home" | "friends" | "leaderboard" | "profile" }

const items = [
  { id: "home", icon: Home, label: "Главная", href: "/dashboard" },
  { id: "friends", icon: Users, label: "Друзья", href: "#", disabled: true },
  { id: "leaderboard", icon: Trophy, label: "Рейтинг", href: "#", disabled: true },
  { id: "profile", icon: User, label: "Профиль", href: "/profile" },
] as const

export function BottomNav({ active }: Props) {
  return (
    <nav className="shrink-0 border-t border-border bg-background safe-bottom">
      <div className="flex h-14">
        {items.map((item) => {
          const isActive = item.id === active
          const Icon = item.icon
          const className = `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
            item.disabled
              ? "text-muted-foreground/30 cursor-default"
              : isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
          }`

          if (item.disabled) {
            return (
              <div key={item.id} className={className}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
            )
          }

          return (
            <Link key={item.id} href={item.href} className={className}>
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
