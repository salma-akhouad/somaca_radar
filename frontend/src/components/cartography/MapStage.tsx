import {
  useState,
} from 'react'

import {
  Canvas,
} from '@react-three/fiber'

import {
  MapControls,
} from './MapControls'

import {
  MapLegend,
} from './MapLegend'

import {
  MontageScene,
} from './scene/MontageScene'

import type {
  CameraAction,
} from './scene/SceneCameraControls'


export function MapStage() {
  const [
    zoom,
    setZoom,
  ] = useState(100)

  const [
    command,
    setCommand,
  ] = useState<{
    type: CameraAction
    id: number
  }>({
    type: 'none',
    id: 0,
  })


  function sendCameraCommand(
    type: CameraAction,
  ) {
    setCommand(
      (current) => ({
        type,
        id:
          current.id + 1,
      }),
    )
  }

  return (
    <section
      className="map-stage"
      aria-label="Cartographie 3D Montage"
    >
      <div className="map-stage__canvas">
        <Canvas
          shadows

          dpr={[
            1,
            1.5,
          ]}

          camera={{
            position: [
              17,
              17,
              17,
            ],

            fov: 42,
            near: 0.1,
            far: 120,
          }}

          gl={{
            antialias: true,
          }}
        >
          <MontageScene
            command={command}
            onZoomChange={
              setZoom
            }
          />
        </Canvas>
      </div>


      <MapLegend />


      <MapControls
        zoom={zoom}
        onZoomIn={() =>
          sendCameraCommand(
            'zoom-in',
          )
        }

        onZoomOut={() =>
          sendCameraCommand(
            'zoom-out',
          )
        }

        onReset={() =>
          sendCameraCommand(
            'reset',
          )
        }
      />
    </section>
  )
}