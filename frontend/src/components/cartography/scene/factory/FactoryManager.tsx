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
  getManagerFocusTarget,
  sampleManagerTimeline,
} from './data/managerInspection'


function normalizeAngle(
  value: number,
) {
  let angle =
    value


  while (
    angle >
    Math.PI
  ) {
    angle -=
      Math.PI * 2
  }


  while (
    angle <
    -Math.PI
  ) {
    angle +=
      Math.PI * 2
  }


  return angle
}


function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.max(
    minimum,
    Math.min(
      maximum,
      value,
    ),
  )
}


export function FactoryManager() {
  const root =
    useRef<Group>(null)


  const head =
    useRef<Group>(null)


  const leftArm =
    useRef<Group>(null)


  const rightArm =
    useRef<Group>(null)


  const leftLeg =
    useRef<Group>(null)


  const rightLeg =
    useRef<Group>(null)


  useFrame(
    (state) => {
      if (
        !root.current ||
        !head.current ||
        !leftArm.current ||
        !rightArm.current ||
        !leftLeg.current ||
        !rightLeg.current
      ) {
        return
      }


      const sample =
        sampleManagerTimeline(
          state.clock
            .elapsedTime,
        )


      root.current.position.set(
        sample.x,
        0,
        sample.z,
      )


      root.current.rotation.y =
        sample.rotation


      leftArm.current.rotation.x =
        0

      rightArm.current.rotation.x =
        0


      leftLeg.current.rotation.x =
        0

      rightLeg.current.rotation.x =
        0


      head.current.rotation.x =
        0

      head.current.rotation.y =
        0


      if (
        sample.walking
      ) {
        const gait =
          Math.sin(
            state.clock
              .elapsedTime *
            7,
          )


        leftArm.current.rotation.x =
          gait *
          0.32


        rightArm.current.rotation.x =
          -gait *
          0.32


        leftLeg.current.rotation.x =
          -gait *
          0.2


        rightLeg.current.rotation.x =
          gait *
          0.2


        return
      }


      const target =
        getManagerFocusTarget(
          sample,
        )


      if (
        target
      ) {
        const dx =
          target[0] -
          sample.x


        const dz =
          target[1] -
          sample.z


        const targetYaw =
          Math.atan2(
            dx,
            dz,
          )


        const localYaw =
          normalizeAngle(
            targetYaw -
            root.current.rotation.y,
          )


        head.current.rotation.y =
          clamp(
            localYaw,
            -0.42,
            0.42,
          )
      }


      if (
        sample.focus ===
          'right-car' ||
        sample.focus ===
          'left-car' ||
        sample.focus ===
          'upper-line'
      ) {
        rightArm.current.rotation.x =
          -0.18


        head.current.rotation.x =
          -0.03
      }


      if (
        sample.talkingTo
      ) {
        rightArm.current.rotation.x =
          -0.12 +
          Math.sin(
            state.clock
              .elapsedTime *
            1.25,
          ) *
          0.06
      }
    },
  )


  const skin =
    '#c68f72'


  return (
    <group ref={root}>
      {/*
       * Scale only the visual body.
       * The manager's world-space route
       * remains completely unchanged.
       */}
      <group scale={1.13}>
        <group
          ref={leftLeg}
          position={[
            -0.11,
            0.77,
            0,
          ]}
        >
          <mesh
            position={[
              0,
              -0.31,
              0,
            ]}
            castShadow
          >
            <cylinderGeometry
              args={[
                0.085,
                0.1,
                0.7,
                14,
              ]}
            />

            <meshStandardMaterial
              color="#293743"
              roughness={0.58}
            />
          </mesh>


          <RoundedBox
            position={[
              0,
              -0.68,
              0.075,
            ]}
            args={[
              0.18,
              0.11,
              0.3,
            ]}
            radius={0.035}
            smoothness={2}
          >
            <meshStandardMaterial
              color="#181e21"
              roughness={0.68}
            />
          </RoundedBox>
        </group>


        <group
          ref={rightLeg}
          position={[
            0.11,
            0.77,
            0,
          ]}
        >
          <mesh
            position={[
              0,
              -0.31,
              0,
            ]}
            castShadow
          >
            <cylinderGeometry
              args={[
                0.085,
                0.1,
                0.7,
                14,
              ]}
            />

            <meshStandardMaterial
              color="#293743"
              roughness={0.58}
            />
          </mesh>


          <RoundedBox
            position={[
              0,
              -0.68,
              0.075,
            ]}
            args={[
              0.18,
              0.11,
              0.3,
            ]}
            radius={0.035}
            smoothness={2}
          >
            <meshStandardMaterial
              color="#181e21"
              roughness={0.68}
            />
          </RoundedBox>
        </group>


        <RoundedBox
          position={[
            0,
            1.14,
            0,
          ]}
          args={[
            0.56,
            0.7,
            0.35,
          ]}
          radius={0.1}
          smoothness={3}
          castShadow
        >
          <meshStandardMaterial
            color="#30414b"
            roughness={0.52}
          />
        </RoundedBox>


        <mesh
          position={[
            0,
            1.2,
            0.183,
          ]}
        >
          <boxGeometry
            args={[
              0.19,
              0.41,
              0.022,
            ]}
          />

          <meshStandardMaterial
            color="#eeeae1"
            roughness={0.55}
          />
        </mesh>


        {/* SOMACA-yellow tie */}

        <mesh
          position={[
            0,
            1.14,
            0.198,
          ]}
        >
          <boxGeometry
            args={[
              0.052,
              0.31,
              0.016,
            ]}
          />

          <meshStandardMaterial
            color="#c99b22"
            roughness={0.48}
          />
        </mesh>


        <group
          ref={leftArm}
          position={[
            -0.34,
            1.36,
            0,
          ]}
        >
          <mesh
            position={[
              0,
              -0.3,
              0,
            ]}
            castShadow
          >
            <cylinderGeometry
              args={[
                0.065,
                0.08,
                0.6,
                12,
              ]}
            />

            <meshStandardMaterial
              color="#30414b"
              roughness={0.54}
            />
          </mesh>


          <mesh
            position={[
              0,
              -0.63,
              0,
            ]}
          >
            <sphereGeometry
              args={[
                0.07,
                12,
                10,
              ]}
            />

            <meshStandardMaterial
              color={skin}
              roughness={0.72}
            />
          </mesh>
        </group>


        <group
          ref={rightArm}
          position={[
            0.34,
            1.36,
            0,
          ]}
        >
          <mesh
            position={[
              0,
              -0.3,
              0,
            ]}
            castShadow
          >
            <cylinderGeometry
              args={[
                0.065,
                0.08,
                0.6,
                12,
              ]}
            />

            <meshStandardMaterial
              color="#30414b"
              roughness={0.54}
            />
          </mesh>


          <mesh
            position={[
              0,
              -0.63,
              0,
            ]}
          >
            <sphereGeometry
              args={[
                0.07,
                12,
                10,
              ]}
            />

            <meshStandardMaterial
              color={skin}
              roughness={0.72}
            />
          </mesh>
        </group>


        <mesh
          position={[
            0,
            1.54,
            0,
          ]}
        >
          <cylinderGeometry
            args={[
              0.085,
              0.09,
              0.16,
              12,
            ]}
          />

          <meshStandardMaterial
            color={skin}
            roughness={0.72}
          />
        </mesh>


        <group
          ref={head}
          position={[
            0,
            1.75,
            0,
          ]}
        >
          <mesh castShadow>
            <sphereGeometry
              args={[
                0.185,
                20,
                16,
              ]}
            />

            <meshStandardMaterial
              color={skin}
              roughness={0.72}
            />
          </mesh>


          <mesh
            position={[
              0,
              0.1,
              -0.035,
            ]}
            scale={[
              1,
              0.58,
              1,
            ]}
          >
            <sphereGeometry
              args={[
                0.19,
                18,
                14,
              ]}
            />

            <meshStandardMaterial
              color="#352a25"
              roughness={0.82}
            />
          </mesh>


          {[
            -0.063,
            0.063,
          ].map(
            (x) => (
              <mesh
                key={x}
                position={[
                  x,
                  0.025,
                  0.174,
                ]}
              >
                <sphereGeometry
                  args={[
                    0.017,
                    8,
                    8,
                  ]}
                />

                <meshStandardMaterial
                  color="#202321"
                />
              </mesh>
            ),
          )}


          <mesh
            position={[
              0,
              -0.012,
              0.183,
            ]}
            scale={[
              0.65,
              0.9,
              0.72,
            ]}
          >
            <sphereGeometry
              args={[
                0.036,
                10,
                8,
              ]}
            />

            <meshStandardMaterial
              color={skin}
            />
          </mesh>


          <mesh
            position={[
              0,
              -0.08,
              0.174,
            ]}
          >
            <boxGeometry
              args={[
                0.07,
                0.013,
                0.012,
              ]}
            />

            <meshStandardMaterial
              color="#764d43"
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}