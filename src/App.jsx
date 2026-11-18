import { useRef, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import Player from './Player.jsx'
import Platform from './Platform.jsx'
import Lights from './Lights.jsx'
import CameraFollow from './CameraFollow.jsx'
import Buildings from './Buildings.jsx'

import './App.css'

const QUADRANT_TEXTS = { blue: 'Верхняя Салда', green: 'Алапаевск', red: 'Патруши', yellow: 'Уктус' }

function TopBanner({ text }) {
  if (!text) return null
  return (
    <div style={{ position: 'fixed', left: '50%', top: '32px', transform: 'translateX(-50%)', zIndex: 1000, padding: '16px 32px', background: 'rgba(0, 0, 0, 0.7)', color: '#fff', fontSize: '36px', fontWeight: 'bold', fontFamily: 'sans-serif', borderRadius: '12px', pointerEvents: 'none', textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)', animation: 'fadeInOut 1.8s ease-in-out', whiteSpace: 'nowrap' }}>
      {text}
    </div>
  )
}

function App() {
  const playerRef = useRef()
  const buildingsRef = useRef([])
  const meshRefs = useRef([])

  const [overlayText, setOverlayText] = useState('')
  const hideTimer = useRef(null)

  const [isEditorMode, setIsEditorMode] = useState(false)
  const [editorMode, setEditorMode] = useState('translate') 

  const handleQuadrantChange = useCallback((quadrant) => {
    if (!quadrant) return
    const text = QUADRANT_TEXTS[quadrant]
    if (!text) return
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setOverlayText(text)
    hideTimer.current = setTimeout(() => setOverlayText(''), 1800)
  }, [])

  return (
    <>
      <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 2000, display: 'flex', gap: '10px' }}>
        <button onClick={() => setIsEditorMode(!isEditorMode)} style={{ padding: '10px 20px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: isEditorMode ? '#ff4444' : '#44aa44', color: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          {isEditorMode ? 'ВЫКЛЮЧИТЬ РЕДАКТОР' : 'ВКЛЮЧИТЬ РЕДАКТОР'}
        </button>

        {isEditorMode && (
          <>
            <button onClick={() => setEditorMode('translate')} style={{ padding: '10px 20px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: editorMode === 'translate' ? '#007bff' : '#555', color: '#fff', border: 'none', borderRadius: '8px' }}>ДВИЖЕНИЕ</button>
            <button onClick={() => setEditorMode('rotate')} style={{ padding: '10px 20px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: editorMode === 'rotate' ? '#007bff' : '#555', color: '#fff', border: 'none', borderRadius: '8px' }}>ПОВОРОТ</button>
          </>
        )}
      </div>

      <Canvas shadows camera={{ position: [0, 1200, 1200], fov: 60, near: 1, far: 5000 }}>
        <Lights playerRef={playerRef} />
        <Platform />
        
        <Buildings 
          buildingsRef={buildingsRef} 
          meshRefs={meshRefs} 
          isEditorMode={isEditorMode} 
          editorMode={editorMode} 
        />
        
        <Player playerRef={playerRef} onQuadrantChange={handleQuadrantChange} buildingsRef={buildingsRef} />
        
        {isEditorMode ? (
          <OrbitControls makeDefault target={[0, 0, 0]} maxPolarAngle={0.3} minPolarAngle={0.1} maxDistance={2500} />
        ) : (
          <CameraFollow playerRef={playerRef} buildingsRef={buildingsRef} meshRefs={meshRefs} />
        )}
      </Canvas>

      <TopBanner text={overlayText} />
    </>
  )
}

export default App