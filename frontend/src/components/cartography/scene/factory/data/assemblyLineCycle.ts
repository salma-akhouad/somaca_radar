import type {
  VehicleStage,
} from '../VehicleBody'


export const ASSEMBLY_VEHICLE_COUNT = 6

export const ASSEMBLY_SPEED = 0.58

export const ASSEMBLY_RETURN_DURATION = 28


const PATH = [
  [-17, -20.2],
  [-17, 0],
  [-17, 16],
  [17, 16],
  [17, -12.5],
] as const


const segmentLengths =
  PATH
    .slice(
      0,
      -1,
    )
    .map(
      (
        point,
        index,
      ) => {
        const next =
          PATH[
            index + 1
          ]

        const dx =
          next[0] -
          point[0]

        const dz =
          next[1] -
          point[1]

        return Math.sqrt(
          dx * dx +
          dz * dz,
        )
      },
    )


export const ASSEMBLY_TOTAL_LENGTH =
  segmentLengths.reduce(
    (
      total,
      value,
    ) =>
      total +
      value,
    0,
  )


export const WHEEL_FIT_DISTANCE =
  20.2

export const WHEEL_FIT_STOP_DURATION =
  3.8


export const UPPER_INSPECTION_DISTANCE =
  53.2

export const UPPER_INSPECTION_DURATION =
  2.2


// Right branch at approximately x=17, z=4.
export const SEAT_FIT_DISTANCE =
  82.2

export const SEAT_FIT_STOP_DURATION =
  4.2


const STOP_DURATION_TOTAL =
  WHEEL_FIT_STOP_DURATION +
  UPPER_INSPECTION_DURATION +
  SEAT_FIT_STOP_DURATION


const RAW_TRAVEL_DURATION =
  ASSEMBLY_TOTAL_LENGTH /
  ASSEMBLY_SPEED


export const ASSEMBLY_VISIBLE_DURATION =
  RAW_TRAVEL_DURATION +
  STOP_DURATION_TOTAL


export const ASSEMBLY_TOTAL_CYCLE =
  ASSEMBLY_VISIBLE_DURATION +
  ASSEMBLY_RETURN_DURATION


export const ASSEMBLY_VEHICLE_INTERVAL =
  ASSEMBLY_TOTAL_CYCLE /
  ASSEMBLY_VEHICLE_COUNT


export type AssemblyStop =
  | 'none'
  | 'wheel-fit'
  | 'upper-inspection'
  | 'seat-fit'


export interface AssemblyVehicleState {
  visible: boolean

  position: [
    number,
    number,
    number,
  ]

  rotation: number

  stage: VehicleStage

  stop: AssemblyStop

  distance: number

  wheelInstallProgress: number

  seatInstallProgress: number
}


interface DistanceSample {
  distance: number

  stop: AssemblyStop

  wheelInstallProgress: number

