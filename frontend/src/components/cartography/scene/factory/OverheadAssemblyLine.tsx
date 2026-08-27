import {
  useRef,
} from 'react'

import {
  useFrame,
} from '@react-three/fiber'

import type {
  Group,
} from 'three'

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


/*
  The overhead rail follows the same U shape as
  the production line:

  left side -> top -> right side

  These points describe only the conveyor rail.
*/
const CONVEYOR_PATH = [
  [-17, 5, -16],
  [-17, 5, 16],
  [17, 5, 16],
  [17, 5, -16],
] as const


const CONVEYOR_SPEED = 0.32

const CONVEYOR_RETURN_DURATION = 40

/*
  Six carriers remain evenly spaced.

  Because they all use the same clock and speed,
  their relative spacing never changes.
*/
const CONVEYOR_CARRIER_COUNT = 6


const segmentLengths =
  CONVEYOR_PATH
    .slice(0, -1)
    .map((point, index) => {
      const next =
        CONVEYOR_PATH[index + 1]

      const dx =
        next[0] - point[0]

      const dz =
        next[2] - point[2]

      return Math.sqrt(
        dx * dx +
        dz * dz,
      )
    })


const totalConveyorLength =
  segmentLengths.reduce(
    (total, length) =>
      total + length,
    0,
  )

const visibleConveyorDuration =
  totalConveyorLength /
  CONVEYOR_SPEED


const totalConveyorCycleDuration =
  visibleConveyorDuration +
  CONVEYOR_RETURN_DURATION


function sampleConveyorPath(
  distance: number,
) {
  let remaining =
    (
      distance %
      totalConveyorLength +
      totalConveyorLength
    ) %
    totalConveyorLength

  for (
    let index = 0;
    index < segmentLengths.length;
    index += 1
  ) {
    const segmentLength =
      segmentLengths[index]

    if (
      remaining >
      segmentLength
    ) {
      remaining -=
        segmentLength

      continue
    }

    const start =
      CONVEYOR_PATH[index]

    const end =
      CONVEYOR_PATH[index + 1]

    const progress =
      segmentLength === 0
        ? 0
        : remaining /
        segmentLength

    const x =
      start[0] +
      (
        end[0] -
        start[0]
      ) *
      progress

    const z =
      start[2] +
      (
        end[2] -
        start[2]
      ) *
      progress

    const dx =
      end[0] -
      start[0]

    const dz =
      end[2] -
      start[2]

    return {
      position: [
        x,
        4.94,
        z,
      ] as [
          number,
          number,
          number,
        ],

      rotation:
        Math.atan2(
          -dz,
          dx,
        ),
    }
  }

  return {
    position: [
      17,
      4.94,
      -16,
    ] as [
        number,
        number,
        number,
      ],

    rotation:
      Math.PI / 2,
  }
}


function AnimatedConveyorCarrier({
  offset,
}: {
  offset: number
}) {
  const carrier =
    useRef<Group>(null)

  useFrame((state) => {
    if (!carrier.current) {
      return
    }


    const cycleTime =
      (
        state.clock.elapsedTime +
        offset
      ) %
      totalConveyorCycleDuration


    const isReturning =
      cycleTime >=
      visibleConveyorDuration


    carrier.current.visible =
      !isReturning


    if (isReturning) {
      return
    }


    const travelledDistance =
      cycleTime *
      CONVEYOR_SPEED


    const sample =
      sampleConveyorPath(
        travelledDistance,
      )


    carrier.current.position.set(
      ...sample.position,
    )

    carrier.current.rotation.y =
      sample.rotation
  })


  const initialCycleTime =
    offset %
    totalConveyorCycleDuration


  const initiallyVisible =
    initialCycleTime <
    visibleConveyorDuration


  const initial =
    sampleConveyorPath(
      Math.min(
        initialCycleTime,
        visibleConveyorDuration,
      ) *
      CONVEYOR_SPEED,
    )


  return (
    <group
      ref={carrier}
      position={initial.position}
      rotation-y={initial.rotation}
      visible={initiallyVisible}
    >
      <mesh castShadow>
        <boxGeometry
          args={[
            0.72,
            0.18,
            0.42,
          ]}
        />

        <meshStandardMaterial
          color="#303632"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      <mesh
        position={[
          0,
          -0.22,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.18,
            0.34,
            0.18,
          ]}
        />

        <meshStandardMaterial
          color="#454b47"
          metalness={0.58}
          roughness={0.36}
        />
      </mesh>
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

      {Array.from({
        length:
          CONVEYOR_CARRIER_COUNT,
      }).map((_, index) => (
        <AnimatedConveyorCarrier
          key={index}
          offset={
            (
              totalConveyorCycleDuration /
              CONVEYOR_CARRIER_COUNT
            ) *
            index
          }
        />
      ))}

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