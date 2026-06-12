"use client"

import { Canvas } from "@react-three/fiber"
import { Character } from "@/components/character"

export function StaticCharacter({ color = "#7C4DFF" }: { color?: string }) {
  return (
    <div className="w-10 h-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0.2, 3.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={0.8} />
        <Character shirtColor={color} />
      </Canvas>
    </div>
  )
}
