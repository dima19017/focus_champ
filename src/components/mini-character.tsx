"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Character } from "@/components/character"

export function MiniCharacter() {
  return (
    <div className="w-24 h-24 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0.2, 3.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={0.8} />
        <Character />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={5} target={[0, 0, 0]} />
      </Canvas>
    </div>
  )
}
