import { useMemo } from 'react'

const PLATFORM_SIZE = 2000
const HALF = PLATFORM_SIZE / 2
const QUADRANT_SIZE = PLATFORM_SIZE / 2

const WALL_HEIGHT = 15
const WALL_THICKNESS = 5
const WALL_COLOR = '#222'

export default function Platform() {
  const quadrants = useMemo(() => {
    const offset = QUADRANT_SIZE / 2
    return [
      { position: [-offset, 0, -offset], color: '#3a6ea5' }, // В. Салда (Синий)
      { position: [offset, 0, -offset], color: '#3aa55c' },  // Алапаевск (Зеленый)
      { position: [-offset, 0, offset], color: '#a53a3a' },  // Патруши (Красный)
      { position: [offset, 0, offset], color: '#a5a53a' },   // Уктус (Желтый)
    ]
  }, [])

  const walls = useMemo(() => {
    const y = WALL_HEIGHT / 2
    return [
      { position: [0, y, -HALF], size: [PLATFORM_SIZE, WALL_HEIGHT, WALL_THICKNESS] },
      { position: [0, y, HALF], size: [PLATFORM_SIZE, WALL_HEIGHT, WALL_THICKNESS] },
      { position: [-HALF, y, 0], size: [WALL_THICKNESS, WALL_HEIGHT, PLATFORM_SIZE] },
      { position: [HALF, y, 0], size: [WALL_THICKNESS, WALL_HEIGHT, PLATFORM_SIZE] },
    ]
  }, [])

  return (
    <group>
      {quadrants.map((q, i) => (
        <mesh key={`q-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={q.position} receiveShadow>
          <planeGeometry args={[QUADRANT_SIZE, QUADRANT_SIZE]} />
          <meshStandardMaterial color={q.color} roughness={0.9} metalness={0} side={2} />
        </mesh>
      ))}
      {walls.map((w, i) => (
        <mesh key={`w-${i}`} position={w.position} castShadow receiveShadow>
          <boxGeometry args={w.size} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.8} metalness={0.1} />
        </mesh>
      ))}
    </group>
  )
}