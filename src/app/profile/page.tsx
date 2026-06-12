"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Character } from "@/components/character"
import { Progress } from "@/components/ui/progress"
import { BottomNav } from "@/components/bottom-nav"

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#131B33" />
      </mesh>
      <Character />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} target={[0, 0, 0]} />
    </>
  )
}

export default function ProfilePage() {
  const level = 1
  const xp = 0
  const xpToNext = 100

  return (
    <div className="flex flex-col h-full">
      <header className="text-center pt-4 pb-2 shrink-0">
        <h1 className="text-lg font-bold">Мой профиль</h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 min-h-0">
        {/* 3D персонаж */}
        <div className="w-full max-w-sm aspect-square rounded-xl overflow-hidden border border-border">
          <Canvas camera={{ position: [3, 0.5, 5], fov: 50 }}>
            <Scene />
          </Canvas>
        </div>

        {/* Уровень + прогресс */}
        <div className="w-full max-w-sm mt-3 space-y-1 shrink-0">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Уровень {level}</span>
            <span className="text-muted-foreground">{xp}/{xpToNext} XP</span>
          </div>
          <Progress value={(xp / xpToNext) * 100} className="h-2" />
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  )
}
