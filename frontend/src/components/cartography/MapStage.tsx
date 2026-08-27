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

import type {
  PoleConfig,
} from './scene/factory/data/montageLayoutData'

import {
  PoleDetailsPanel,
} from './PoleDetailsPanel'


export function MapStage() {
  const [
    zoom,
    setZoom,
  ] =
    useState(100)

  const [
    command,
    setCommand,
  ] =
    useState<{
      type: CameraAction
      id: number
    }>({
      type: 'none',
      id: 0,
    })

  const [
    selectedPole,
    setSelectedPole,
  ] =
    useState<
      PoleConfig |
      null
    >(null)


  function sendCameraCommand(
    type: CameraAction,
  ) {
    setCommand(
      (current) => ({
        type,
        id:
          current.id +
          1,
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
              24,
              24,
              30,
            ],
            fov: 42,
            near: 0.1,
            far: 180,
          }}
          gl={{
            antialias: true,
          }}
          onPointerMissed={() =>
            setSelectedPole(
              null,
            )
          }
        >
          <MontageScene
            command={command}
            onZoomChange={
              setZoom
            }
            selectedPole={
              selectedPole
            }
            onPoleSelect={
              setSelectedPole
            }
          />
        </Canvas>
      </div>

      <MapLegend />

      {selectedPole && (
        <PoleDetailsPanel
          pole={
            selectedPole
          }
          onClose={() =>
            setSelectedPole(
              null,
            )
          }
        />
      )}

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