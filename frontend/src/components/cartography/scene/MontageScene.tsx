import {
  FactoryFloor,
} from './FactoryFloor'

import {
  MontageLayout,
} from './MontageLayout'

import {
  SceneCameraControls,
} from './SceneCameraControls'

import type {
  CameraAction,
  NavigationMode,
} from './SceneCameraControls'


interface MontageSceneProps {
  command: {
    type: CameraAction
    id: number
  }

  navigationMode:
    NavigationMode

  onZoomChange:
    (zoom: number) => void
}


export function MontageScene({
  command,
  navigationMode,
  onZoomChange,
}: MontageSceneProps) {
  return (
    <>
      <color
        attach="background"
        args={[
          '#e7e7e1',
        ]}
      />

      <fog
        attach="fog"
        args={[
          '#e7e7e1',
          40,
          95,
        ]}
      />

      <hemisphereLight
        args={[
          '#fffdf6',
          '#a5a69f',
          1.25,
        ]}
      />

      <ambientLight
        intensity={0.35}
      />

      <directionalLight
        castShadow
        position={[
          18,
          26,
          14,
        ]}
        intensity={1.45}
        shadow-mapSize={[
          1024,
          1024,
        ]}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
      />

      <FactoryFloor />

      <MontageLayout />

      <SceneCameraControls
        command={command}

        navigationMode={
          navigationMode
        }

        onZoomChange={
          onZoomChange
        }
      />
    </>
  )
}