"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

type CharacterProps = {
  shirtColor?: string
  pantsColor?: string
  skinColor?: string
  hat?: React.ReactNode
}

export function Character({ shirtColor = "#7C4DFF", pantsColor = "#1A2444", skinColor = "#e8b88a", hat }: CharacterProps) {
  const leftArm = useRef<THREE.Mesh>(null!)
  const rightArm = useRef<THREE.Mesh>(null!)
  const leftLeg = useRef<THREE.Mesh>(null!)
  const rightLeg = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (leftArm.current) leftArm.current.rotation.x = Math.sin(t * 2) * 0.3
    if (rightArm.current) rightArm.current.rotation.x = Math.sin(t * 2 + Math.PI) * 0.3
    if (leftLeg.current) leftLeg.current.rotation.x = Math.sin(t * 2 + Math.PI) * 0.3
    if (rightLeg.current) rightLeg.current.rotation.x = Math.sin(t * 2) * 0.3
  })

  return (
    <group position={[0, -0.5, 0]}>
      {/* Ноги */}
      <mesh ref={leftLeg} position={[-0.25, -0.9, 0]}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      <mesh ref={rightLeg} position={[0.25, -0.9, 0]}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>

      {/* Торс */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.2, 0.6]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Руки */}
      <mesh ref={leftArm} position={[-0.7, 0.2, 0]}>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <mesh ref={rightArm} position={[0.7, 0.2, 0]}>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Голова */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Глаза */}
      <mesh position={[-0.25, 0.95, 0.5]}>
        <boxGeometry args={[0.2, 0.2, 0.05]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.25, 0.95, 0.5]}>
        <boxGeometry args={[0.2, 0.2, 0.05]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.25, 0.95, 0.53]}>
        <boxGeometry args={[0.08, 0.08, 0.05]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.25, 0.95, 0.53]}>
        <boxGeometry args={[0.08, 0.08, 0.05]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Рот */}
      <mesh position={[0, 0.78, 0.5]}>
        <boxGeometry args={[0.35, 0.06, 0.05]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Шляпа (если передана) */}
      {hat && <group position={[0, 1.4, 0]}>{hat}</group>}
    </group>
  )
}
