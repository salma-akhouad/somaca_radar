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
  isSeatFitActive,
  isVehicleNear,
  isWheelFitActive,
} from './data/assemblyLineCycle'

import {
  getLogisticsState,
} from './data/logisticsCycle'

import {
  getSeatLogisticsState,
} from './data/seatLogisticsCycle'

import {
  isFinishedVehicleStoppedAt,
} from './data/vehicleContinuity'

import {
  sampleManagerTimeline,
} from './data/managerInspection'

import {
  getWorkerBreakRequest,
  sampleWorkerBreak,
} from './data/workerBreakCycle'

import type {
  WorkerBreakId,
} from './data/workerBreakCycle'


export type FactoryWorkerRole =
  | 'production'
  | 'terminal'
  | 'material'
  | 'quality'
  | 'validation-inspection'
  | 'validation-console'
  | 'seat-stock'
  | 'seat-install'


interface FactoryWorkerProps {
  position: [
    number,
    number,
    number,
  ]

  rotation?: number
  gender?: 'man' | 'woman'
  role?: FactoryWorkerRole
  phaseOffset?: number
  workerId?: WorkerBreakId
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


function smoothStep(
  value: number,
) {
  const t =
    clamp(
      value,
      0,
      1,
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

function lerp(
  start: number,
  end: number,
  progress: number,
) {
  return (
    start +
    (
      end -
      start
    ) *
    progress
  )
}

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


function worldDeltaToLocal(
  dx: number,
  dz: number,
  baseRotation: number,
) {
  /*
   * Inverse of the parent group's Y rotation.
   *
   * This is the critical correction that keeps
   * workers on their world-space pedestrian route
   * even when their workstation group is rotated.
   */
  const cos =
    Math.cos(
      baseRotation,
    )

  const sin =
    Math.sin(
      baseRotation,
    )


  return {
    x:
      dx * cos -
      dz * sin,

    z:
      dx * sin +
      dz * cos,
  }
}


function SafetyBoot({
  position,
}: {
  position: [
    number,
    number,
    number,
  ]
}) {
  return (
    <RoundedBox
      args={[
        0.19,
        0.12,
        0.32,
      ]}
      radius={0.035}
      smoothness={2}
      position={position}
      castShadow
    >
      <meshStandardMaterial
        color="#252a28"
        roughness={0.78}
      />
    </RoundedBox>
  )
}


function HandTool() {
  return (
    <group>
      <mesh
        rotation-z={
          Math.PI / 2
        }
      >
        <cylinderGeometry
          args={[
            0.045,
            0.045,
            0.28,
            8,
          ]}
        />

        <meshStandardMaterial
          color="#35433f"
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      <mesh
        position={[
          0.07,
          -0.08,
          0,
        ]}
        rotation-z={0.35}
      >
        <boxGeometry
          args={[
            0.07,
            0.18,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color="#26322f"
        />
      </mesh>
    </group>
  )
}


function HandWheel() {
  return (
    <group>
      <mesh
        rotation-y={
          Math.PI / 2
        }
      >
        <torusGeometry
          args={[
            0.19,
            0.065,
            8,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#181c1a"
          roughness={0.8}
        />
      </mesh>

      <mesh
        rotation-y={
          Math.PI / 2
        }
      >
        <cylinderGeometry
          args={[
            0.1,
            0.1,
            0.045,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#a3aaa6"
          metalness={0.68}
          roughness={0.28}
        />
      </mesh>
    </group>
  )
}


function HandSeat() {
  return (
    <group
      scale={0.52}
    >
      <RoundedBox
        args={[
          0.72,
          0.22,
          0.72,
        ]}
        radius={0.08}
        smoothness={2}
        position={[
          0,
          0,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#676d6a"
          roughness={0.72}
        />
      </RoundedBox>

      <RoundedBox
        args={[
          0.72,
          0.94,
          0.2,
        ]}
        radius={0.08}
        smoothness={2}
        position={[
          0,
          0.46,
          -0.26,
        ]}
        rotation-x={
          -0.12
        }
      >
        <meshStandardMaterial
          color="#626865"
          roughness={0.72}
        />
      </RoundedBox>

      <RoundedBox
        args={[
          0.42,
          0.28,
          0.16,
        ]}
        radius={0.06}
        smoothness={2}
        position={[
          0,
          1.08,
          -0.29,
        ]}
      >
        <meshStandardMaterial
          color="#555b58"
          roughness={0.7}
        />
      </RoundedBox>
    </group>
  )
}


function CoffeeCup() {
  return (
    <group>
      <mesh>
        <cylinderGeometry
          args={[
            0.06,
            0.052,
            0.15,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#ece7dc"
          roughness={0.5}
        />
      </mesh>


      <mesh
        position={[
          0.07,
          0,
          0,
        ]}
        rotation-y={
          Math.PI / 2
        }
      >
        <torusGeometry
          args={[
            0.045,
            0.012,
            6,
            10,
            Math.PI,
          ]}
        />

        <meshStandardMaterial
          color="#ece7dc"
          roughness={0.5}
        />
      </mesh>
    </group>
  )
}


function Face({
  skin,
}: {
  skin: string
}) {
  return (
    <>
      {[
        -0.065,
        0.065,
      ].map(
        (x) => (
          <mesh
            key={x}
            position={[
              x,
              0.025,
              0.169,
            ]}
          >
            <sphereGeometry
              args={[
                0.018,
                8,
                8,
              ]}
            />

            <meshStandardMaterial
              color="#282b29"
              roughness={0.7}
            />
          </mesh>
        ),
      )}

      <mesh
        position={[
          0,
          -0.018,
          0.177,
        ]}
      >
        <sphereGeometry
          args={[
            0.025,
            8,
            8,
          ]}
        />

        <meshStandardMaterial
          color={skin}
          roughness={0.82}
        />
      </mesh>

      <mesh
        position={[
          0,
          -0.075,
          0.172,
        ]}
      >
        <boxGeometry
          args={[
            0.07,
            0.012,
            0.01,
          ]}
        />

        <meshStandardMaterial
          color="#73483f"
          roughness={0.8}
        />
      </mesh>
    </>
  )
}


export function FactoryWorker({
  position,
  rotation = 0,
  gender = 'man',
  role = 'production',
  phaseOffset = 0,
  workerId,
}: FactoryWorkerProps) {
  const root =
    useRef<Group>(null)

  const torso =
    useRef<Group>(null)

  const head =
    useRef<Group>(null)

  const leftLeg =
    useRef<Group>(null)

  const rightLeg =
    useRef<Group>(null)

  const helmet =
    useRef<Group>(null)

  const leftArm =
    useRef<Group>(null)

  const rightArm =
    useRef<Group>(null)

  const leftForearm =
    useRef<Group>(null)

  const rightForearm =
    useRef<Group>(null)

  const carriedWheel =
    useRef<Group>(null)

  const carriedSeat =
    useRef<Group>(null)

  const drinkingGlass =
    useRef<Group>(null)

  const breakStartedAt =
    useRef<number | null>(
      null,
    )

  const lastBreakRequest =
    useRef<string | null>(
      null,
    )

  const breakHoldSeconds =
    useRef(0)


  const yieldOffset =
    useRef(0)

  useFrame(
    (
      state,
      delta,
    ) => {
      if (
        !root.current ||
        !torso.current ||
        !head.current ||
        !leftLeg.current ||
        !rightLeg.current ||
        !helmet.current ||
        !leftArm.current ||
        !rightArm.current ||
        !leftForearm.current ||
        !rightForearm.current
      ) {
        return
      }


      const elapsed =
        state.clock.elapsedTime

      const time =
        elapsed +
        phaseOffset


      root.current.position.set(
        0,
        0,
        0,
      )

      root.current.rotation.y = 0

      leftLeg.current.rotation.x = 0
      rightLeg.current.rotation.x = 0

      leftLeg.current.rotation.z = 0
      rightLeg.current.rotation.z = 0


      torso.current.rotation.x = 0

      torso.current.rotation.z = 0


      head.current.rotation.x = 0

      head.current.rotation.y = 0


      leftArm.current.rotation.x = 0

      rightArm.current.rotation.x = 0


      leftArm.current.rotation.z =
        0.08

      rightArm.current.rotation.z =
        -0.08


      leftForearm.current.rotation.x = 0

      rightForearm.current.rotation.x = 0


      helmet.current.visible =
        true


      if (
        carriedWheel.current
      ) {
        carriedWheel.current.visible =
          false
      }


      if (
        carriedSeat.current
      ) {
        carriedSeat.current.visible =
          false
      }


      if (
        drinkingGlass.current
      ) {
        drinkingGlass.current.visible =
          false
      }


      let roleBusy =
        false


      if (
        role ===
        'production'
      ) {
        const targetX =
          position[0] >
            0
            ? 17
            : -17


        const carNearby =
          isVehicleNear(
            elapsed,
            targetX,
            position[2],
            3.6,
          )


        roleBusy =
          carNearby


        if (
          carNearby
        ) {
          const toolCycle =
            (
              Math.sin(
                time * 4.2,
              ) +
              1
            ) /
            2


          torso.current.rotation.x =
            -0.16

          head.current.rotation.x =
            -0.18


          rightArm.current.rotation.x =
            -0.72 -
            toolCycle *
            0.4


          rightForearm.current.rotation.x =
            -0.72 -
            toolCycle *
            0.32


          leftArm.current.rotation.x =
            -0.34

          leftForearm.current.rotation.x =
            -0.38
        } else {
          head.current.rotation.y =
            Math.sin(
              time * 0.35,
            ) *
            0.16
        }
      }


      if (
        role ===
        'terminal'
      ) {
        const active =
          isVehicleNear(
            elapsed,
            -8.2,
            16,
            5,
          )


        roleBusy =
          active


        if (
          active
        ) {
          torso.current.rotation.x =
            -0.09

          head.current.rotation.x =
            -0.14


          leftArm.current.rotation.x =
            -0.7

          rightArm.current.rotation.x =
            -0.7


          leftForearm.current.rotation.x =
            -0.8 +
            Math.sin(
              time * 4.4,
            ) *
            0.12


          rightForearm.current.rotation.x =
            -0.8 -
            Math.sin(
              time * 4.4,
            ) *
            0.12
        } else {
          head.current.rotation.y =
            Math.sin(
              time * 0.32,
            ) *
            0.12
        }
      }


      if (
        role ===
        'material'
      ) {
        const wheelFit =
          isWheelFitActive(
            elapsed,
          )


        const logistics =
          getLogisticsState(
            elapsed,
          )


        roleBusy =
          wheelFit &&
          logistics.installingWheel


        if (
          roleBusy
        ) {
          if (
            logistics.progress <
            0.35
          ) {
            const agvWorldYaw =
              Math.atan2(
                logistics.x -
                position[0],

                logistics.z -
                position[2],
              )


            root.current.rotation.y =
              normalizeAngle(
                agvWorldYaw -
                rotation,
              )


            leftArm.current.rotation.x =
              -0.72

            rightArm.current.rotation.x =
              -0.72


            leftForearm.current.rotation.x =
              -0.7

            rightForearm.current.rotation.x =
              -0.7
          } else if (
            logistics.progress <
            0.62
          ) {
            root.current.position.x =
              0.22


            root.current.rotation.y =
              -0.05


            leftArm.current.rotation.x =
              -0.82

            rightArm.current.rotation.x =
              -0.82


            leftForearm.current.rotation.x =
              -0.78

            rightForearm.current.rotation.x =
              -0.78
          } else {
            root.current.position.x =
              0.48


            root.current.rotation.y =
              0.28


            torso.current.rotation.x =
              -0.2

            head.current.rotation.x =
              -0.2


            leftArm.current.rotation.x =
              -0.92

            rightArm.current.rotation.x =
              -0.92


            leftForearm.current.rotation.x =
              -0.85

            rightForearm.current.rotation.x =
              -0.85
          }


          if (
            carriedWheel.current
          ) {
            carriedWheel.current.visible =
              logistics.progress >
              0.16 &&
              logistics.progress <
              0.76
          }
        } else {
          head.current.rotation.y =
            -0.15
        }
      }


      if (
        role ===
        'seat-stock'
      ) {
        const logistics =
          getSeatLogisticsState(
            elapsed,
          )


        const load =
          logistics.loadProgress


        const active =
          logistics.phase ===
          'pickup' &&
          load >
          0


        roleBusy =
          active


        if (
          active
        ) {
          const homeX =
            position[0]

          const homeZ =
            position[2]


          /*
           * Safe handling point beside,
           * not inside, the first rack.
           */
          const rackX =
            55.25

          const rackZ =
            22.85


          /*
           * Stop 1.4 m away from AGV centre.
           */
          const handoffX =
            55.85

          const handoffZ =
            21.65


          let workerX =
            homeX

          let workerZ =
            homeZ

          let faceX =
            56.4

          let faceZ =
            23.9


          if (
            load <
            0.25
          ) {
            const progress =
              smoothStep(
                load /
                0.25,
              )


            workerX =
              lerp(
                homeX,
                rackX,
                progress,
              )

            workerZ =
              lerp(
                homeZ,
                rackZ,
                progress,
              )
          } else if (
            load <
            0.66
          ) {
            const progress =
              smoothStep(
                (
                  load -
                  0.25
                ) /
                0.41,
              )


            workerX =
              lerp(
                rackX,
                handoffX,
                progress,
              )

            workerZ =
              lerp(
                rackZ,
                handoffZ,
                progress,
              )


            faceX =
              logistics.x

            faceZ =
              logistics.z
          } else if (
            load <
            0.82
          ) {
            workerX =
              handoffX

            workerZ =
              handoffZ

            faceX =
              logistics.x

            faceZ =
              logistics.z
          } else {
            const progress =
              smoothStep(
                (
                  load -
                  0.82
                ) /
                0.18,
              )


            workerX =
              lerp(
                handoffX,
                homeX,
                progress,
              )

            workerZ =
              lerp(
                handoffZ,
                homeZ,
                progress,
              )


            faceX =
              logistics.x

            faceZ =
              logistics.z
          }


          const movement =
            worldDeltaToLocal(
              workerX -
              position[0],

              workerZ -
              position[2],

              rotation,
            )


          root.current.position.x =
            movement.x

          root.current.position.z =
            movement.z


          const desiredYaw =
            Math.atan2(
              faceX -
              workerX,

              faceZ -
              workerZ,
            )


          root.current.rotation.y =
            normalizeAngle(
              desiredYaw -
              rotation,
            )


          torso.current.rotation.x =
            -0.1


          leftArm.current.rotation.x =
            -0.62 -
            load *
            0.18

          rightArm.current.rotation.x =
            -0.62 -
            load *
            0.18


          leftForearm.current.rotation.x =
            -0.7

          rightForearm.current.rotation.x =
            -0.7


          if (
            carriedSeat.current
          ) {
            carriedSeat.current.visible =
              load >
              0.14 &&
              load <
              0.76
          }
        } else {
          head.current.rotation.y =
            Math.sin(
              time *
              0.35,
            ) *
            0.12
        }
      }


      if (
        role ===
        'seat-install'
      ) {
        const logistics =
          getSeatLogisticsState(
            elapsed,
          )


        const seatFit =
          isSeatFitActive(
            elapsed,
          )


        roleBusy =
          seatFit &&
          logistics.installingSeat


        if (
          roleBusy
        ) {
          const progress =
            logistics.progress


          const homeX =
            position[0]

          const homeZ =
            position[2]


          const receiveX =
            20.9

          const receiveZ =
            4.2


          const installX =
            19.25

          const installZ =
            4.2


          let workerX =
            homeX

          let workerZ =
            homeZ


          let faceX =
            logistics.x

          let faceZ =
            logistics.z


          if (
            progress <
            0.25
          ) {
            const amount =
              smoothStep(
                progress /
                0.25,
              )


            workerX =
              lerp(
                homeX,
                receiveX,
                amount,
              )

            workerZ =
              lerp(
                homeZ,
                receiveZ,
                amount,
              )
          } else if (
            progress <
            0.72
          ) {
            const amount =
              smoothStep(
                (
                  progress -
                  0.25
                ) /
                0.47,
              )


            workerX =
              lerp(
                receiveX,
                installX,
                amount,
              )

            workerZ =
              lerp(
                receiveZ,
                installZ,
                amount,
              )


            faceX = 17
            faceZ = 4.2
          } else if (
            progress <
            0.9
          ) {
            workerX =
              installX

            workerZ =
              installZ

            faceX = 17
            faceZ = 4.2
          } else {
            const amount =
              smoothStep(
                (
                  progress -
                  0.9
                ) /
                0.1,
              )


            workerX =
              lerp(
                installX,
                homeX,
                amount,
              )

            workerZ =
              lerp(
                installZ,
                homeZ,
                amount,
              )


            faceX = 17
            faceZ = 4.2
          }


          const movement =
            worldDeltaToLocal(
              workerX -
              position[0],

              workerZ -
              position[2],

              rotation,
            )


          root.current.position.x =
            movement.x

          root.current.position.z =
            movement.z


          const desiredYaw =
            Math.atan2(
              faceX -
              workerX,

              faceZ -
              workerZ,
            )


          root.current.rotation.y =
            normalizeAngle(
              desiredYaw -
              rotation,
            )


          torso.current.rotation.x =
            progress >
              0.58
              ? -0.2
              : -0.1


          leftArm.current.rotation.x =
            -0.72 -
            Math.min(
              progress,
              0.8,
            ) *
            0.28


          rightArm.current.rotation.x =
            leftArm.current.rotation.x


          leftForearm.current.rotation.x =
            -0.78

          rightForearm.current.rotation.x =
            -0.78


          if (
            carriedSeat.current
          ) {
            carriedSeat.current.visible =
              progress >
              0.12 &&
              progress <
              0.8
          }
        } else {
          head.current.rotation.y =
            Math.sin(
              time *
              0.28,
            ) *
            0.12
        }
      }

      if (
        role ===
        'quality'
      ) {
        const active =
          isVehicleNear(
            elapsed,
            17,
            -12,
            5.4,
          )


        roleBusy =
          active


        if (
          active
        ) {
          const cycle =
            time % 8


          head.current.rotation.y =
            Math.sin(
              time * 0.4,
            ) *
            0.18


          if (
            cycle >
            1.8 &&
            cycle <
            5.5
          ) {
            torso.current.rotation.x =
              -0.08


            rightArm.current.rotation.x =
              -0.55


            rightForearm.current.rotation.x =
              -0.6
          }
        } else {
          head.current.rotation.y =
            Math.sin(
              time * 0.25,
            ) *
            0.12
        }
      }


      if (
        role ===
        'validation-inspection'
      ) {
        const active =
          isFinishedVehicleStoppedAt(
            elapsed,
            'validation',
          )


        roleBusy =
          active


        if (
          active
        ) {
          const scan =
            (
              Math.sin(
                time * 1.5,
              ) +
              1
            ) /
            2


          torso.current.rotation.x =
            -0.14 -
            scan *
            0.08


          head.current.rotation.x =
            -0.18


          head.current.rotation.y =
            Math.sin(
              time * 0.8,
            ) *
            0.22


          leftArm.current.rotation.x =
            -0.3


          rightArm.current.rotation.x =
            -0.45 -
            scan *
            0.26


          rightForearm.current.rotation.x =
            -0.5 -
            scan *
            0.18
        } else {
          head.current.rotation.y =
            Math.sin(
              time * 0.22,
            ) *
            0.1
        }
      }


      if (
        role ===
        'validation-console'
      ) {
        const active =
          isFinishedVehicleStoppedAt(
            elapsed,
            'validation',
          )


        roleBusy =
          active


        if (
          active
        ) {
          torso.current.rotation.x =
            -0.1


          head.current.rotation.x =
            -0.16


          leftArm.current.rotation.x =
            -0.78

          rightArm.current.rotation.x =
            -0.78


          leftForearm.current.rotation.x =
            -0.86 +
            Math.sin(
              time * 4,
            ) *
            0.1


          rightForearm.current.rotation.x =
            -0.86 -
            Math.sin(
              time * 4,
            ) *
            0.1
        } else {
          head.current.rotation.y =
            Math.sin(
              time * 0.2,
            ) *
            0.08
        }
      }


      const manager =
        sampleManagerTimeline(
          elapsed,
        )


      const talkingRight =
        role ===
        'production' &&
        position[0] >
        0 &&
        manager.talkingTo ===
        'right-production'


      const talkingLeft =
        role ===
        'production' &&
        position[0] <
        0 &&
        manager.talkingTo ===
        'left-production'


      if (
        talkingRight ||
        talkingLeft
      ) {
        const dx =
          manager.x -
          position[0]

        const dz =
          manager.z -
          position[2]


        const desiredWorldYaw =
          Math.atan2(
            dx,
            dz,
          )


        const localYaw =
          normalizeAngle(
            desiredWorldYaw -
            rotation,
          )


        root.current.rotation.y =
          clamp(
            localYaw,
            -0.3,
            0.3,
          )


        head.current.rotation.y =
          clamp(
            localYaw -
            root.current.rotation.y,
            -0.45,
            0.45,
          )


        rightArm.current.rotation.x =
          -0.22 +
          Math.sin(
            elapsed *
            1.2 +
            phaseOffset,
          ) *
          0.08
      }

      if (
        workerId
      ) {
        const request =
          getWorkerBreakRequest(
            elapsed,
            workerId,
          )


        if (
          breakStartedAt.current ===
          null &&
          request.open &&
          request.key !==
          lastBreakRequest.current &&
          !roleBusy &&
          !talkingRight &&
          !talkingLeft
        ) {
          breakStartedAt.current =
            elapsed
          breakHoldSeconds.current =
            0

          yieldOffset.current =
            0
          lastBreakRequest.current =
            request.key
        }


        if (
          breakStartedAt.current !==
          null
        ) {
          let breakElapsed =
            elapsed -
            breakStartedAt.current -
            breakHoldSeconds.current


          let breakState =
            sampleWorkerBreak(
              workerId,
              breakElapsed,
            )


          let managerConflict =
            false


          if (
            breakState.walking &&
            manager.walking
          ) {
            const dx =
              breakState.x -
              manager.x

            const dz =
              breakState.z -
              manager.z


            const distance =
              Math.sqrt(
                dx * dx +
                dz * dz,
              )


            managerConflict =
              distance <
              1.5
          }


          if (
            managerConflict
          ) {
            /*
             * Manager has right of way.
             * Freeze worker route progress while
             * they step slightly aside.
             */
            breakHoldSeconds.current +=
              delta


            breakElapsed =
              elapsed -
              breakStartedAt.current -
              breakHoldSeconds.current


            breakState =
              sampleWorkerBreak(
                workerId,
                breakElapsed,
              )
          }


          const targetYieldOffset =
            managerConflict
              ? 0.34
              : 0


          yieldOffset.current +=
            (
              targetYieldOffset -
              yieldOffset.current
            ) *
            Math.min(
              1,
              delta * 7,
            )


          if (
            breakState.complete
          ) {
            breakStartedAt.current =
              null

            breakHoldSeconds.current =
              0

            yieldOffset.current =
              0
          } else {
            const sideX =
              Math.cos(
                breakState.yaw,
              ) *
              yieldOffset.current


            const sideZ =
              -Math.sin(
                breakState.yaw,
              ) *
              yieldOffset.current


            /*
             * Final safety envelope:
             * a break-route bug must never be able
             * to send a worker through the walls.
             */
            const safeWorldX =
              clamp(
                breakState.x +
                sideX,
                -47.2,
                76,
              )

            const safeWorldZ =
              clamp(
                breakState.z +
                sideZ,
                -36.5,
                36.5,
              )


            const workerDelta =
              worldDeltaToLocal(
                safeWorldX -
                position[0],

                safeWorldZ -
                position[2],

                rotation,
              )


            root.current.position.x =
              workerDelta.x

            root.current.position.z =
              workerDelta.z


            root.current.rotation.y =
              normalizeAngle(
                breakState.yaw -
                rotation,
              )


            if (
              breakState.walking
            ) {
              const gait =
                Math.sin(
                  breakElapsed *
                  7.2,
                )


              const bounce =
                Math.abs(
                  Math.sin(
                    breakElapsed *
                    7.2,
                  ),
                ) *
                0.035


              root.current.position.y =
                bounce


              leftArm.current.rotation.x =
                gait *
                0.46

              rightArm.current.rotation.x =
                -gait *
                0.46


              leftLeg.current.rotation.x =
                -gait *
                0.34

              rightLeg.current.rotation.x =
                gait *
                0.34


              leftForearm.current.rotation.x =
                -0.08

              rightForearm.current.rotation.x =
                -0.08


              torso.current.rotation.x =
                0.025

              torso.current.rotation.z =
                gait *
                0.025


              head.current.rotation.y =
                Math.sin(
                  breakElapsed *
                  0.8,
                ) *
                0.035
            } else {
              const seated =
                breakState.seatProgress


              /*
               * The hip is 0.79 m above the worker root
               * and the real chair seat is 0.48 m high.
               * -0.31 therefore places the pelvis ON
               * the chair instead of beside it.
               */
              root.current.position.y =
                -0.35 *
                seated


              leftLeg.current.rotation.x =
                -1.08 *
                seated

              rightLeg.current.rotation.x =
                -1.08 *
                seated


              torso.current.rotation.x =
                0.08 *
                seated


              head.current.rotation.x =
                -0.03 *
                seated


              leftArm.current.rotation.x =
                -0.38 *
                seated

              rightArm.current.rotation.x =
                -0.42 *
                seated


              leftForearm.current.rotation.x =
                -0.58 *
                seated

              rightForearm.current.rotation.x =
                -0.58 *
                seated


              /*
               * Helmet comes off only after the worker
               * has actually reached the chair.
               */
              helmet.current.visible =
                seated <
                0.72


              if (
                breakState.stage ===
                  'drink' &&
                seated >
                  0.95
              ) {
                rightArm.current.rotation.x =
                  -0.92

                rightForearm.current.rotation.x =
                  -1.12

                head.current.rotation.x =
                  -0.12


                if (
                  drinkingGlass.current
                ) {
                  drinkingGlass.current.visible =
                    true
                }
              } else if (
                seated >
                0.8
              ) {
                head.current.rotation.y =
                  Math.sin(
                    breakElapsed *
                    0.28,
                  ) *
                  0.11
              }
            }
          }
        }
      }
    },
  )


  const skin =
    gender ===
      'woman'
      ? '#cb9579'
      : '#c68f73'


  const hair =
    gender ===
      'woman'
      ? '#43322b'
      : '#362b26'


  const shoulderWidth =
    gender ===
      'woman'
      ? 0.5
      : 0.57


  const waistWidth =
    gender ===
      'woman'
      ? 0.38
      : 0.43


  const hipWidth =
    gender ===
      'woman'
      ? 0.47
      : 0.42


  const yellow =
    '#d6aa27'


  const yellowDark =
    '#bd8e1e'


  const trousers =
    '#414a46'


  return (
    <group
      position={position}
      rotation-y={rotation}
    >
      <group ref={root}>
        {/*
         * IMPORTANT:
         * movement lives at world scale 1.
         * Only the visual body is enlarged.
         * This prevents every route displacement
         * from being multiplied by 1.13.
         */}
        <group scale={1.13}>
        <group
          ref={leftLeg}
          position={[
            -0.115,
            0.79,
            0,
          ]}
        >
          <mesh
            position={[
              0,
              -0.33,
              0,
            ]}
            castShadow
          >
            <cylinderGeometry
              args={[
                0.085,
                0.105,
                0.72,
                12,
              ]}
            />

            <meshStandardMaterial
              color={
                trousers
              }
            />
          </mesh>

          <SafetyBoot
            position={[
              0,
              -0.695,
              0.075,
            ]}
          />
        </group>


        <group
          ref={rightLeg}
          position={[
            0.115,
            0.79,
            0,
          ]}
        >
          <mesh
            position={[
              0,
              -0.33,
              0,
            ]}
            castShadow
          >
            <cylinderGeometry
              args={[
                0.085,
                0.105,
                0.72,
                12,
              ]}
            />

            <meshStandardMaterial
              color={
                trousers
              }
            />
          </mesh>

          <SafetyBoot
            position={[
              0,
              -0.695,
              0.075,
            ]}
          />
        </group>


        <RoundedBox
          args={[
            hipWidth,
            0.22,
            0.3,
          ]}
          radius={0.07}
          smoothness={2}
          position={[
            0,
            0.79,
            0,
          ]}
        >
          <meshStandardMaterial
            color={
              trousers
            }
          />
        </RoundedBox>


        <group
          ref={torso}
        >
          <RoundedBox
            args={[
              shoulderWidth,
              0.68,
              0.34,
            ]}
            radius={0.11}
            smoothness={2}
            position={[
              0,
              1.14,
              0,
            ]}
            castShadow
          >
            <meshStandardMaterial
              color={
                yellow
              }
              roughness={0.65}
            />
          </RoundedBox>

          <RoundedBox
            args={[
              waistWidth,
              0.24,
              0.3,
            ]}
            radius={0.07}
            smoothness={2}
            position={[
              0,
              0.91,
              0,
            ]}
          >
            <meshStandardMaterial
              color={
                yellowDark
              }
            />
          </RoundedBox>
        </group>


        <group
          ref={leftArm}
          position={[
            -shoulderWidth /
            2 -
            0.055,
            1.35,
            0,
          ]}
        >
          <mesh
            position={[
              0,
              -0.22,
              0,
            ]}
          >
            <cylinderGeometry
              args={[
                0.07,
                0.085,
                0.45,
                10,
              ]}
            />

            <meshStandardMaterial
              color={yellow}
            />
          </mesh>

          <group
            ref={
              leftForearm
            }
            position={[
              0,
              -0.43,
              0,
            ]}
          >
            <mesh
              position={[
                0,
                -0.18,
                0,
              ]}
            >
              <cylinderGeometry
                args={[
                  0.06,
                  0.07,
                  0.36,
                  10,
                ]}
              />

              <meshStandardMaterial
                color={
                  yellowDark
                }
              />
            </mesh>
          </group>
        </group>


        <group
          ref={rightArm}
          position={[
            shoulderWidth /
            2 +
            0.055,
            1.35,
            0,
          ]}
        >
          <mesh
            position={[
              0,
              -0.22,
              0,
            ]}
          >
            <cylinderGeometry
              args={[
                0.07,
                0.085,
                0.45,
                10,
              ]}
            />

            <meshStandardMaterial
              color={yellow}
            />
          </mesh>

          <group
            ref={
              rightForearm
            }
            position={[
              0,
              -0.43,
              0,
            ]}
          >
            <mesh
              position={[
                0,
                -0.18,
                0,
              ]}
            >
              <cylinderGeometry
                args={[
                  0.06,
                  0.07,
                  0.36,
                  10,
                ]}
              />

              <meshStandardMaterial
                color={
                  yellowDark
                }
              />
            </mesh>


            {role ===
              'production' && (
                <group
                  position={[
                    0,
                    -0.48,
                    0.08,
                  ]}
                >
                  <HandTool />
                </group>
              )}


            {role ===
              'material' && (
                <group
                  ref={
                    carriedWheel
                  }
                  position={[
                    0,
                    -0.54,
                    0.1,
                  ]}
                  visible={
                    false
                  }
                >
                  <HandWheel />
                </group>
              )}


            {(role ===
              'seat-stock' ||
              role ===
              'seat-install') && (
                <group
                  ref={
                    carriedSeat
                  }
                  position={[
                    0,
                    -0.51,
                    0.14,
                  ]}
                  visible={
                    false
                  }
                >
                  <HandSeat />
                </group>
              )}


            <group
              ref={
                drinkingGlass
              }
              position={[
                0,
                -0.5,
                0.12,
              ]}
              visible={
                false
              }
            >
              <CoffeeCup />
            </group>
          </group>
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
              10,
            ]}
          />

          <meshStandardMaterial
            color={skin}
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
          <mesh
            castShadow
          >
            <sphereGeometry
              args={[
                0.19,
                14,
                12,
              ]}
            />

            <meshStandardMaterial
              color={skin}
              roughness={0.78}
            />
          </mesh>


          <Face
            skin={skin}
          />


          <>
            {/* Full hair cap remains visible when helmet is removed */}

            <mesh
              position={[
                0,
                0.105,
                -0.035,
              ]}
              scale={[
                1.03,
                0.58,
                0.98,
              ]}
            >
              <sphereGeometry
                args={[
                  0.195,
                  12,
                  10,
                ]}
              />

              <meshStandardMaterial
                color={hair}
                roughness={0.82}
              />
            </mesh>


            {/* Back hair volume */}

            <mesh
              position={[
                0,
                0.015,
                -0.145,
              ]}
              scale={[
                0.92,
                0.9,
                0.62,
              ]}
            >
              <sphereGeometry
                args={[
                  0.18,
                  12,
                  10,
                ]}
              />

              <meshStandardMaterial
                color={hair}
                roughness={0.84}
              />
            </mesh>
          </>


          {gender ===
            'woman' && (
              <>
                <mesh
                  position={[
                    0,
                    0,
                    -0.2,
                  ]}
                >
                  <sphereGeometry
                    args={[
                      0.085,
                      10,
                      8,
                    ]}
                  />

                  <meshStandardMaterial
                    color={
                      hair
                    }
                  />
                </mesh>

                <mesh
                  position={[
                    0,
                    -0.1,
                    -0.225,
                  ]}
                >
                  <cylinderGeometry
                    args={[
                      0.045,
                      0.065,
                      0.23,
                      8,
                    ]}
                  />

                  <meshStandardMaterial
                    color={
                      hair
                    }
                  />
                </mesh>
              </>
            )}


          <group ref={helmet}>
            <mesh
              position={[
                0,
                0.17,
                0,
              ]}
              scale={[
                1,
                0.45,
                1,
              ]}
            >
              <sphereGeometry
                args={[
                  0.215,
                  14,
                  10,
                ]}
              />

              <meshStandardMaterial
                color="#e7ba31"
              />
            </mesh>

            <mesh
              position={[
                0,
                0.145,
                0.105,
              ]}
            >
              <boxGeometry
                args={[
                  0.44,
                  0.035,
                  0.2,
                ]}
              />

              <meshStandardMaterial
                color="#dba923"
              />
            </mesh>
          </group>
        </group>
        </group>
      </group>
    </group>
  )
}