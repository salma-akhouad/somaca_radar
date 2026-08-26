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
}


export function ProductionStation({
  pole,
}: ProductionStationProps) {
  const machineSlots: Array<
    [number, number, number]
  > = [
    [-0.45, 0, -0.15],
    [0.72, 0, 0.18],
    [0.15, 0, 0.6],
  ]


  return (
    <group
      position={pole.position}
      rotation-y={
        pole.rotation ?? 0
      }
    >
      {/* =====================================================
          LOCAL POTEAU WORKSPACE
          ===================================================== */}

      <RoundedBox
        args={[3.15, 0.08, 2]}
        radius={0.08}
        smoothness={3}
        position={[0, 0.04, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#b7bab5"
          roughness={0.9}
        />
      </RoundedBox>


      {/* Safety edge */}
      <mesh
        position={[0, 0.09, 0.94]}
      >
        <boxGeometry args={[2.85, 0.025, 0.07]} />

        <meshStandardMaterial
          color="#d2a514"
          roughness={0.72}
        />
      </mesh>


      {/* =====================================================
          STRUCTURAL POTEAU
          ===================================================== */}

      <RoundedBox
        args={[0.18, 3.05, 0.18]}
        radius={0.035}
        smoothness={2}
        position={[-1.28, 1.53, -0.72]}
        castShadow
      >
        <meshStandardMaterial
          color="#4c514d"
          metalness={0.48}
          roughness={0.42}
        />
      </RoundedBox>


      {/* Foot protection */}
      <RoundedBox
        args={[0.38, 0.3, 0.38]}
        radius={0.05}
        smoothness={2}
        position={[-1.28, 0.15, -0.72]}
      >
        <meshStandardMaterial
          color="#d2a514"
          roughness={0.66}
        />
      </RoundedBox>


      {/* Upper tool/cable support */}
      <RoundedBox
        args={[2.15, 0.13, 0.13]}
        radius={0.035}
        smoothness={2}
        position={[-0.25, 2.95, -0.72]}
        castShadow
      >
        <meshStandardMaterial
          color="#4c514d"
          metalness={0.48}
          roughness={0.42}
        />
      </RoundedBox>


      {/* Hanging cable detail */}
      <mesh
        position={[0.55, 2.35, -0.72]}
      >
        <cylinderGeometry args={[0.025, 0.025, 1.1, 8]} />

        <meshStandardMaterial
          color="#252a27"
          roughness={0.62}
        />
      </mesh>


      {/* =====================================================
          POTEAU IDENTIFIER
          ===================================================== */}

      <Text
        position={[-1.28, 3.32, -0.72]}
        fontSize={0.37}
        color="#272c29"
        anchorX="center"
        anchorY="middle"
      >
        {pole.id}
      </Text>


      {/* =====================================================
          MACHINES ATTACHED TO THIS POTEAU
          ===================================================== */}

      {pole.machines.map(
        (
          machine,
          index,
        ) => {
          const slot =
            machineSlots[
              index %
                machineSlots.length
            ]

          return (
            <MachineVisual
              key={machine.id}
              kind={machine.kind}
              position={slot}
            />
          )
        },
      )}
    </group>
  )
}