  seatInstallProgress: number
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


function stageForDistance(
  distance: number,
): VehicleStage {
  const progress =
    clamp(
      distance /
      ASSEMBLY_TOTAL_LENGTH,
      0,
      1,
    )

  if (
    progress <
    0.08
  ) {
    return 'shell'
  }

  if (
    progress <
    0.17
  ) {
    return 'glazing'
  }

  if (
    progress <
    0.69
  ) {
    return 'assembly'
  }

  if (
    progress <
    0.84
  ) {
    return 'documented'
  }

  return 'finished'
}


function samplePath(
  distance: number,
) {
  let remaining =
    clamp(
      distance,
      0,
      ASSEMBLY_TOTAL_LENGTH -
      0.0001,
    )


  for (
    let index = 0;
    index <
    segmentLengths.length;
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
      PATH[index]

    const end =
      PATH[
        index + 1
      ]


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


function distanceFromVisibleTime(
  visibleTime: number,
): DistanceSample {
  const wheelArrivalTime =
    WHEEL_FIT_DISTANCE /
    ASSEMBLY_SPEED


  if (
    visibleTime <
    wheelArrivalTime
  ) {
    return {
      distance:
        visibleTime *
        ASSEMBLY_SPEED,

      stop: 'none',

      wheelInstallProgress: 0,

      seatInstallProgress: 0,
    }
  }


  if (
    visibleTime <
    wheelArrivalTime +
    WHEEL_FIT_STOP_DURATION
  ) {
    const operationTime =
      visibleTime -
      wheelArrivalTime


    return {
      distance:
        WHEEL_FIT_DISTANCE,

      stop:
        'wheel-fit',

      wheelInstallProgress:
        clamp(
          operationTime /
          WHEEL_FIT_STOP_DURATION,
          0,
          1,
        ),

      seatInstallProgress: 0,
    }
  }


  const timeWithoutWheelStop =
    visibleTime -
    WHEEL_FIT_STOP_DURATION


  const upperArrivalTime =
    UPPER_INSPECTION_DISTANCE /
    ASSEMBLY_SPEED


  if (
    timeWithoutWheelStop <
    upperArrivalTime
  ) {
    return {
      distance:
        timeWithoutWheelStop *
        ASSEMBLY_SPEED,

      stop: 'none',

      wheelInstallProgress: 1,

      seatInstallProgress: 0,
    }
  }


  if (
    timeWithoutWheelStop <
    upperArrivalTime +
    UPPER_INSPECTION_DURATION
  ) {
    return {
      distance:
        UPPER_INSPECTION_DISTANCE,

      stop:
        'upper-inspection',

      wheelInstallProgress: 1,

      seatInstallProgress: 0,
    }
  }


  const timeWithoutFirstStops =
    visibleTime -
    WHEEL_FIT_STOP_DURATION -
    UPPER_INSPECTION_DURATION


  const seatArrivalTime =
    SEAT_FIT_DISTANCE /
    ASSEMBLY_SPEED


  if (
    timeWithoutFirstStops <
    seatArrivalTime
  ) {
    return {
      distance:
        timeWithoutFirstStops *
        ASSEMBLY_SPEED,

      stop: 'none',

      wheelInstallProgress: 1,

      seatInstallProgress: 0,
    }
  }


  if (
    timeWithoutFirstStops <
    seatArrivalTime +
    SEAT_FIT_STOP_DURATION
  ) {
    const operationTime =
      timeWithoutFirstStops -
      seatArrivalTime


    return {
      distance:
        SEAT_FIT_DISTANCE,

      stop:
        'seat-fit',

      wheelInstallProgress: 1,

      seatInstallProgress:
        clamp(
          operationTime /
          SEAT_FIT_STOP_DURATION,
          0,
          1,
        ),
    }
  }


  const finalMovementTime =
    visibleTime -
    STOP_DURATION_TOTAL


  return {
    distance:
      Math.min(
        ASSEMBLY_TOTAL_LENGTH -
        0.0001,

        finalMovementTime *
        ASSEMBLY_SPEED,
      ),

    stop: 'none',

    wheelInstallProgress: 1,

    seatInstallProgress: 1,
  }
}


export function getAssemblyVehicleOffset(
  index: number,
) {
  return (
    ASSEMBLY_VEHICLE_INTERVAL *
    index
  )
}


export function getAssemblyVehicleState(
  elapsedTime: number,
  index: number,
): AssemblyVehicleState {
  const offset =
    getAssemblyVehicleOffset(
      index,
    )


  const cycleTime =
    (
      elapsedTime +
      offset
    ) %
    ASSEMBLY_TOTAL_CYCLE


  if (
    cycleTime >=
    ASSEMBLY_VISIBLE_DURATION
  ) {
    return {
      visible: false,

      position: [
        -17,
        0,
        -20.2,
      ],

      rotation:
        -Math.PI / 2,

      stage: 'shell',

      stop: 'none',

      distance: 0,

      wheelInstallProgress: 0,

      seatInstallProgress: 0,
    }
  }


  const sampled =
    distanceFromVisibleTime(
      cycleTime,
    )


  const path =
    samplePath(
      sampled.distance,
    )


  return {
    visible: true,

    position:
      path.position,

    rotation:
      path.rotation,

    stage:
      stageForDistance(
        sampled.distance,
      ),

    stop:
      sampled.stop,

    distance:
      sampled.distance,

    wheelInstallProgress:
      sampled
        .wheelInstallProgress,

    seatInstallProgress:
      sampled
        .seatInstallProgress,
  }
}


export function isWheelFitActive(
  elapsedTime: number,
) {
  for (
    let index = 0;
    index <
    ASSEMBLY_VEHICLE_COUNT;
    index += 1
  ) {
    const state =
      getAssemblyVehicleState(
        elapsedTime,
        index,
      )

    if (
      state.visible &&
      state.stop ===
      'wheel-fit'
    ) {
      return true
    }
  }

  return false
}


export function isSeatFitActive(
  elapsedTime: number,
) {
  for (
    let index = 0;
    index <
    ASSEMBLY_VEHICLE_COUNT;
    index += 1
  ) {
    const state =
      getAssemblyVehicleState(
        elapsedTime,
        index,
      )

    if (
      state.visible &&
      state.stop ===
      'seat-fit'
    ) {
      return true
    }
  }

  return false
}


export function isVehicleNear(
  elapsedTime: number,
  targetX: number,
  targetZ: number,
  radius = 3,
) {
  for (
    let index = 0;
    index <
    ASSEMBLY_VEHICLE_COUNT;
    index += 1
  ) {
    const state =
      getAssemblyVehicleState(
        elapsedTime,
        index,
      )


    if (
      !state.visible
    ) {
      continue
    }


    const dx =
      state.position[0] -
      targetX

    const dz =
      state.position[2] -
      targetZ


    if (
      Math.sqrt(
        dx * dx +
        dz * dz,
      ) <= radius
    ) {
      return true
    }
  }

  return false
}


const FIRST_WHEEL_STOP_TIME =
  WHEEL_FIT_DISTANCE /
  ASSEMBLY_SPEED


const FIRST_SEAT_STOP_TIME =
  SEAT_FIT_DISTANCE /
  ASSEMBLY_SPEED +
  WHEEL_FIT_STOP_DURATION +
  UPPER_INSPECTION_DURATION


function recurringPhase(
  elapsedTime: number,
  firstOperationTime: number,
) {
  const rawPhase =
    (
      elapsedTime -
      firstOperationTime
    ) %
    ASSEMBLY_VEHICLE_INTERVAL


  if (
    rawPhase <
    0
  ) {
    return (
      rawPhase +
      ASSEMBLY_VEHICLE_INTERVAL
    )
  }


  return rawPhase
}


export function getWheelServicePhase(
  elapsedTime: number,
) {
  return recurringPhase(
    elapsedTime,
    FIRST_WHEEL_STOP_TIME,
  )
}


export function getSeatServicePhase(
  elapsedTime: number,
) {
  return recurringPhase(
    elapsedTime,
    FIRST_SEAT_STOP_TIME,
  )
}