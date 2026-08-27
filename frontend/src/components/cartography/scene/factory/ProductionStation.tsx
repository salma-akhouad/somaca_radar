import {
  RoundedBox,
  Text,
} from '@react-three/drei'

import {
  MachineVisual,
} from './MachineVisuals'

import type {
  PoleConfig,
} from './data/montageLayoutData'


interface ProductionStationProps {
  pole: PoleConfig
  onSelect?: (pole: PoleConfig) => void
}


const machineSlots: Array<
  [number, number, number]
> = [
  [-0.48, 0, -0.08],
  [0.7, 0, 0.18],
  [0.08, 0, 0.58],
]


export function ProductionStation({
  pole,
  onSelect,
}: ProductionStationProps) {
  return (
    <group
      position={pole.position}
      rotation-y={pole.rotation ?? 0}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.(pole)
      }}
    >
      {[-1.42, 1.42].map((x) => (
        <mesh
          key={`side-${x}`}
          position={[x, 0.041, 0]}
        >
          <boxGeometry
            args={[0.055, 0.012, 1.9]}
          />

          <meshStandardMaterial
            color="#917b38"
            roughness={0.78}
          />
        </mesh>
      ))}

      {[-0.95, 0.95].map((z) => (
        <mesh
          key={`edge-${z}`}
          position={[0, 0.041, z]}
        >
          <boxGeometry
            args={[2.9, 0.012, 0.055]}
          />

          <meshStandardMaterial
            color="#917b38"
            roughness={0.78}
          />
        </mesh>
      ))}

      <RoundedBox
        args={[0.2, 3.05, 0.2]}
        radius={0.035}
        smoothness={2}
        position={[-1.2, 1.53, -0.68]}
        castShadow
      >
        <meshStandardMaterial
          color="#484e4a"
          metalness={0.48}
          roughness={0.42}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.44, 0.32, 0.44]}
        radius={0.055}
        smoothness={2}
        position={[-1.2, 0.16, -0.68]}
      >
        <meshStandardMaterial
          color="#aa8b32"
          roughness={0.68}
        />
      </RoundedBox>

      <RoundedBox
        args={[2.05, 0.13, 0.13]}
        radius={0.035}
        smoothness={2}
        position={[-0.22, 2.95, -0.68]}
        castShadow
      >
        <meshStandardMaterial
          color="#484e4a"
          metalness={0.48}
          roughness={0.42}
        />
      </RoundedBox>

      <mesh
        position={[0.48, 2.36, -0.68]}
      >
        <cylinderGeometry
          args={[0.022, 0.022, 1.05, 8]}
        />

        <meshStandardMaterial
          color="#292e2b"
          roughness={0.64}
        />
      </mesh>

      <RoundedBox
        args={[0.72, 0.34, 0.055]}
        radius={0.04}
        smoothness={2}
        position={[-1.2, 3.34, -0.68]}
      >
        <meshStandardMaterial
          color="#e2e1da"
          metalness={0.06}
          roughness={0.68}
        />
      </RoundedBox>

      <Text
        position={[-1.2, 3.34, -0.715]}
        rotation-y={Math.PI}
        fontSize={0.18}
        color="#303531"
        anchorX="center"
        anchorY="middle"
      >
        {pole.id}
      </Text>

      <mesh
        position={[-1.2, 3.08, -0.68]}
      >
        <boxGeometry
          args={[0.46, 0.045, 0.05]}
        />

        <meshStandardMaterial
          color="#967e36"
          roughness={0.7}
        />
      </mesh>

      {pole.machines.map(
        (machine, index) => (
          <MachineVisual
            key={machine.id}
            kind={machine.kind}
            status={machine.status}
            position={
              machineSlots[
                index % machineSlots.length
              ]
            }
          />
        ),
      )}
    </group>
  )
}