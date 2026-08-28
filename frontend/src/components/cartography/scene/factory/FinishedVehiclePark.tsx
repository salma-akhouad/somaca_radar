import {
  Text,
} from '@react-three/drei'

import {
  VehicleBody,
} from './VehicleBody'


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
      color: '#777d7a',
    },

    {
      x: -1.7,
      z: -2.25,
      color: '#282c2a',
    },

    {
      x: 1.7,
      z: -2.25,
      color: '#4d6575',
    },

    {
      x: 5,
      z: -2.25,
      color: '#a07e43',
    },

    {
      x: -1.7,
      z: 2.25,
      color: '#71463d',
    },

    {
      x: 1.7,
      z: 2.25,
      color: '#626866',
    },
  ]


export function FinishedVehiclePark() {
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
          color="#414643"
          roughness={0.97}
        />
      </mesh>


      {/* Central vehicle aisle */}

      <mesh
        position={[
          0,
          0.027,
          0,
        ]}
      >
        <boxGeometry
          args={[
            16.4,
            0.012,
            2.6,
          ]}
        />

        <meshStandardMaterial
          color="#474c49"
          roughness={0.96}
        />
      </mesh>


      {/* Bay separators */}

      {[
        -6.7,
        -3.35,
        0,
        3.35,
        6.7,
      ].map(
        (x) => (
          <group key={x}>
            <mesh
              position={[
                x,
                0.038,
                -3.45,
              ]}
            >
              <boxGeometry
                args={[
                  0.055,
                  0.012,
                  3.1,
                ]}
              />

              <meshStandardMaterial
                color="#dadbd5"
                roughness={0.82}
              />
            </mesh>

            <mesh
              position={[
                x,
                0.038,
                3.45,
              ]}
            >
              <boxGeometry
                args={[
                  0.055,
                  0.012,
                  3.1,
                ]}
              />

              <meshStandardMaterial
                color="#dadbd5"
                roughness={0.82}
              />
            </mesh>
          </group>
        ),
      )}


      {/* Parking access edges */}

      {[
        -1.3,
        1.3,
      ].map(
        (z) => (
          <mesh
            key={z}
            position={[
              -7.85,
              0.039,
              z,
            ]}
          >
            <boxGeometry
              args={[
                1.2,
                0.012,
                0.065,
              ]}
            />

            <meshStandardMaterial
              color="#c49a25"
              roughness={0.76}
            />
          </mesh>
        ),
      )}


      {parkedVehicles.map(
        (
          vehicle,
          index,
        ) => (
          <VehicleBody
            key={`${vehicle.x}-${vehicle.z}-${index}`}
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


      <mesh
        position={[
          3.2,
          0.046,
          -5.2,
        ]}
      >
        <boxGeometry
          args={[
            6.1,
            0.02,
            0.72,
          ]}
        />

        <meshStandardMaterial
          color="#292e2b"
          roughness={0.82}
        />
      </mesh>

      <Text
        position={[
          3.2,
          0.076,
          -5.2,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.42}
        color="#f0f0e9"
        anchorX="center"
        anchorY="middle"
      >
        PARC VÉHICULES FINIS
      </Text>
    </group>
  )
}