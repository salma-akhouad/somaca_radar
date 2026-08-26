import type {
  VehicleStage,
} from './VehicleBody'

import {
  VehicleBody,
} from './VehicleBody'


interface SuspendedVehicleProps {
  position: [
    number,
    number,
    number,
  ]

  rotation?: number
  raised?: boolean
  stage: VehicleStage
}


function SuspendedVehicle({
  position,
  rotation = 0,
  raised = false,
  stage,
}: SuspendedVehicleProps) {
  const bodyHeight =
    raised
      ? 2.5
      : 1.85

  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      <mesh
        position={[0, 3.72, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.12, 1.85, 0.12]}
        />

        <meshStandardMaterial
          color="#343a36"
          metalness={0.64}
          roughness={0.32}
        />
      </mesh>

      <mesh
        position={[0, 2.82, 0]}
        castShadow
      >
        <boxGeometry
          args={[2.85, 0.13, 0.16]}
        />

        <meshStandardMaterial
          color="#343a36"
          metalness={0.64}
          roughness={0.32}
        />
      </mesh>

      <mesh
        position={[
          0,
          bodyHeight - 0.18,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[2.95, 0.11, 0.16]}
        />

        <meshStandardMaterial
          color="#303632"
          metalness={0.6}
          roughness={0.34}
        />
      </mesh>

      {[-0.95, 0.95].map((x) => (
        <mesh
          key={x}
          position={[
            x,
            bodyHeight + 0.12,
            0,
          ]}
          rotation-z={
            x < 0
              ? -0.33
              : 0.33
          }
          castShadow
        >
          <boxGeometry
            args={[0.11, 0.88, 0.11]}
          />

          <meshStandardMaterial
            color="#373d39"
            metalness={0.58}
            roughness={0.35}
          />
        </mesh>
      ))}

      <VehicleBody
        position={[
          0,
          bodyHeight - 0.62,
          0,
        ]}
        stage={stage}
      />
    </group>
  )
}


function Support({
  position,
  direction,
}: {
  position: [
    number,
    number,
    number,
  ]

  direction:
    | 'left'
    | 'right'
    | 'top'
}) {
  return (
    <group position={position}>
      <mesh
        position={[0, 2.5, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.16, 5, 0.16]}
        />

        <meshStandardMaterial
          color="#4b514d"
          metalness={0.48}
          roughness={0.4}
        />
      </mesh>

      {direction !== 'top' ? (
        <mesh
          position={[
            direction === 'left'
              ? 0.9
              : -0.9,
            4.92,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[1.95, 0.14, 0.14]}
          />

          <meshStandardMaterial
            color="#4b514d"
            metalness={0.48}
            roughness={0.4}
          />
        </mesh>
      ) : (
        <mesh
          position={[0, 4.92, -0.9]}
          castShadow
        >
          <boxGeometry
            args={[0.14, 0.14, 1.95]}
          />

          <meshStandardMaterial
            color="#4b514d"
            metalness={0.48}
            roughness={0.4}
          />
        </mesh>
      )}
    </group>
  )
}


export function OverheadAssemblyLine() {
  return (
    <group>
      <mesh
        position={[-17, 5, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.22, 0.2, 32]}
        />

        <meshStandardMaterial
          color="#242a26"
          metalness={0.68}
          roughness={0.3}
        />
      </mesh>

      <mesh
        position={[0, 5, 16]}
        castShadow
      >
        <boxGeometry
          args={[34, 0.2, 0.22]}
        />

        <meshStandardMaterial
          color="#242a26"
          metalness={0.68}
          roughness={0.3}
        />
      </mesh>

      <mesh
        position={[17, 5, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.22, 0.2, 32]}
        />

        <meshStandardMaterial
          color="#242a26"
          metalness={0.68}
          roughness={0.3}
        />
      </mesh>

      {[-12, -5, 2, 9, 14].map((z) => (
        <Support
          key={`left-${z}`}
          position={[
            -18.7,
            0,
            z,
          ]}
          direction="left"
        />
      ))}

      {[-12, -5, 2, 9, 14].map((z) => (
        <Support
          key={`right-${z}`}
          position={[
            18.7,
            0,
            z,
          ]}
          direction="right"
        />
      ))}

      {[-12, -6, 0, 6, 12].map((x) => (
        <Support
          key={`top-${x}`}
          position={[
            x,
            0,
            17.7,
          ]}
          direction="top"
        />
      ))}

      <SuspendedVehicle
        position={[
          -17,
          0,
          -12,
        ]}
        rotation={
          -Math.PI / 2
        }
        stage="shell"
      />

      <SuspendedVehicle
        position={[
          -17,
          0,
          -4,
        ]}
        rotation={
          -Math.PI / 2
        }
        stage="glazing"
        raised
      />

      <SuspendedVehicle
        position={[
          -17,
          0,
          5,
        ]}
        rotation={
          -Math.PI / 2
        }
        stage="assembly"
      />

      <SuspendedVehicle
        position={[
          -11,
          0,
          16,
        ]}
        stage="assembly"
      />

      <SuspendedVehicle
        position={[
          -2,
          0,
          16,
        ]}
        stage="documented"
      />

      <SuspendedVehicle
        position={[
          7,
          0,
          16,
        ]}
        stage="finished"
      />

      <SuspendedVehicle
        position={[
          17,
          0,
          7,
        ]}
        rotation={
          Math.PI / 2
        }
        stage="finished"
      />

    </group>
  )
}