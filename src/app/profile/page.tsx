"use client"

import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Character } from "@/components/character"
import { Progress } from "@/components/ui/progress"
import { BottomNav } from "@/components/bottom-nav"
import { LogoutButton } from "@/components/logout-button"

function Scene({ color }: { color: string }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Character shirtColor={color} />
      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={6} target={[0, 0, 0]} />
    </>
  )
}

export default function ProfilePage() {
  const [outfit, setOutfit] = useState({ color: "#7C4DFF" })
  const level = 1; const xp = 0; const xpToNext = 100

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.outfit) setOutfit(d.outfit)
    })
  }, [])

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 pt-4 pb-1 shrink-0">
        <div className="w-16" />
        <h1 className="text-lg font-bold">Мой профиль</h1>
        <div className="w-16 flex justify-end"><LogoutButton /></div>
      </header>

      <main className="flex-1 min-h-0">
        <Canvas camera={{ position: [3, 0.5, 4], fov: 50 }}>
          <Scene color={outfit.color} />
        </Canvas>
      </main>

      <div className="shrink-0 px-4 pb-2 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Уровень {level}</span>
          <span className="text-muted-foreground">{xp}/{xpToNext} XP</span>
        </div>
        <Progress value={(xp / xpToNext) * 100} className="h-2" />
      </div>

      <BottomNav active="profile" />
    </div>
  )
}
