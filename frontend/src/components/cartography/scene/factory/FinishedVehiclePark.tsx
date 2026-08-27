import {
  Text,
} from '@react-three/drei'

import {
  VehicleBody,
} from './VehicleBody'

import {
  VEHICLE_JOURNEY,
} from './data/vehicleJourney'


interface ParkedVehicle {
  x: number
  z: number
  color: string
}


const parkedVehicles:
  ParkedVehicle[] = [
    {
      x: -5,
      z: -2.25,
      color: '#e8e9e5',
    },
    {
      x: -1.7,
      z: -2.25,
      color: '#242826',
    },
    {
      x: 1.7,
      z: -2.25,
      color: '#314f64',
    },
    {
      x: 5,
      z: -2.25,
      color: '#53614d',
    },

    // x = -5, z = 2.25
    // Reserved arrival bay.

    {
      x: -1.7,
      z: 2.25,
      color: '#a17d32',
    },
    {
      x: 1.7,
      z: 2.25,
      color: '#633d32',
    },
    {
      x: 5,
      z: 2.25,
      color: '#8a8c87',
    },
  ]


export function FinishedVehiclePark() {
  const parkingBay =
    VEHICLE_JOURNEY
      .parkingBay

  return (
    <group
      position={[
        49,
        0,
        -19,
      ]}
    >
      <mesh
        position={[
          0,
          0.016,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            17,
            0.02,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#555a57"
          roughness={0.97}
          metalness={0}
        />
      </mesh>

      {/* Parking bay dividers */}
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
            0.036,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.055,
              0.012,
              10,
            ]}
          />

          <meshStandardMaterial
            color="#dbdbd4"
            roughness={0.82}
          />
        </mesh>
      ))}

      <mesh
        position={[
          0,
          0.036,
          0,
        ]}
      >
        <boxGeometry
          args={[
            13.4,
            0.012,
            0.055,
          ]}
        />

        <meshStandardMaterial
          color="#dbdbd4"
          roughness={0.82}
        />
      </mesh>

      {/* Parking entrance */}
      <mesh
        position={[
          -7.7,
          0.037,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.08,
            0.012,
            4.4,
          ]}
        />

        <meshStandardMaterial
          color="#c89d18"
          roughness={0.74}
        />
      </mesh>

      {[
        [-6.2, 0],
        [-5.2, 0.7],
        [-4.2, 1.4],
      ].map(
        ([x, z]) => (
          <mesh
            key={`${x}-${z}`}
            position={[
              x,
              0.04,
              z,
            ]}
            rotation-y={-0.18}
          >
            <boxGeometry
              args={[
                1.1,
                0.012,
                0.055,
              ]}
            />

            <meshStandardMaterial
              color="#b89229"
              roughness={0.76}
            />
          </mesh>
        ),
      )}

      {/* Existing finished vehicles */}
      {parkedVehicles.map(
        (
          vehicle,
          index,
        ) => (
          <VehicleBody
            key={
              `${vehicle.x}-${vehicle.z}-${index}`
            }
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

      {/* Reserved first accessible bay */}
      <group
        position={[
          parkingBay.position[0] -
            49,
          0,
          parkingBay.position[2] +
            19,
        ]}
      >
        <mesh
          position={[
            0,
            0.038,
            0,
          ]}
        >
          <boxGeometry
            args={[
              2.7,
              0.012,
              0.07,
            ]}
          />

          <meshStandardMaterial
            color="#73866f"
            roughness={0.82}
          />
        </mesh>

        <mesh
          position={[
            0,
            0.039,
            -1.05,
          ]}
        >
          <boxGeometry
            args={[
              2.7,
              0.012,
              0.055,
            ]}
          />

          <meshStandardMaterial
            color="#73866f"
            roughness={0.82}
          />
        </mesh>

        <Text
          position={[
            0,
            0.05,
            0.58,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          fontSize={0.28}
          color="#e2e4df"
          anchorX="center"
          anchorY="middle"
        >
          ARRIVÉE
        </Text>
      </group>

      <Text
        position={[
          0,
          0.052,
          -6.35,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.46}
        color="#2f3431"
        anchorX="center"
        anchorY="middle"
      >
        PARC VÉHICULES FINIS
      </Text>
    </group>
  )
}