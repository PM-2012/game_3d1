import { useEffect, useState, useRef } from 'react'
import { TransformControls } from '@react-three/drei'

// --- 1. ПРОСТЫЕ ЗДАНИЯ ---
function SimpleBuilding({ w, d, h, color, shape, isSelected }) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        {shape === 'cylinder' ? <cylinderGeometry args={[w / 2, w / 2, h, 16]} /> : <boxGeometry args={[w, h, d]} />}
        <meshStandardMaterial color={isSelected ? '#ffcc00' : color} emissive={isSelected ? '#ffcc00' : '#000'} emissiveIntensity={isSelected ? 0.5 : 0} roughness={0.8} />
      </mesh>
      {shape === 'cylinder' && h > 10 && (
        <mesh position={[w / 4, h + 10, d / 4]} castShadow>
          <cylinderGeometry args={[2, 3, 20, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      )}
    </group>
  )
}

function UZGA({ isSelected }) {
  return (
    <group>
      <mesh position={[0, 15, 0]} castShadow receiveShadow><boxGeometry args={[250, 30, 150]} /><meshStandardMaterial color={isSelected ? '#ffcc00' : '#dcdcdc'} emissive={isSelected ? '#ffcc00' : '#000'} emissiveIntensity={isSelected ? 0.5 : 0} /></mesh>
      <mesh position={[0, 32, 0]} castShadow receiveShadow><boxGeometry args={[230, 4, 130]} /><meshStandardMaterial color="#a0a0a0" /></mesh>
      <mesh position={[-80, 50, 0]} castShadow><cylinderGeometry args={[10, 10, 40, 16]} /><meshStandardMaterial color="#666" /></mesh>
      <mesh position={[80, 50, 0]} castShadow><cylinderGeometry args={[10, 10, 40, 16]} /><meshStandardMaterial color="#666" /></mesh>
    </group>
  )
}

function SimaLend({ isSelected }) {
  return (
    <group>
      <mesh position={[0, 15, 0]} castShadow receiveShadow><boxGeometry args={[400, 30, 200]} /><meshStandardMaterial color={isSelected ? '#ffcc00' : '#e0e0e0'} emissive={isSelected ? '#ffcc00' : '#000'} emissiveIntensity={isSelected ? 0.5 : 0} /></mesh>
      <mesh position={[200, 15, 0]} castShadow receiveShadow><boxGeometry args={[1, 30, 200]} /><meshStandardMaterial color="#1e5a99" /></mesh>
    </group>
  )
}

function Runway() {
  const [activeGroup, setActiveGroup] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setActiveGroup((prev) => (prev + 1) % 10), 300)
    return () => clearInterval(interval)
  }, [])
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow><boxGeometry args={[800, 0.2, 100]} /><meshStandardMaterial color="#111" /></mesh>
      {[...Array(10)].map((_, i) => {
        const posX = -350 + i * 70
        const isActive = activeGroup === i
        let c = "#fff"; if (i === 0) c = "#0f0"; if (i === 9) c = "#f00"
        return (
          <group key={i}>
            <mesh position={[posX, 0.3, -48]}><sphereGeometry args={[2, 8, 8]} /><meshStandardMaterial color={isActive ? c : "#111"} emissive={isActive ? c : "#000"} emissiveIntensity={isActive ? 4 : 0} /></mesh>
            <mesh position={[posX, 0.3, 48]}><sphereGeometry args={[2, 8, 8]} /><meshStandardMaterial color={isActive ? c : "#111"} emissive={isActive ? c : "#000"} emissiveIntensity={isActive ? 4 : 0} /></mesh>
          </group>
        )
      })}
    </group>
  )
}

