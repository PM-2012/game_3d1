import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Lights({ playerRef }) {
  const lightRef = useRef()
  const targetRef = useRef(new THREE.Object3D())

  const LIGHT_OFFSET = { x: 500, y: 1000, z: 500 }

  useEffect(() => {
    if (lightRef.current && targetRef.current) lightRef.current.target = targetRef.current
  }, [])

  useFrame(() => {
    if (!lightRef.current || !playerRef?.current) return
    const p = playerRef.current.position
    lightRef.current.position.set(p.x + LIGHT_OFFSET.x, LIGHT_OFFSET.y, p.z + LIGHT_OFFSET.z)
    targetRef.current.position.set(p.x, 0, p.z)
    targetRef.current.updateMatrixWorld()
  })

  return (
    <>
      <ambientLight intensity={0.6} color="#ffe8c0" />
      <hemisphereLight color="#ffd9a0" groundColor="#505070" intensity={0.6} />
      <directionalLight
        ref={lightRef}
        position={[500, 1000, 500]}
        intensity={2.2}
        color="#ffdba0"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-800}
        shadow-camera-right={800}
        shadow-camera-top={800}
        shadow-camera-bottom={-800}
        shadow-camera-near={1}
        shadow-camera-far={2000}
      />
      <primitive object={targetRef.current} />
    </>
  )
}