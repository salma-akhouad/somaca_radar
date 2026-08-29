import {
  RoundedBox,
} from '@react-three/drei'

import {
  useRef,
} from 'react'

import {
  useFrame,
} from '@react-three/fiber'

import type {
  Group,
} from 'three'

import {
  VehicleBody,
} from './VehicleBody'

import {
  VEHICLE_JOURNEY,
} from './data/vehicleJourney'

import {
  getFinishedVehicleCycleTime,
  GROUND_VEHICLE_RELEASE_TIME,
  LIFT_RETURN_DELAY,
  LIFT_RETURN_DURATION,
  LOWERING_DURATION,
  LOWERING_TOP_WAIT,
} from './data/vehicleContinuity'


function smoothStep(
  value: number,
) {
  const t =
    Math.max(
      0,
      Math.min(
        1,
        value,
      ),
    )

  return (
    t *
    t *
    (
      3 -
      2 * t
    )
  )
}


export function LoweringStation() {
  const lowered =
    VEHICLE_JOURNEY.lowered


  const cradle =
    useRef<Group>(null)


  const loweringVehicle =
    useRef<Group>(null)


  useFrame(
    (state) => {
      if (
        !cradle.current ||
        !loweringVehicle.current
      ) {
        return
      }


      const time =
        getFinishedVehicleCycleTime(
          state.clock.elapsedTime,
        )


      /*
       * No completed production car yet.
       */
      if (
        time <
        0
      ) {
        cradle.current.position.y =
          1.72

        loweringVehicle.current.visible =
          false

        return
      }


      let cradleY =
        1.72


      if (
        time <
        LOWERING_TOP_WAIT
      ) {
        cradleY =
          1.72
      } else if (
        time <
        LOWERING_TOP_WAIT +
        LOWERING_DURATION
      ) {
        const progress =
          smoothStep(
            (
              time -
              LOWERING_TOP_WAIT
            ) /
            LOWERING_DURATION,
          )


        cradleY =
          1.72 *
          (
            1 -
            progress
          )
      } else if (
        time <
        GROUND_VEHICLE_RELEASE_TIME +
        LIFT_RETURN_DELAY
      ) {
        cradleY =
          0
      } else if (
        time <
        GROUND_VEHICLE_RELEASE_TIME +
        LIFT_RETURN_DELAY +
        LIFT_RETURN_DURATION
      ) {
        const returnStart =
          GROUND_VEHICLE_RELEASE_TIME +
          LIFT_RETURN_DELAY


        const progress =
          smoothStep(
            (
              time -
              returnStart
            ) /
            LIFT_RETURN_DURATION,
          )


        cradleY =
          1.72 *
          progress
      } else {
        cradleY =
          1.72
      }


      cradle.current.position.y =
        cradleY


      /*
       * Exact handoff:
       *
       * lowering copy disappears at the same
       * threshold at which the ground journey
       * copy becomes visible.
       */
      loweringVehicle.current.visible =
        time <
        GROUND_VEHICLE_RELEASE_TIME
    },
  )


  return (
    <group
      position={[
        lowered.position[0],
        0,
        lowered.position[2],
      ]}
    >
      <RoundedBox
        args={[
          4.25,
          0.14,
          0.24,
        ]}
        radius={0.04}
        smoothness={2}
        position={[
          0,
          4.35,
          0,
        ]}
        castShadow
      >
        <meshStandardMaterial
          color="#373d3a"
          metalness={0.58}
          roughness={0.36}
        />
      </RoundedBox>


      {[
        -1.75,
        1.75,
      ].map(
        (x) => (
          <group key={x}>
            <mesh
              position={[
                x,
                2.2,
                0,
              ]}
              castShadow
            >
              <boxGeometry
                args={[
                  0.14,
                  4.4,
                  0.14,
                ]}
              />

              <meshStandardMaterial
                color="#454c48"
                metalness={0.5}
                roughness={0.42}
              />
            </mesh>


            <mesh
              position={[
                x +
                (
                  x < 0
                    ? 0.08
                    : -0.08
                ),
                1.25,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.035,
                  1.75,
                  0.16,
                ]}
              />

              <meshStandardMaterial
                color="#d0a425"
                roughness={0.7}
              />
            </mesh>
          </group>
        ),
      )}


      {[
        [-1.48, -0.92],
        [-1.48, 0.92],
        [1.48, -0.92],
        [1.48, 0.92],
      ].map(
        (
          [
            x,
            z,
          ],
        ) => (
          <mesh
            key={`${x}-${z}`}
            position={[
              x,
              3,
              z,
            ]}
          >
            <cylinderGeometry
              args={[
                0.028,
                0.028,
                2.6,
                8,
              ]}
            />

            <meshStandardMaterial
              color="#343936"
              metalness={0.46}
              roughness={0.42}
            />
          </mesh>
        ),
      )}


      <group
        ref={cradle}
        position={[
          0,
          1.72,
          0,
        ]}
      >
        {[
          -1.18,
          1.18,
        ].map(
          (x) => (
            <RoundedBox
              key={x}
              args={[
                0.22,
                0.12,
                4.45,
              ]}
              radius={0.035}
              smoothness={2}
              position={[
                x,
                0,
                0,
              ]}
            >
              <meshStandardMaterial
                color="#3a403d"
                metalness={0.5}
                roughness={0.4}
              />
            </RoundedBox>
          ),
        )}


        {[
          -1.32,
          1.32,
        ].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                0.075,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.055,
                  0.025,
                  4.5,
                ]}
              />

              <meshStandardMaterial
                color="#d0a425"
                roughness={0.72}
              />
            </mesh>
          ),
        )}


        <group
          ref={loweringVehicle}
          visible={false}
          position={[
            0,
            -0.02,
            0,
          ]}
        >
          <VehicleBody
            rotation={
              Math.PI / 2
            }
            stage="finished"
            color="#eceee9"
          />
        </group>
      </group>


      {[
        -0.82,
        0.82,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              0.055,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.11,
                0.025,
                4.3,
              ]}
            />

            <meshStandardMaterial
              color="#777d79"
              metalness={0.14}
              roughness={0.7}
            />
          </mesh>
        ),
      )}
    </group>
  )
}