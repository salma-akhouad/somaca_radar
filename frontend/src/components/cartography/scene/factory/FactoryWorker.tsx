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
  sampleManagerTimeline,
} from './data/managerInspection'

import {
  getWorkerBreakState,
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


interface WorldPoint {
  x: number
  z: number
}


const BREAK_SEATS: [
  WorldPoint,
  WorldPoint,
] = [
  {
    x: 51.5,
    z: 30.2,
  },
  {
    x: 54.5,
    z: 30.2,
  },
]


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


function normalizeAngle(
  value: number,
) {
  let angle = value

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


function distanceBetween(
  a: WorldPoint,
  b: WorldPoint,
) {
  const dx =
    b.x -
    a.x

  const dz =
    b.z -
    a.z

  return Math.sqrt(
    dx * dx +
    dz * dz,
  )
}


function buildBreakRoute(
  start: WorldPoint,
  seat: WorldPoint,
) {
  const points:
    WorldPoint[] = [
      start,
    ]


  if (
    start.x <
    -17
  ) {
    points.push({
      x: -20,
      z: start.z,
    })

    points.push({
      x: -20,
      z: 19,
    })

    points.push({
      x: 20,
      z: 19,
    })
  } else if (
    start.x <
    40
  ) {
    points.push({
      x: 20,
      z: start.z,
    })

    points.push({
      x: 20,
      z: 19,
    })
  } else {
    points.push({
      x: 50,
      z: start.z,
    })
  }


  if (
    points[
      points.length -
      1
    ].x !== 50 ||
    points[
      points.length -
      1
    ].z !== 19
  ) {
    points.push({
      x: 50,
      z: 19,
    })
  }


  points.push({
    x: 50,
    z: 31,
  })


  points.push({
    x: seat.x,
    z: 31,
  })


  points.push(
    seat,
  )


  return points
}


function samplePolyline(
  points: WorldPoint[],
  rawProgress: number,
) {
  const progress =
    clamp(
      rawProgress,
      0,
      1,
    )


  if (
    points.length <
    2
  ) {
    return {
      ...points[0],

      yaw: 0,
    }
  }


  const lengths =
    points
      .slice(
        0,
        -1,
      )
      .map(
        (
          point,
          index,
        ) =>
          distanceBetween(
            point,
            points[
              index + 1
            ],
          ),
      )


  const totalLength =
    lengths.reduce(
      (
        total,
        value,
      ) =>
        total +
        value,
      0,
    )


  let remaining =
    totalLength *
    progress


  for (
    let index = 0;
    index <
    lengths.length;
    index += 1
  ) {
    const segmentLength =
      lengths[
        index
      ]

    const start =
      points[
        index
      ]

    const end =
      points[
        index + 1
      ]


    if (
      remaining >
      segmentLength
    ) {
      remaining -=
        segmentLength

      continue
    }


    const localProgress =
      segmentLength === 0
        ? 0
        : remaining /
        segmentLength


    const x =
      start.x +
      (
        end.x -
        start.x
      ) *
      localProgress


    const z =
      start.z +
      (
        end.z -
        start.z
      ) *
      localProgress


    const yaw =
      Math.atan2(
        end.x -
        start.x,

        end.z -
        start.z,
      )


    return {
      x,
      z,
      yaw,
    }
  }


  const end =
    points[
      points.length -
      1
    ]

  return {
    x: end.x,
    z: end.z,

    yaw: 0,
  }
}


function worldDeltaToLocal(
  dx: number,
  dz: number,
  baseRotation: number,
) {
  const cos =
    Math.cos(
      -baseRotation,
    )

  const sin =
    Math.sin(
      -baseRotation,
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


function WaterGlass() {
  return (
    <mesh>
      <cylinderGeometry
        args={[
          0.055,
          0.045,
          0.16,
          10,
        ]}
      />

      <meshStandardMaterial
        color="#cbd3d1"
        transparent
        opacity={0.72}
        roughness={0.15}
      />
    </mesh>
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


  useFrame(
    (state) => {
      if (
        !root.current ||
        !torso.current ||
        !head.current ||
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
            root.current.rotation.y =
              -0.42


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


        roleBusy =
          logistics.phase ===
          'pickup'


        if (
          logistics.phase ===
          'pickup'
        ) {
          const load =
            logistics.loadProgress


          root.current.rotation.y =
            -0.35


          torso.current.rotation.x =
            -0.12


          leftArm.current.rotation.x =
            -0.58 -
            load *
            0.24


          rightArm.current.rotation.x =
            -0.58 -
            load *
            0.24


          leftForearm.current.rotation.x =
            -0.68

          rightForearm.current.rotation.x =
            -0.68


          if (
            carriedSeat.current
          ) {
            carriedSeat.current.visible =
              load >
              0.1 &&
              load <
              0.72
          }


          root.current.position.x =
            smoothStep(
              load,
            ) *
            0.42
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


          if (
            progress <
            0.3
          ) {
            root.current.rotation.y =
              0.52


            leftArm.current.rotation.x =
              -0.7

            rightArm.current.rotation.x =
              -0.7


            leftForearm.current.rotation.x =
              -0.74

            rightForearm.current.rotation.x =
              -0.74
          } else if (
            progress <
            0.7
          ) {
            root.current.position.x =
              -0.45

            root.current.position.z =
              -0.32


            root.current.rotation.y =
              0.16


            torso.current.rotation.x =
              -0.15


            leftArm.current.rotation.x =
              -0.88

            rightArm.current.rotation.x =
              -0.88


            leftForearm.current.rotation.x =
              -0.8

            rightForearm.current.rotation.x =
              -0.8
          } else {
            root.current.position.x =
              -0.72

            root.current.position.z =
              -0.46


            torso.current.rotation.x =
              -0.24

            head.current.rotation.x =
              -0.24


            leftArm.current.rotation.x =
              -1.02

            rightArm.current.rotation.x =
              -1.02


            leftForearm.current.rotation.x =
              -0.88

            rightForearm.current.rotation.x =
              -0.88
          }


          if (
            carriedSeat.current
          ) {
            carriedSeat.current.visible =
              progress >
              0.12 &&
              progress <
              0.76
          }
        } else {
          head.current.rotation.y =
            Math.sin(
              time * 0.28,
            ) *
            0.14
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
      }


      if (
        role ===
        'validation-console'
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
        const breakState =
          getWorkerBreakState(
            elapsed,
            workerId,
          )


        const canTakeBreak =
          breakState.active &&
          !roleBusy &&
          !talkingRight &&
          !talkingLeft


        if (
          canTakeBreak
        ) {
          const seat =
            BREAK_SEATS[
              breakState.seatIndex
            ]


          const route =
            buildBreakRoute(
              {
                x:
                  position[0],

                z:
                  position[2],
              },

              seat,
            )


          let sample:
            {
              x: number
              z: number
              yaw: number
            }


          if (
            breakState.stage ===
            'walk-out'
          ) {
            sample =
              samplePolyline(
                route,
                smoothStep(
                  breakState.progress,
                ),
              )
          } else if (
            breakState.stage ===
            'walk-back'
          ) {
            sample =
              samplePolyline(
                route,
                1 -
                smoothStep(
                  breakState.progress,
                ),
              )
          } else {
            sample = {
              x: seat.x,
              z: seat.z,

              yaw:
                breakState.seatIndex ===
                0
                  ? Math.PI / 2
                  : -Math.PI / 2,
            }
          }


          const delta =
            worldDeltaToLocal(
              sample.x -
              position[0],

              sample.z -
              position[2],

              rotation,
            )


          root.current.position.x =
            delta.x


          root.current.position.z =
            delta.z


          root.current.rotation.y =
            normalizeAngle(
              sample.yaw -
              rotation,
            )


          if (
            breakState.stage ===
              'walk-out' ||
            breakState.stage ===
              'walk-back'
          ) {
            const walk =
              Math.sin(
                elapsed * 8,
              )


            leftArm.current.rotation.x =
              walk *
              0.42


            rightArm.current.rotation.x =
              -walk *
              0.42


            leftForearm.current.rotation.x =
              -0.08


            rightForearm.current.rotation.x =
              -0.08


            torso.current.rotation.x =
              0.02


            head.current.rotation.y =
              Math.sin(
                elapsed * 0.8,
              ) *
              0.04
          } else {
            helmet.current.visible =
              false


            root.current.position.y =
              -0.36


            torso.current.rotation.x =
              0.08


            head.current.rotation.x =
              -0.03


            leftArm.current.rotation.x =
              -0.38


            rightArm.current.rotation.x =
              -0.42


            leftForearm.current.rotation.x =
              -0.58


            rightForearm.current.rotation.x =
              -0.58


            if (
              breakState.stage ===
              'drink'
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
            } else {
              head.current.rotation.y =
                Math.sin(
                  elapsed * 0.25,
                ) *
                0.12
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
      scale={1.13}
    >
      <group ref={root}>
        {[
          -0.115,
          0.115,
        ].map(
          (x) => (
            <group
              key={x}
              position={[
                x,
                0,
                0,
              ]}
            >
              <mesh
                position={[
                  0,
                  0.46,
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
                  0.095,
                  0.075,
                ]}
              />
            </group>
          ),
        )}


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
              <WaterGlass />
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


          <mesh
            position={[
              0,
              0.07,
              -0.1,
            ]}
            scale={[
              1,
              0.72,
              0.78,
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
            />
          </mesh>


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
  )
}