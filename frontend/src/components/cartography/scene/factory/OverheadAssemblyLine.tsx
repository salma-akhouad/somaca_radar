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

import {
  ASSEMBLY_VEHICLE_COUNT,
  getAssemblyVehicleState,
} from './data/assemblyLineCycle'


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
        position={[
          0,
          2.5,
          0,
        ]}
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


      {direction !==
        'top' ? (
        <mesh
          position={[
            direction ===
              'left'
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
  wheelInstallProgress,
}: {
  stage: VehicleStage

  wheelInstallProgress: number
}) {
  const bodyHeight =
    stage === 'glazing'
      ? 2.25
      : 1.85


  return (
    <group>
      {/* trolley */}

      <mesh
        position={[
          0,
          4.9,
          0,
        ]}
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


      {/* hanger */}

      <mesh
        position={[
          0,
          3.82,
          0,
        ]}
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


      {/* suspension crossbeam */}

      <mesh
        position={[
          0,
          2.82,
          0,
        ]}
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
          bodyHeight -
          0.18,
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


      {[
        -0.95,
        0.95,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              bodyHeight +
              0.12,
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
          bodyHeight -
          0.62,
          0,
        ]}
        stage={stage}
        wheelInstallProgress={
          wheelInstallProgress
        }
      />
    </group>
  )
}


function AnimatedSuspendedVehicle({
  index,
}: {
  index: number
}) {
  const group =
    useRef<Group>(null)


  const initial =
    getAssemblyVehicleState(
      0,
      index,
    )


  const [
    stage,
    setStage,
  ] =
    useState<VehicleStage>(
      initial.stage,
    )


  const [
    wheelInstallProgress,
    setWheelInstallProgress,
  ] =
    useState(
      initial
        .wheelInstallProgress,
    )


  const stageRef =
    useRef(stage)

  const wheelProgressRef =
    useRef(
      wheelInstallProgress,
    )


  useFrame((state) => {
    if (
      !group.current
    ) {
      return
    }


    const vehicle =
      getAssemblyVehicleState(
        state.clock.elapsedTime,
        index,
      )


    group.current.visible =
      vehicle.visible


    if (
      !vehicle.visible
    ) {
      return
    }


    group.current.position.set(
      ...vehicle.position,
    )


    group.current.rotation.y =
      vehicle.rotation


    if (
      vehicle.stage !==
      stageRef.current
    ) {
      stageRef.current =
        vehicle.stage

      setStage(
        vehicle.stage,
      )
    }


    /*
     * Only update React when progress meaningfully changes.
     * This avoids causing a render every animation frame.
     */
    const roundedProgress =
      Math.round(
        vehicle
          .wheelInstallProgress *
        20,
      ) / 20


    if (
      roundedProgress !==
      wheelProgressRef.current
    ) {
      wheelProgressRef.current =
        roundedProgress

      setWheelInstallProgress(
        roundedProgress,
      )
    }
  })


  return (
    <group
      ref={group}
      position={
        initial.position
      }
      rotation-y={
        initial.rotation
      }
      visible={
        initial.visible
      }
    >
      {/*
   * Soft floor shadow for the suspended
   * moving vehicle. Cheap and readable
   * from the cartographic camera.
   */}
      <mesh
        position={[
          0,
          0.035,
          0,
        ]}
        rotation-x={
          -Math.PI / 2
        }
        scale={[
          2.15,
          0.92,
          1,
        ]}
      >
        <circleGeometry
          args={[
            1,
            28,
          ]}
        />

        <meshBasicMaterial
          color="#343936"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      <SuspendedVehiclePayload
        stage={stage}
        wheelInstallProgress={
          wheelInstallProgress
        }
      />
    </group>
  )
}


export function OverheadAssemblyLine() {
  return (
    <group>
      {/* entrance overhead rail */}

      <mesh
        position={[
          -17,
          5,
          -18.1,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.22,
            0.2,
            4.2,
          ]}
        />

        <meshStandardMaterial
          color="#242a26"
          metalness={0.68}
          roughness={0.3}
        />
      </mesh>


      {/* left branch */}

      <mesh
        position={[
          -17,
          5,
          0,
        ]}
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


      {/* upper branch */}

      <mesh
        position={[
          0,
          5,
          16,
        ]}
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


      {/* right branch */}

      <mesh
        position={[
          17,
          5,
          1.75,
        ]}
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


      {Array.from({
        length:
          ASSEMBLY_VEHICLE_COUNT,
      }).map(
        (
          _,
          index,
        ) => (
          <AnimatedSuspendedVehicle
            key={index}
            index={index}
          />
        ),
      )}


      {/* supports */}

      {[
        -12,
        -5,
        2,
        9,
        14,
      ].map(
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


      {[
        -10,
        -3,
        4,
        11,
      ].map(
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


      {[
        -12,
        -6,
        0,
        6,
        12,
      ].map(
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