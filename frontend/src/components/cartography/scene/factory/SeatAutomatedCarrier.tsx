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
  CarSeat,
} from './SeatStockArea'

import {
  getSeatLogisticsState,
  SEAT_DELIVERY_POSITION,
  SEAT_LOGISTICS_ROUTE,
  SEAT_PICKUP_POSITION,
} from './data/seatLogisticsCycle'

import type {
  SeatLogisticsPhase,
} from './data/seatLogisticsCycle'

import {
  ProtectedFloorLabel,
} from '../markings/ProtectedFloorLabel'


export function SeatAutomatedCarrier() {
  const carrier =
    useRef<Group>(null)


  const [
    visibleSeatCount,
    setVisibleSeatCount,
  ] =
    useState<
      0 | 1 | 2
    >(0)


  const [
    phase,
    setPhase,
  ] =
    useState<SeatLogisticsPhase>(
      'pickup',
    )


  const seatCountRef =
    useRef<
      0 | 1 | 2
    >(0)


  const phaseRef =
    useRef<SeatLogisticsPhase>(
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
        getSeatLogisticsState(
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
        logistics.seatCount !==
        seatCountRef.current
      ) {
        seatCountRef.current =
          logistics.seatCount

        setVisibleSeatCount(
          logistics.seatCount,
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
    SEAT_LOGISTICS_ROUTE.map(
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


  return (
    <group>
      <LogisticsRoute
        points={
          routePoints
        }
        width={1.9}
      />


      <ProtectedFloorLabel
        position={[
          SEAT_PICKUP_POSITION[0],
          0,
          SEAT_PICKUP_POSITION[1] -
          1.8,
        ]}
        text="CHARGEMENT SIÈGES"
        width={5}
      />


      <ProtectedFloorLabel
        position={[
          SEAT_DELIVERY_POSITION[0],
          0,
          SEAT_DELIVERY_POSITION[1] +
          1.55,
        ]}
        text="LIVRAISON SIÈGES"
        width={4.8}
      />


      <group
        ref={carrier}
        position={[
          SEAT_PICKUP_POSITION[0],
          0,
          SEAT_PICKUP_POSITION[1],
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
              2.8,
              0.44,
              1.65,
            ]}
          />

          <meshStandardMaterial
            color="#353a37"
            metalness={0.3}
            roughness={0.58}
          />
        </mesh>


        {[
          -1.26,
          1.26,
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
                  1.58,
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
              2.3,
              0.14,
              1.24,
            ]}
          />

          <meshStandardMaterial
            color="#555b57"
            metalness={0.24}
            roughness={0.52}
          />
        </mesh>


        {[
          -0.92,
          0.92,
        ].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                1.18,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.075,
                  1.34,
                  1.18,
                ]}
              />

              <meshStandardMaterial
                color="#434945"
                metalness={0.42}
                roughness={0.44}
              />
            </mesh>
          ),
        )}


        <mesh
          position={[
            0,
            1.82,
            0,
          ]}
        >
          <boxGeometry
            args={[
              1.92,
              0.08,
              1.18,
            ]}
          />

          <meshStandardMaterial
            color="#434945"
            metalness={0.42}
            roughness={0.44}
          />
        </mesh>


        {visibleSeatCount >=
          1 && (
            <CarSeat
              position={[
                -0.55,
                0.53,
                0,
              ]}
              rotation={0}
            />
          )}


        {visibleSeatCount >=
          2 && (
            <CarSeat
              position={[
                0.55,
                0.53,
                0,
              ]}
              rotation={0}
            />
          )}


        {[
          -1.02,
          1.02,
        ].flatMap(
          (x) =>
            [
              -0.61,
              0.61,
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
            -0.92,
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
              1,
              0.025,
              0.42,
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
          fontSize={0.23}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          AGV SIÈGES
        </Text>
      </group>
    </group>
  )
}