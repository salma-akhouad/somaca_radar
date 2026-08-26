import { Text } from '@react-three/drei'
import { VehicleBody } from './VehicleBody'

export function FinishedVehiclePark() {
  const vehicles = [
    {
      x: -5,
      z: -2.2,
      color: '#315f82',
    },
    {
      x: -1.7,
      z: -2.2,
      color: '#242725',
    },
    {
      x: 1.7,
      z: -2.2,
      color: '#8b6046',
    },
    {
      x: 5,
      z: -2.2,
      color: '#c76b32',
    },

    {
      x: -5,
      z: 2.2,
      color: '#242725',
    },
    {
      x: -1.7,
      z: 2.2,
      color: '#315f82',
    },
    {
      x: 1.7,
      z: 2.2,
      color: '#c76b32',
    },
    {
      x: 5,
      z: 2.2,
      color: '#8b6046',
    },
  ]

  return (
    <group
      position={[
        49,
        0,
        -19,
      ]}
    >
      {/* Asphalt */}
      <mesh
        position={[
          0,
          0.025,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            17,
            0.05,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#5b605c"
          roughness={0.97}
        />
      </mesh>

      {/* Parking dividers */}
      {[
        -6.7,
        -3.35,
        0,
        3.35,
        6.7,
      ].map((x) => (
        <mesh
          key={x}
          position={[
            x,
            0.06,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.055,
              0.02,
              10,
            ]}
          />

          <meshStandardMaterial
            color="#ededE8"
          />
        </mesh>
      ))}

      <mesh
        position={[
          0,
          0.06,
          0,
        ]}
      >
        <boxGeometry
          args={[
            15,
            0.02,
            0.06,
          ]}
        />

        <meshStandardMaterial
          color="#edede8"
        />
      </mesh>

      {vehicles.map(
        (
          vehicle,
          index,
        ) => (
          <VehicleBody
            key={index}
            position={[
              vehicle.x,
              0.02,
              vehicle.z,
            ]}
            rotation={
              Math.PI / 2
            }
            stage="finished"
            color={
              vehicle.color
            }
          />
        ),
      )}

      <Text
        position={[
          0,
          0.09,
          -6.6,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.62}
        color="#343835"
        anchorX="center"
      >
        PARC VÉHICULES FINIS
      </Text>
    </group>
  )
}