import {
  useRef,
  useState,
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


const CONVEYOR_PATH = [
  [-17, -16],
  [-17, 16],
  [17, 16],
  [17, -12.5],
] as const

const CONVEYOR_SPEED = 0.28
const RETURN_DURATION = 50
const VEHICLE_COUNT = 6


const segmentLengths =
  CONVEYOR_PATH
    .slice(0, -1)
    .map((point, index) => {
      const next =
        CONVEYOR_PATH[index + 1]

      const dx =
        next[0] - point[0]

      const dz =
        next[1] - point[1]

      return Math.sqrt(
        dx * dx +
        dz * dz,
      )
    })


const totalLength =
  segmentLengths.reduce(
    (sum, length) =>
      sum + length,
    0,
  )


const visibleDuration =
  totalLength /
  CONVEYOR_SPEED


const totalCycleDuration =
  visibleDuration +
  RETURN_DURATION


function stageForDistance(
  distance: number,
): VehicleStage {
  const progress =
    Math.max(
      0,
      Math.min(
        1,
        distance /
        totalLength,
      ),
    )

  if (progress < 0.19) {
    return 'shell'
  }

  if (progress < 0.36) {
    return 'glazing'
  }

  if (progress < 0.62) {
    return 'assembly'
  }

  if (progress < 0.81) {
    return 'documented'
  }

  return 'finished'
}


function samplePath(
  distance: number,
) {
  let remaining =
    Math.max(
      0,
      Math.min(
        totalLength - 0.0001,
        distance,
      ),
    )

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
      remaining -= segmentLength
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
      start[1] +
      (
        end[1] -
        start[1]
      ) *
      progress

    const dx =
      end[0] -
      start[0]

    const dz =
      end[1] -
      start[1]

    return {
      position: [
        x,
        0,
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
      0,
      -12.5,
    ] as [
      number,
      number,
      number,
    ],

    rotation:
      Math.PI / 2,
  }
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
          args={[
            0.16,
            5,
            0.16,
          ]}
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
            args={[
              1.95,
              0.14,
              0.14,
            ]}
          />

          <meshStandardMaterial
            color="#4b514d"
            metalness={0.48}
            roughness={0.4}
          />
        </mesh>
      ) : (
        <mesh
          position={[
            0,
            4.92,
            -0.9,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.14,
              0.14,
              1.95,
            ]}
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


function SuspendedVehiclePayload({
  stage,
}: {
  stage: VehicleStage
}) {
  const bodyHeight =
    stage === 'glazing'
      ? 2.25
      : 1.85

  return (
    <group>
      {/* Moving rail trolley */}
      <mesh
        position={[0, 4.9, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            0.72,
            0.18,
            0.42,
          ]}
        />

        <meshStandardMaterial
          color="#303632"
          metalness={0.68}
          roughness={0.3}
        />
      </mesh>

      {/* Vertical hanger */}
      <mesh
        position={[0, 3.82, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            0.12,
            2.05,
            0.12,
          ]}
        />

        <meshStandardMaterial
          color="#343a36"
          metalness={0.62}
          roughness={0.34}
        />
      </mesh>

      {/* Suspension beam */}
      <mesh
        position={[0, 2.82, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            2.85,
            0.13,
            0.16,
          ]}
        />

        <meshStandardMaterial
          color="#343a36"
          metalness={0.62}
          roughness={0.34}
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
          args={[
            2.95,
            0.11,
            0.16,
          ]}
        />

        <meshStandardMaterial
          color="#303632"
          metalness={0.6}
          roughness={0.34}
        />
      </mesh>

      {[-0.95, 0.95].map(
        (x) => (
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
              args={[
                0.11,
                0.88,
                0.11,
              ]}
            />

            <meshStandardMaterial
              color="#373d39"
              metalness={0.58}
              roughness={0.35}
            />
          </mesh>
        ),
      )}

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


function AnimatedSuspendedVehicle({
  offset,
}: {
  offset: number
}) {
  const group =
    useRef<Group>(null)

  const initialCycle =
    offset %
    totalCycleDuration

  const initialDistance =
    Math.min(
      initialCycle *
      CONVEYOR_SPEED,
      totalLength - 0.0001,
    )

  const [
    stage,
    setStage,
  ] =
    useState<VehicleStage>(
      stageForDistance(
        initialDistance,
      ),
    )

  const stageRef =
    useRef(stage)

  const initial =
    samplePath(
      initialDistance,
    )

  useFrame((state) => {
    if (!group.current) {
      return
    }

    const cycleTime =
      (
        state.clock.elapsedTime +
        offset
      ) %
      totalCycleDuration

    const returning =
      cycleTime >=
      visibleDuration

    group.current.visible =
      !returning

    if (returning) {
      return
    }

    const distance =
      Math.min(
        cycleTime *
        CONVEYOR_SPEED,
        totalLength - 0.0001,
      )

    const sample =
      samplePath(distance)

    group.current.position.set(
      ...sample.position,
    )

    group.current.rotation.y =
      sample.rotation

    const nextStage =
      stageForDistance(
        distance,
      )

    if (
      nextStage !==
      stageRef.current
    ) {
      stageRef.current =
        nextStage

      setStage(nextStage)
    }
  })

  return (
    <group
      ref={group}
      position={initial.position}
      rotation-y={initial.rotation}
      visible={
        initialCycle <
        visibleDuration
      }
    >
      <SuspendedVehiclePayload
        stage={stage}
      />
    </group>
  )
}


export function OverheadAssemblyLine() {
  return (
    <group>
      {/* Main U-shaped rail */}
      <mesh
        position={[-17, 5, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            0.22,
            0.2,
            32,
          ]}
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
          args={[
            34,
            0.2,
            0.22,
          ]}
        />

        <meshStandardMaterial
          color="#242a26"
          metalness={0.68}
          roughness={0.3}
        />
      </mesh>

      <mesh
        position={[17, 5, 1.75]}
        castShadow
      >
        <boxGeometry
          args={[
            0.22,
            0.2,
            28.5,
          ]}
        />

        <meshStandardMaterial
          color="#242a26"
          metalness={0.68}
          roughness={0.3}
        />
      </mesh>

      {/* Moving work-in-process vehicles */}
      {Array.from({
        length: VEHICLE_COUNT,
      }).map((_, index) => (
        <AnimatedSuspendedVehicle
          key={index}
          offset={
            (
              totalCycleDuration /
              VEHICLE_COUNT
            ) *
            index
          }
        />
      ))}

      {/* Structural supports */}
      {[-12, -5, 2, 9, 14].map(
        (z) => (
          <Support
            key={`left-${z}`}
            position={[
              -18.7,
              0,
              z,
            ]}
            direction="left"
          />
        ),
      )}

      {[-10, -3, 4, 11].map(
        (z) => (
          <Support
            key={`right-${z}`}
            position={[
              18.7,
              0,
              z,
            ]}
            direction="right"
          />
        ),
      )}

      {[-12, -6, 0, 6, 12].map(
        (x) => (
          <Support
            key={`top-${x}`}
            position={[
              x,
              0,
              17.7,
            ]}
            direction="top"
          />
        ),
      )}
    </group>
  )
}