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
} from './SceneCameraControls'

import {
  FactoryEnvelope,
} from './factory/FactoryEnvelope'

import type {
  PoleConfig,
} from './factory/data/montageLayoutData'


interface MontageSceneProps {
  command: {
    type: CameraAction
    id: number
  }

  onZoomChange:
  (zoom: number) => void

  selectedPole:
  PoleConfig | null

  onPoleSelect:
  (pole: PoleConfig) => void

  onClearPoleSelection:
  () => void
}


export function MontageScene({
  command,
  onZoomChange,
  selectedPole,
  onPoleSelect,
  onClearPoleSelection,
}: MontageSceneProps) {
  return (
    <>
      <color
        attach="background"
        args={[
          '#c9cbc6',
        ]}
      />

      <fog
        attach="fog"
        args={[
          '#c9cbc6',
          55,
          120,
        ]}
      />

      <hemisphereLight
        args={[
          '#f4f2e9',
          '#858984',
          0.85,
        ]}
      />

      <ambientLight
        intensity={0.22}
      />

      <directionalLight
        castShadow
        position={[
          22,
          30,
          18,
        ]}
        intensity={1.05}
        shadow-mapSize={[
          2048,
          2048,
        ]}
        shadow-camera-left={-55}
        shadow-camera-right={75}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.00015}
      />

      {[
        [-20, 16],
        [20, 16],
        [60, 16],
        [-20, -16],
        [20, -16],
        [60, -16],
      ].map(([x, z]) => (
        <pointLight
          key={`${x}-${z}`}
          position={[
            x,
            7.1,
            z,
          ]}
          color="#f1eee1"
          intensity={0.3}
          distance={24}
          decay={2}
        />
      ))}

      <FactoryFloor />

      <mesh
        position={[15, -0.01, 0]}
        rotation-x={-Math.PI / 2}
        onPointerDown={(event) => {
          event.stopPropagation()
        }}
        onClick={(event) => {
          event.stopPropagation()
          onClearPoleSelection()
        }}
      >
        <planeGeometry
          args={[
            130,
            100,
          ]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <FactoryEnvelope />

      <MontageLayout
        selectedPoleId={
          selectedPole?.id ?? null
        }
        onPoleSelect={
          onPoleSelect
        }
      />

      <SceneCameraControls
        command={command}
        onZoomChange={
          onZoomChange
        }
      />
    </>
  )
}