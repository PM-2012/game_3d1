import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

const DEFAULT_DISTANCE = 10
const MIN_DISTANCE = 2
const MIN_COLLISION_DISTANCE = 5
const MAX_DISTANCE = 20
const ROTATE_SPEED = 0.025
const ZOOM_SPEED = 0.6
const MIN_PITCH = -0.15
const MAX_PITCH = Math.PI / 2 - 0.1
const MIN_CAMERA_Y = 2
const CAMERA_PADDING = 5

const DEFAULT_FOV = 60
const COLLISION_FOV = 75
const FOV_SPEED = 4
const FADED_OPACITY = 0.25
const FADE_SPEED = 8
const RETURN_SPEED = 3

function segmentIntersectsBuilding(x0, z0, x1, z1, b, padding = 0) {
  const bx1 = b.x - b.w / 2 - padding
  const bx2 = b.x + b.w / 2 + padding
  const bz1 = b.z - b.d / 2 - padding
  const bz2 = b.z + b.d / 2 + padding
  const dx = x1 - x0
  const dz = z1 - z0
  let tMin = 0
  let tMax = 1
  if (Math.abs(dx) < 1e-8) { if (x0 < bx1 || x0 > bx2) return null } else {
    let t1 = (bx1 - x0) / dx; let t2 = (bx2 - x0) / dx
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp }
    tMin = Math.max(tMin, t1); tMax = Math.min(tMax, t2)
    if (tMin > tMax) return null
  }
  if (Math.abs(dz) < 1e-8) { if (z0 < bz1 || z0 > bz2) return null } else {
    let t1 = (bz1 - z0) / dz; let t2 = (bz2 - z0) / dz
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp }
    tMin = Math.max(tMin, t1); tMax = Math.min(tMax, t2)
    if (tMin > tMax) return null
  }
  return tMin
}

function findSafeDistance(px, pz, dirX, dirZ, desiredDist, buildings) {
  let safeDist = desiredDist
  let hasCollision = false
  if (!buildings || buildings.length === 0) return { distance: safeDist, hasCollision }
  const camX = px + dirX * desiredDist
  const camZ = pz + dirZ * desiredDist
  for (const b of buildings) {
    if (b.noCollision) continue
    const t = segmentIntersectsBuilding(px, pz, camX, camZ, b, CAMERA_PADDING)
    if (t !== null && t < 1) {
      const hitDist = Math.max(MIN_COLLISION_DISTANCE, t * desiredDist - CAMERA_PADDING)
      if (hitDist < safeDist) { safeDist = hitDist; hasCollision = true }
    }
  }
  return { distance: safeDist, hasCollision }
}

export default function CameraFollow({ playerRef, buildingsRef, meshRefs }) {
  const { camera } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(Math.PI / 6)
  const distance = useRef(DEFAULT_DISTANCE)
  const isRotating = useRef(false)
  const wasInCollision = useRef(false)
  const currentFov = useRef(DEFAULT_FOV)

  useEffect(() => {
    const handleMouseDown = (e) => { if (e.button === 2) isRotating.current = true }
    const handleMouseUp = (e) => { if (e.button === 2) isRotating.current = false }
    const handleBlur = () => { isRotating.current = false }
    const handleMouseMove = (e) => {
      if (!isRotating.current) return
      yaw.current -= (e.movementX || 0) * ROTATE_SPEED
      pitch.current += (e.movementY || 0) * ROTATE_SPEED
      pitch.current = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch.current))
    }
    const handleWheel = (e) => {
      e.preventDefault()
      distance.current += e.deltaY * ZOOM_SPEED
      distance.current = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, distance.current))
      wasInCollision.current = false
    }
    const handleContextMenu = (e) => e.preventDefault()

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useFrame((state, delta) => {
    if (!playerRef.current) return
    const p = playerRef.current.position
    const lookAtX = p.x
    const lookAtY = p.y + 0.5
    const lookAtZ = p.z

    const cosPitch = Math.cos(pitch.current)
    const dirX = cosPitch * Math.sin(yaw.current)
    const dirY = Math.sin(pitch.current)
    const dirZ = cosPitch * Math.cos(yaw.current)

    const buildings = buildingsRef?.current || []
    const meshes = meshRefs?.current || []

    const { distance: safeDistance, hasCollision } = findSafeDistance(lookAtX, lookAtZ, dirX, dirZ, distance.current, buildings)

    if (hasCollision) { wasInCollision.current = true } 
    else if (wasInCollision.current) {
      const t = 1 - Math.exp(-RETURN_SPEED * delta)
      distance.current += (DEFAULT_DISTANCE - distance.current) * t
      if (Math.abs(distance.current - DEFAULT_DISTANCE) < 0.1) { distance.current = DEFAULT_DISTANCE; wasInCollision.current = false }
    }

    const targetX = lookAtX + dirX * safeDistance
    const targetY = lookAtY + dirY * safeDistance
    const targetZ = lookAtZ + dirZ * safeDistance

    const smooth = 1 - Math.exp(-10 * delta)
    camera.position.x += (targetX - camera.position.x) * smooth
    camera.position.y += (targetY - camera.position.y) * smooth
    camera.position.z += (targetZ - camera.position.z) * smooth

    if (camera.position.y < MIN_CAMERA_Y) camera.position.y = MIN_CAMERA_Y
    camera.lookAt(lookAtX, lookAtY, lookAtZ)

    const targetFov = hasCollision ? COLLISION_FOV : DEFAULT_FOV
    const fovT = 1 - Math.exp(-FOV_SPEED * delta)
    currentFov.current += (targetFov - currentFov.current) * fovT
    if (Math.abs(camera.fov - currentFov.current) > 0.01) {
      camera.fov = currentFov.current
      camera.updateProjectionMatrix()
    }

    if (meshes.length === 0 || buildings.length === 0) return
    const camX = camera.position.x
    const camZ = camera.position.z

    for (let i = 0; i < buildings.length; i++) {
      const mesh = meshes[i]
      if (!mesh || !mesh.material) continue
      const b = buildings[i]
      const t = segmentIntersectsBuilding(camX, camZ, lookAtX, lookAtZ, b, 0)
      const targetOpacity = t !== null ? FADED_OPACITY : 1
      const fadeSmooth = 1 - Math.exp(-FADE_SPEED * delta)
      mesh.material.opacity += (targetOpacity - mesh.material.opacity) * fadeSmooth
      mesh.material.transparent = mesh.material.opacity < 0.99
      mesh.material.needsUpdate = true
    }
  })

  return null
}