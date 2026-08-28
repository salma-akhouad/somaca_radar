import {
  useRef,
  useState,
} from 'react'

import {
  Text,
} from '@react-three/drei'

import {
  useFrame,
} from '@react-three/fiber'

import type {
  Group,
} from 'three'

import {
  LogisticsRoute,
} from '../markings/LogisticsRoute'

import {
  getLogisticsState,
  LOGISTICS_DELIVERY_POSITION,
  LOGISTICS_PICKUP_POSITION,
  LOGISTICS_ROUTE,
} from './data/logisticsCycle'

import type {
  LogisticsPhase,
} from './data/logisticsCycle'


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
        rotation-x={
          Math.PI / 2
        }
      >
        <cylinderGeometry
          args={[
            0.3,
            0.3,
            0.18,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#171b19"
          roughness={0.8}
        />
      </mesh>

      <mesh
        rotation-x={
          Math.PI / 2
        }
      >
        <cylinderGeometry
          args={[
            0.17,
            0.17,
            0.195,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#999f9b"
          metalness={0.68}
          roughness={0.28}
        />
      </mesh>
    </group>
  )
}


export function AutomatedCarrier() {
  const carrier =
    useRef<Group>(null)

  const [
    visibleWheelCount,
    setVisibleWheelCount,
  ] =
    useState<
      0 | 1 | 2 | 3 | 4
    >(0)

  const [
    phase,
    setPhase,
  ] =
    useState<LogisticsPhase>(
      'pickup',
    )

  const wheelCountRef =
    useRef<
      0 | 1 | 2 | 3 | 4
    >(0)

  const phaseRef =
    useRef<LogisticsPhase>(
      'pickup',
    )


  useFrame(
    (state) => {
      if (
        !carrier.current
      ) {
        return
      }


      const logistics =
        getLogisticsState(
          state.clock.elapsedTime,
        )


      carrier.current.position.set(
        logistics.x,
        0,
        logistics.z,
      )

      carrier.current.rotation.y =
        logistics.rotation


      if (
        logistics.wheelCount !==
        wheelCountRef.current
      ) {
        wheelCountRef.current =
          logistics.wheelCount

        setVisibleWheelCount(
          logistics.wheelCount,
        )
      }


      if (
        logistics.phase !==
        phaseRef.current
      ) {
        phaseRef.current =
          logistics.phase

        setPhase(
          logistics.phase,
        )
      }
    },
  )


  const moving =
    phase ===
      'outbound' ||
    phase ===
      'return'


  const routePoints =
    LOGISTICS_ROUTE.map(
      (
        [
          x,
          z,
        ],
      ) => ({
        x,
        z,
      }),
    )


  const payloadPositions:
    Array<[
      number,
      number,
      number,
    ]> = [
      [-0.55, 1.03, 0],
      [0.55, 1.03, 0],
      [-0.55, 1.61, 0],
      [0.55, 1.61, 0],
    ]


  return (
    <group>
      <LogisticsRoute
        points={
          routePoints
        }
      />


      <Text
        position={[
          LOGISTICS_PICKUP_POSITION[0],
          0.07,
          LOGISTICS_PICKUP_POSITION[1] -
          1.7,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.32}
        color="#353a37"
        anchorX="center"
        anchorY="middle"
      >
        CHARGEMENT ROUES
      </Text>


      <Text
        position={[
          LOGISTICS_DELIVERY_POSITION[0],
          0.07,
          LOGISTICS_DELIVERY_POSITION[1] -
          1.55,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.32}
        color="#353a37"
        anchorX="center"
        anchorY="middle"
      >
        LIVRAISON ROUES
      </Text>


      <group
        ref={carrier}
        position={[
          LOGISTICS_PICKUP_POSITION[0],
          0,
          LOGISTICS_PICKUP_POSITION[1],
        ]}
      >
        <mesh
          position={[
            0,
            0.3,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              2.6,
              0.44,
              1.48,
            ]}
          />

          <meshStandardMaterial
            color="#353a37"
            metalness={0.3}
            roughness={0.58}
          />
        </mesh>


        {[
          -1.18,
          1.18,
        ].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                0.34,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.16,
                  0.36,
                  1.42,
                ]}
              />

              <meshStandardMaterial
                color="#c99e29"
                roughness={0.7}
              />
            </mesh>
          ),
        )}


        <mesh
          position={[
            0,
            0.57,
            0,
          ]}
        >
          <boxGeometry
            args={[
              2.15,
              0.14,
              1.08,
            ]}
          />

          <meshStandardMaterial
            color="#555b57"
            metalness={0.24}
            roughness={0.52}
          />
        </mesh>


        {[
          -0.83,
          0.83,
        ].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                1.2,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.075,
                  1.4,
                  1.02,
                ]}
              />

              <meshStandardMaterial
                color="#434945"
                metalness={0.44}
                roughness={0.42}
              />
            </mesh>
          ),
        )}


        <mesh
          position={[
            0,
            1.88,
            0,
          ]}
        >
          <boxGeometry
            args={[
              1.75,
              0.08,
              1.02,
            ]}
          />

          <meshStandardMaterial
            color="#434945"
            metalness={0.44}
            roughness={0.42}
          />
        </mesh>


        {payloadPositions.map(
          (
            position,
            index,
          ) =>
            index <
            visibleWheelCount ? (
              <PayloadWheel
                key={index}
                position={position}
              />
            ) : null,
        )}


        {[
          -0.94,
          0.94,
        ].flatMap(
          (x) =>
            [
              -0.54,
              0.54,
            ].map(
              (z) => (
                <mesh
                  key={`${x}-${z}`}
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
                      10,
                    ]}
                  />

                  <meshStandardMaterial
                    color="#242826"
                    roughness={0.76}
                  />
                </mesh>
              ),
            ),
        )}


        <mesh
          position={[
            -0.84,
            0.85,
            0,
          ]}
        >
          <cylinderGeometry
            args={[
              0.09,
              0.11,
              0.14,
              10,
            ]}
          />

          <meshStandardMaterial
            color={
              moving
                ? '#f0aa25'
                : '#8e6b2e'
            }
            emissive="#e49b1c"
            emissiveIntensity={
              moving
                ? 1.2
                : 0.06
            }
          />
        </mesh>


        <mesh
          position={[
            0,
            0.66,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.86,
              0.025,
              0.4,
            ]}
          />

          <meshStandardMaterial
            color="#292e2b"
          />
        </mesh>


        <Text
          position={[
            0,
            0.685,
            0,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          AGV
        </Text>
      </group>
    </group>
  )
}