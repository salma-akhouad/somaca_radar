import {
  Text,
} from '@react-three/drei'

import {
  VEHICLE_JOURNEY,
} from './data/vehicleJourney'

import {
  FactoryWorker,
} from './FactoryWorker'


export function ValidationTrack() {
  const validation =
    VEHICLE_JOURNEY.validation

  return (
    <group
      position={[
        validation.position[0],
        0,
        validation.position[2],
      ]}
    >
      {[
        -1.72,
        1.72,
      ].map(
        (z) => (
          <mesh
            key={z}
            position={[
              0,
              0.044,
              z,
            ]}
          >
            <boxGeometry
              args={[
                9.2,
                0.012,
                0.07,
              ]}
            />

            <meshStandardMaterial
              color="#e3e2da"
              roughness={0.82}
            />
          </mesh>
        ),
      )}


      {[
        -2.5,
        -1.65,
        -0.8,
      ].map(
        (
          x,
          index,
        ) => (
          <mesh
            key={x}
            position={[
              x,
              index === 1
                ? 0.075
                : 0.065,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.24,
                index === 1
                  ? 0.075
                  : 0.055,
                3.15,
              ]}
            />

            <meshStandardMaterial
              color={
                index === 1
                  ? '#666c68'
                  : '#767c78'
              }
              metalness={0.08}
              roughness={0.76}
            />
          </mesh>
        ),
      )}


      {[
        [0.35, -0.72],
        [1.05, 0.72],
        [1.75, -0.72],
        [2.45, 0.72],
      ].map(
        (
          [
            x,
            z,
          ],
          index,
        ) => (
          <mesh
            key={`${x}-${z}`}
            position={[
              x,
              index % 2 === 0
                ? 0.065
                : 0.075,
              z,
            ]}
          >
            <boxGeometry
              args={[
                0.52,
                index % 2 === 0
                  ? 0.055
                  : 0.075,
                0.72,
              ]}
            />

            <meshStandardMaterial
              color="#6d726f"
              metalness={0.08}
              roughness={0.74}
            />
          </mesh>
        ),
      )}


      {[
        3.35,
        3.75,
        4.15,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              0.047,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.08,
                0.014,
                3.35,
              ]}
            />

            <meshStandardMaterial
              color="#e8e7de"
              roughness={0.8}
            />
          </mesh>
        ),
      )}


      {/* Validation console */}

      <group
        position={[
          -0.9,
          0,
          2.75,
        ]}
      >
        <mesh
          position={[
            0,
            0.66,
            0,
          ]}
        >
          <boxGeometry
            args={[
              1.15,
              1.32,
              0.48,
            ]}
          />

          <meshStandardMaterial
            color="#4c524e"
            metalness={0.18}
            roughness={0.62}
          />
        </mesh>

        <mesh
          position={[
            0,
            0.93,
            -0.25,
          ]}
        >
          <boxGeometry
            args={[
              0.75,
              0.32,
              0.025,
            ]}
          />

          <meshStandardMaterial
            color="#aeb8b2"
            emissive="#626d67"
            emissiveIntensity={0.18}
          />
        </mesh>
      </group>


      <FactoryWorker
        position={[
          -0.9,
          0,
          3.45,
        ]}
        rotation={
          Math.PI
        }
        gender="woman"
        role="validation-console"
        phaseOffset={1.2}
      />


      <FactoryWorker
        position={[
          1.2,
          0,
          -2.85,
        ]}
        rotation={0}
        gender="man"
        role="validation-inspection"
        phaseOffset={4}
      />


      <mesh
        position={[
          0,
          0.052,
          -3.55,
        ]}
      >
        <boxGeometry
          args={[
            5.8,
            0.025,
            0.82,
          ]}
        />

        <meshStandardMaterial
          color="#343a37"
          roughness={0.78}
        />
      </mesh>


      <Text
        position={[
          0,
          0.083,
          -3.55,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.55}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        PISTE DE VALIDATION
      </Text>
    </group>
  )
}