// --- 3. РАСПОЛОЖЕНИЕ ПО ГЕНПЛАНУ ---
const MAP_BUILDINGS = [
  // ================= ВЕРХНЯЯ САЛДА (Синий) =================
  { id: 'v1', name: 'ЖД Станция', x: -600, z: -800, w: 200, d: 40, h: 20, color: '#888', shape: 'box' },
  { id: 'v2', name: 'Силару', x: -800, z: -500, w: 300, d: 200, h: 20, color: '#888', shape: 'box' },
  { id: 'v3', name: 'ИКМЗ', x: -400, z: -700, w: 60, d: 50, h: 25, color: '#ff8c00', shape: 'cylinder' },
  { id: 'v4', name: 'Зибус', x: -300, z: -750, w: 50, d: 40, h: 20, color: '#ff8c00', shape: 'cylinder' },
  { id: 'v5', name: 'Миникат', x: -200, z: -750, w: 50, d: 40, h: 20, color: '#ff8c00', shape: 'cylinder' },
  { id: 'v6', name: 'Росско', x: -500, z: -600, w: 60, d: 50, h: 25, color: '#ff8c00', shape: 'cylinder' },
  { id: 'v7', name: 'Аметист', x: -250, z: -650, w: 40, d: 40, h: 20, color: '#ff8c00', shape: 'cylinder' },
  { id: 'v8', name: 'Боинг', x: -250, z: -550, w: 80, d: 60, h: 30, color: '#ff8c00', shape: 'cylinder' },
  { id: 'v9', name: 'Аллерго', x: -450, z: -400, w: 60, d: 60, h: 25, color: '#ff8c00', shape: 'cylinder' },
  { id: 'v10', name: 'Инфопавльон', x: -300, z: -350, w: 60, d: 60, h: 15, color: '#aaa', shape: 'cylinder' },
  { id: 'v11', name: 'Таможня', x: -200, z: -250, w: 80, d: 60, h: 15, color: '#aaa', shape: 'box' },
  { id: 'v12', name: 'Парковка', x: -150, z: -150, w: 100, d: 40, h: 5, color: '#333', shape: 'box' },
  { id: 'v13', name: 'Подстанция', x: -100, z: -850, w: 40, d: 40, h: 15, color: '#aaa', shape: 'box' },

  // ================= УКТУС (Желтый) =================
  { id: 'u1', name: 'УЗГА', x: 500, z: 300, w: 0, d: 0, h: 0, color: '', shape: 'special', isSpecial: 'uzga' },
  { id: 'u2', name: 'Поревит', x: 350, z: 500, w: 80, d: 60, h: 25, color: '#ff8c00', shape: 'cylinder' },
  { id: 'u3', name: 'ОМТ', x: 600, z: 600, w: 60, d: 60, h: 20, color: '#ff8c00', shape: 'cylinder' },
  { id: 'u4', name: 'Русмед', x: 800, z: 600, w: 80, d: 80, h: 25, color: '#ff8c00', shape: 'cylinder' },
  { id: 'u5', name: 'Котельная', x: 450, z: 750, w: 40, d: 40, h: 30, color: '#555', shape: 'box' },
  { id: 'u6', name: 'Столовая', x: 750, z: 750, w: 60, d: 40, h: 15, color: '#aaa', shape: 'box' },
  { id: 'u7', name: 'ВПП', x: 700, z: 100, w: 0, d: 0, h: 0, color: '', shape: 'special', isSpecial: 'runway' },

  // ================= АЛАПАЕВСК (Зеленый) =================
  { id: 'a1', name: 'Нейвсталь 1', x: 300, z: -700, w: 100, d: 80, h: 40, color: '#ff8c00', shape: 'cylinder' },
  { id: 'a2', name: 'Нейвсталь 2', x: 500, z: -700, w: 120, d: 80, h: 40, color: '#ff8c00', shape: 'cylinder' },
  { id: 'a3', name: 'Очистные', x: 800, z: -800, w: 150, d: 100, h: 15, color: '#aaa', shape: 'box' },
  { id: 'a4', name: 'КПП', x: 100, z: -800, w: 30, d: 30, h: 10, color: '#555', shape: 'box' },

  // ================= ПАТРУШИ (Красный) =================
  { id: 'p1', name: 'Сима-Ленд', x: -500, z: 500, w: 0, d: 0, h: 0, color: '', shape: 'special', isSpecial: 'sima' },
  { id: 'p2', name: 'Распред. пункт', x: -800, z: 300, w: 60, d: 40, h: 20, color: '#aaa', shape: 'box' },
  { id: 'p3', name: 'Очистные 2', x: -600, z: 800, w: 100, d: 80, h: 15, color: '#aaa', shape: 'box' },
]

export default function Buildings({ buildingsRef, meshRefs, isEditorMode, editorMode }) {
  const [buildingsData, setBuildingsData] = useState(MAP_BUILDINGS)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedObject, setSelectedObject] = useState(null)
  
  const [transforms, setTransforms] = useState(() => {
    const t = {}
    MAP_BUILDINGS.forEach(b => { t[b.id] = { x: b.x, z: b.z, ry: 0 } })
    return t
  })

  useEffect(() => {
    if (buildingsRef) {
      const collisions = MAP_BUILDINGS.map(b => {
        const tr = transforms[b.id]
        let w = b.w, d = b.d, h = b.h
        if (b.isSpecial === 'uzga') { w = 250; d = 150; h = 30 }
        if (b.isSpecial === 'sima') { w = 400; d = 200; h = 30 }
        if (b.isSpecial === 'runway') { w = 800; d = 100; h = 1 }
        return { x: tr.x, z: tr.z, w, d, h }
      })
      buildingsRef.current = collisions
    }
  }, [transforms, buildingsRef])

  useEffect(() => {
    if (meshRefs) meshRefs.current = new Array(MAP_BUILDINGS.length).fill(null)
  }, [meshRefs])

  const handleSelect = (id, index, e) => {
    if (!isEditorMode) return
    e.stopPropagation()
    setSelectedId(id)
    setSelectedObject(meshRefs.current[index])
  }

  const handleDeselect = () => {
    if (isEditorMode) { setSelectedId(null); setSelectedObject(null) }
  }

  const handleTransformEnd = () => {
    if (!selectedObject || !selectedId) return
    const pos = selectedObject.position
    const rot = selectedObject.rotation
    setTransforms(prev => ({ ...prev, [selectedId]: { x: pos.x, z: pos.z, ry: rot.y } }))
  }

  return (
    <group onPointerMissed={handleDeselect}>
      {MAP_BUILDINGS.map((b, i) => {
        const tr = transforms[b.id]
        return (
          <group 
            key={b.id} 
            position={[tr.x, 0, tr.z]} 
            rotation={[0, tr.ry, 0]}
            onClick={(e) => handleSelect(b.id, i, e)} 
            ref={(el) => { if (meshRefs) meshRefs.current[i] = el }}
          >
            {b.isSpecial === 'uzga' && <UZGA isSelected={selectedId === b.id} />}
            {b.isSpecial === 'sima' && <SimaLend isSelected={selectedId === b.id} />}
            {b.isSpecial === 'runway' && <Runway />}
            {!b.isSpecial && <SimpleBuilding w={b.w} d={b.d} h={b.h} color={b.color} shape={b.shape} isSelected={selectedId === b.id} />}
          </group>
        )
      })}

      {isEditorMode && selectedObject && (
        <TransformControls object={selectedObject} mode={editorMode} showX={true} showY={false} showZ={true} onMouseUp={handleTransformEnd} />
      )}
    </group>
  )
}