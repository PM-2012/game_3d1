import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const SPEED = 50 // Ускорено для огромной карты
const SIZE = 1.7
const PLATFORM_HALF = 1000
const WALL_THICKNESS = 5
const LIMIT = PLATFORM_HALF - WALL_THICKNESS - SIZE / 2
const HALF_PLAYER = SIZE / 2

function collidesWithBuilding(x, z, buildings) {
  if (!buildings || buildings.length === 0) return false
  for (const b of buildings) {
    const bx1 = b.x - b.w / 2
    const bx2 = b.x + b.w / 2
    const bz1 = b.z - b.d / 2
    const bz2 = b.z + b.d / 2
    const px1 = x - HALF_PLAYER
    const px2 = x + HALF_PLAYER
    const pz1 = z - HALF_PLAYER
    const pz2 = z + HALF_PLAYER
    if (px1 < bx2 && px2 > bx1 && pz1 < bz2 && pz2 > bz1) return true
  }
  return false
}

export default function Player({ playerRef, onQuadrantChange, buildingsRef }) {
  const { camera } = useThree()
  const keys = useRef({ w: false, a: false, s: false, d: false })
  const lastQuadrant = useRef(null)

  useEffect(() => {
    const resolveKey = (e) => {
      switch (e.code) {
        case 'KeyW': return 'w'
        case 'KeyA': return 'a'
        case 'KeyS': return 's'
        case 'KeyD': return 'd'
        case 'ArrowUp': return 'w'
        case 'ArrowDown': return 's'
        case 'ArrowLeft': return 'a'
        case 'ArrowRight': return 'd'
        default: break
      }
      const k = e.key ? e.key.toLowerCase() : ''
      if (k === 'w' || k === 'ц') return 'w'
      if (k === 'a' || k === 'ф') return 'a'
      if (k === 's' || k === 'ы') return 's'
      if (k === 'd' || k === 'в') return 'd'
      return null
    }
    const handleKeyDown = (e) => { const axis = resolveKey(e); if (axis) { keys.current[axis] = true; e.preventDefault() } }
    const handleKeyUp = (e) => { const axis = resolveKey(e); if (axis) { keys.current[axis] = false; e.preventDefault() } }
    const handleBlur = () => { keys.current = { w: false, a: false, s: false, d: false } }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useFrame((state, delta) => {
    if (!playerRef.current) return
    const pos = playerRef.current.position

    const camDir = _camDir
    camera.getWorldDirection(camDir)
    camDir.y = 0
    const len = Math.hypot(camDir.x, camDir.z)
    if (len > 1e-6) { camDir.x /= len; camDir.z /= len } else { camDir.x = 0; camDir.z = -1 }

    const forwardX = camDir.x; const forwardZ = camDir.z
    const rightX = -forwardZ; const rightZ = forwardX

    let moveX = 0; let moveZ = 0
    if (keys.current.w) { moveX += forwardX; moveZ += forwardZ }
    if (keys.current.s) { moveX -= forwardX; moveZ -= forwardZ }
    if (keys.current.d) { moveX += rightX; moveZ += rightZ }
    if (keys.current.a) { moveX -= rightX; moveZ -= rightZ }

    const moveLen = Math.hypot(moveX, moveZ)
    if (moveLen > 0) { moveX /= moveLen; moveZ /= moveLen }

    const buildings = buildingsRef?.current || []

    const stepX = moveX * SPEED * delta
    if (stepX !== 0) {
      const nextX = pos.x + stepX
      const clampedX = Math.max(-LIMIT, Math.min(LIMIT, nextX))
      if (!collidesWithBuilding(clampedX, pos.z, buildings)) pos.x = clampedX
    }

    const stepZ = moveZ * SPEED * delta
    if (stepZ !== 0) {
      const nextZ = pos.z + stepZ
      const clampedZ = Math.max(-LIMIT, Math.min(LIMIT, nextZ))
      if (!collidesWithBuilding(pos.x, clampedZ, buildings)) pos.z = clampedZ
    }

    if (moveLen > 0) {
      const targetAngle = Math.atan2(moveX, moveZ)
      const currentAngle = playerRef.current.rotation.y
      let diff = targetAngle - currentAngle
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      playerRef.current.rotation.y += diff * 10 * delta
    }

    let quadrant = null
    if (pos.x < 0 && pos.z < 0) quadrant = 'blue'
    else if (pos.x > 0 && pos.z < 0) quadrant = 'green'
    else if (pos.x < 0 && pos.z > 0) quadrant = 'red'
    else if (pos.x > 0 && pos.z > 0) quadrant = 'yellow'

    if (quadrant !== lastQuadrant.current) {
      lastQuadrant.current = quadrant
      if (onQuadrantChange) onQuadrantChange(quadrant)
    }
  })

  return (
    <mesh ref={playerRef} position={[0, SIZE / 2, 0]} castShadow>
      <boxGeometry args={[SIZE, SIZE, SIZE]} />
      <meshStandardMaterial color="#ff7b00" roughness={0.4} metalness={0.1} emissive="#3a1a00" emissiveIntensity={0.5} />
    </mesh>
  )
}
const _camDir = new THREE.Vector3()