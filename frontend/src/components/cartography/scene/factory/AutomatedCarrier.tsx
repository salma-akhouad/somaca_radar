import {
  useRef,
} from 'react'

import {
  useFrame,
} from '@react-three/fiber'

import type {
  Group,
} from 'three'


const START_X = -9
const END_X = 9
const ROUTE_Z = 5

const TRAVEL_DURATION = 34
const PAUSE_DURATION = 6

const HALF_CYCLE =
  TRAVEL_DURATION +
  PAUSE_DURATION

const FULL_CYCLE =
  HALF_CYCLE * 2


function smoothStep(
  value: number,
) {
  const clamped =
    Math.max(
      0,
      Math.min(1, value),
    )

  return (
    clamped *
    clamped *
    (3 - 2 * clamped)
  )
}


function PayloadWheel({
  position,
}: {
  position: [
    number,
    number,
    number,
  ]
}) {
  return (
    <group position={position}>
      <mesh
        rotation-x={Math.PI / 2}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.29,
            0.29,
            0.18,
            20,
          ]}
        />

        <meshStandardMaterial
          color="#1e2220"
          roughness={0.78}
        />
      </mesh>

      <mesh
        rotation-x={Math.PI / 2}
      >
        <cylinderGeometry
          args={[
            0.15,
            0.15,
            0.195,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#7d827e"
          metalness={0.62}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}


export function AutomatedCarrier() {
  const carrier =
    useRef<Group>(null)

  useFrame((state) => {
    if (!carrier.current) {
      return
    }

    const cycleTime =
      state.clock.elapsedTime %
      FULL_CYCLE

    let progress = 0
    let rotation = 0

    if (
      cycleTime <
      TRAVEL_DURATION
    ) {
      progress =
        smoothStep(
          cycleTime /
          TRAVEL_DURATION,
        )

      rotation = 0
    } else if (
      cycleTime <
      HALF_CYCLE
    ) {
      progress = 1
      rotation = 0
    } else if (
      cycleTime <
      HALF_CYCLE +
      TRAVEL_DURATION
    ) {
      const returnTime =
        cycleTime -
        HALF_CYCLE

      progress =
        1 -
        smoothStep(
          returnTime /
          TRAVEL_DURATION,
        )

      rotation = Math.PI
    } else {
      progress = 0
      rotation = Math.PI
    }

    carrier.current.position.x =
      START_X +
      (
        END_X -
        START_X
      ) *
      progress

    carrier.current.rotation.y =
      rotation
  })

  return (
    <group>
      {/* Dedicated internal logistics lane */}
      {[
        ROUTE_Z - 0.95,
        ROUTE_Z + 0.95,
      ].map((z) => (
        <mesh
          key={z}
          position={[
            0,
            0.027,
            z,
          ]}
        >
          <boxGeometry
            args={[
              20,
              0.01,
              0.045,
            ]}
          />

          <meshStandardMaterial
            color="#a98932"
            roughness={0.84}
          />
        </mesh>
      ))}

      <group
        ref={carrier}
        position={[
          START_X,
          0,
          ROUTE_Z,
        ]}
      >
        {/* AGV base */}
        <mesh
          castShadow
          position={[0, 0.29, 0]}
        >
          <boxGeometry
            args={[
              2.65,
              0.42,
              1.5,
            ]}
          />

          <meshStandardMaterial
            color="#3d433f"
            metalness={0.3}
            roughness={0.58}
          />
        </mesh>

        <mesh
          castShadow
          position={[0, 0.56, 0]}
        >
          <boxGeometry
            args={[
              2.15,
              0.14,
              1.08,
            ]}
          />

          <meshStandardMaterial
            color="#676d68"
            metalness={0.26}
            roughness={0.6}
          />
        </mesh>

        {/* Safety markings */}
        {[-0.92, 0.92].map((x) => (
          <mesh
            key={x}
            position={[
              x,
              0.52,
              -0.765,
            ]}
          >
            <boxGeometry
              args={[
                0.34,
                0.11,
                0.035,
              ]}
            />

            <meshStandardMaterial
              color="#c69b22"
              roughness={0.72}
            />
          </mesh>
        ))}

        {/* Payload rack */}
        {[-0.82, 0.82].map((x) => (
          <mesh
            key={`rack-${x}`}
            position={[
              x,
              1.18,
              0,
            ]}
            castShadow
          >
            <boxGeometry
              args={[
                0.08,
                1.35,
                1.05,
              ]}
            />

            <meshStandardMaterial
              color="#4c524e"
              metalness={0.42}
              roughness={0.46}
            />
          </mesh>
        ))}

        <mesh
          position={[0, 1.82, 0]}
          castShadow
        >
          <boxGeometry
            args={[
              1.72,
              0.08,
              1.05,
            ]}
          />

          <meshStandardMaterial
            color="#4c524e"
            metalness={0.42}
            roughness={0.46}
          />
        </mesh>

        {/* Wheel assemblies */}
        <PayloadWheel
          position={[
            -0.55,
            1.02,
            -0.02,
          ]}
        />

        <PayloadWheel
          position={[
            0.55,
            1.02,
            -0.02,
          ]}
        />

        <PayloadWheel
          position={[
            -0.55,
            1.6,
            -0.02,
          ]}
        />

        <PayloadWheel
          position={[
            0.55,
            1.6,
            -0.02,
          ]}
        />

        {/* AGV wheels */}
        {[-0.95, 0.95].flatMap(
          (x) =>
            [-0.54, 0.54].map(
              (z) => (
                <mesh
                  key={`${x}-${z}`}
                  castShadow
                  position={[
                    x,
                    0.12,
                    z,
                  ]}
                  rotation-z={
                    Math.PI / 2
                  }
                >
                  <cylinderGeometry
                    args={[
                      0.17,
                      0.17,
                      0.12,
                      12,
                    ]}
                  />

                  <meshStandardMaterial
                    color="#282c29"
                    roughness={0.74}
                  />
                </mesh>
              ),
            ),
        )}
      </group>
    </group>
  )
}