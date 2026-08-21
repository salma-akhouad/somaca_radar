import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { MapControls } from './MapControls'
import { MapLegend } from './MapLegend'
import { MontageScene } from './scene/MontageScene'
import type { CameraAction, InteractionMode } from './scene/SceneCameraControls'

export function MapStage() {
  const [zoom, setZoom] = useState(100)
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('select')
  const [isPanning, setIsPanning] = useState(false)
  const [command, setCommand] = useState<{ type: CameraAction; id: number }>({ type: 'none', id: 0 })
  const sendCameraCommand = (type: CameraAction) => setCommand((current) => ({ type, id: current.id + 1 }))
  const startPanDrag = (event: React.PointerEvent<HTMLDivElement>) => { if (interactionMode === 'pan' && event.button === 0) setIsPanning(true) }

  return <section className="map-stage" aria-label="Zone de cartographie 3D Montage"><div className={`map-stage__canvas map-stage__canvas--${interactionMode} ${isPanning ? 'map-stage__canvas--dragging' : ''}`} onPointerDown={startPanDrag} onPointerUp={() => setIsPanning(false)} onPointerCancel={() => setIsPanning(false)} onPointerLeave={() => setIsPanning(false)}><Canvas shadows dpr={[1, 1.5]} camera={{ position: [17, 17, 17], fov: 42, near: 0.1, far: 120 }} gl={{ antialias: true }} aria-label="Sol industriel 3D Montage"><MontageScene command={command} interactionMode={interactionMode} onZoomChange={setZoom} /></Canvas></div><MapLegend /><MapControls zoom={zoom} interactionMode={interactionMode} onSelectMode={() => setInteractionMode('select')} onPanMode={() => setInteractionMode('pan')} onZoomIn={() => sendCameraCommand('zoom-in')} onZoomOut={() => sendCameraCommand('zoom-out')} onReset={() => sendCameraCommand('reset')} /></section>
}
