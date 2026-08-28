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
}


const CEILING_LIGHTS:
  Array<
    [
      number,
      number,
    ]
  > = [
    [-20, 16],
    [20, 16],
    [60, 16],
    [-20, -16],
    [20, -16],
    [60, -16],
  ]


export function MontageScene({
  command,
  onZoomChange,
  selectedPole,
  onPoleSelect,
}: MontageSceneProps) {
  return (
    <>
      <color
        attach="background"
        args={[
          '#d5d7d2',
        ]}
      />


      <fog
        attach="fog"
        args={[
          '#d5d7d2',
          72,
          165,
        ]}
      />


      <hemisphereLight
        args={[
          '#f6f4e9',
          '#8a8f89',
          0.9,
        ]}
      />


      <ambientLight
        intensity={0.24}
      />


      <directionalLight
        castShadow
        position={[
          26,
          32,
          20,
        ]}
        color="#f0eee4"
        intensity={0.76}
        shadow-mapSize={[
          2048,
          2048,
        ]}
        shadow-camera-left={-55}
        shadow-camera-right={75}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={
          -0.00015
        }
      />


      {CEILING_LIGHTS.map(
        (
          [
            x,
            z,
          ],
        ) => (
          <rectAreaLight
            key={`${x}-${z}`}
            position={[
              x,
              6.15,
              z,
            ]}
            rotation={[
              -Math.PI / 2,
              0,
              0,
            ]}
            color="#fff0cf"
            intensity={5.35}
            width={19}
            height={15}
          />
        ),
      )}


      <FactoryFloor />

      <FactoryEnvelope />


      <MontageLayout
        selectedPoleId={
          selectedPole?.id ??
          null
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