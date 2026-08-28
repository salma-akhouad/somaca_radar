import {
  ASSEMBLY_VEHICLE_INTERVAL,
  getWheelServicePhase,
  WHEEL_FIT_STOP_DURATION,
} from './assemblyLineCycle'


export const LOGISTICS_PICKUP_POSITION = [
  -40,
  28,
] as const


export const LOGISTICS_DELIVERY_POSITION = [
  -23,
  0,
] as const


export const LOGISTICS_ROUTE = [
  [-40, 28],
  [-32, 28],
  [-32, 4],
  [-23, 4],
  [-23, 0],
] as const


const OUTBOUND_DURATION = 10

const RETURN_DURATION = 9

const STOCK_LOADING_DURATION = 3.6


export type LogisticsPhase =
  | 'pickup'
  | 'outbound'
  | 'delivery'
  | 'return'


export interface LogisticsState {
  phase: LogisticsPhase

  x: number
  z: number

  positionX: number
  positionZ: number

  rotation: number

  wheelCount:
    0 | 1 | 2 | 3 | 4

  loaded: boolean

  installingWheel: boolean

  moving: boolean

  progress: number

  stockLoadProgress: number
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


function distanceBetween(
  a:
    readonly [
      number,
      number,
    ],

  b:
    readonly [
      number,
      number,
    ],
) {
  const dx =
    b[0] -
    a[0]

  const dz =
    b[1] -
    a[1]

  return Math.sqrt(
    dx * dx +
    dz * dz,
  )
}


const ROUTE_SEGMENTS =
  LOGISTICS_ROUTE
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
          LOGISTICS_ROUTE[
            index + 1
          ],
        ),
    )


const ROUTE_LENGTH =
  ROUTE_SEGMENTS.reduce(
    (
      total,
      length,
    ) =>
      total +
      length,
    0,
  )


function sampleRoute(
  rawProgress: number,
) {
  const progress =
    clamp(
      rawProgress,
      0,
      1,
    )

  let remaining =
    ROUTE_LENGTH *
    progress


  for (
    let index = 0;
    index <
    ROUTE_SEGMENTS.length;
    index += 1
  ) {
    const segmentLength =
      ROUTE_SEGMENTS[
        index
      ]

    const start =
      LOGISTICS_ROUTE[
        index
      ]

    const end =
      LOGISTICS_ROUTE[
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
      start[0] +
      (
        end[0] -
        start[0]
      ) *
      localProgress

    const z =
      start[1] +
      (
        end[1] -
        start[1]
      ) *
      localProgress


    const dx =
      end[0] -
      start[0]

    const dz =
      end[1] -
      start[1]


    return {
      x,
      z,

      rotation:
        Math.atan2(
          dx,
          dz,
        ),
    }
  }


  const last =
    LOGISTICS_ROUTE[
      LOGISTICS_ROUTE.length -
      1
    ]


  return {
    x: last[0],
    z: last[1],
    rotation:
      Math.PI,
  }
}


function wheelsDuringDelivery(
  operationTime: number,
):
  0 | 1 | 2 | 3 | 4 {
  const progress =
    clamp(
      operationTime /
      WHEEL_FIT_STOP_DURATION,
      0,
      1,
    )


  if (
    progress <
    0.2
  ) {
    return 4
  }

  if (
    progress <
    0.4
  ) {
    return 3
  }

  if (
    progress <
    0.6
  ) {
    return 2
  }

  if (
    progress <
    0.8
  ) {
    return 1
  }

  return 0
}


function wheelsDuringLoading(
  progress: number,
):
  0 | 1 | 2 | 3 | 4 {
  if (
    progress <
    0.15
  ) {
    return 0
  }

  if (
    progress <
    0.35
  ) {
    return 1
  }

  if (
    progress <
    0.55
  ) {
    return 2
  }

  if (
    progress <
    0.75
  ) {
    return 3
  }

  return 4
}


export function getLogisticsState(
  elapsedTime: number,
): LogisticsState {
  const phase =
    getWheelServicePhase(
      elapsedTime,
    )


  if (
    phase <
    WHEEL_FIT_STOP_DURATION
  ) {
    const progress =
      clamp(
        phase /
        WHEEL_FIT_STOP_DURATION,
        0,
        1,
      )

    const wheelCount =
      wheelsDuringDelivery(
        phase,
      )


    return {
      phase:
        'delivery',

      x:
        LOGISTICS_DELIVERY_POSITION[0],

      z:
        LOGISTICS_DELIVERY_POSITION[1],

      positionX:
        LOGISTICS_DELIVERY_POSITION[0],

      positionZ:
        LOGISTICS_DELIVERY_POSITION[1],

      rotation:
        Math.PI,

      wheelCount,

      loaded:
        wheelCount > 0,

      installingWheel:
        true,

      moving:
        false,

      progress,

      stockLoadProgress: 1,
    }
  }


  if (
    phase <
    WHEEL_FIT_STOP_DURATION +
    RETURN_DURATION
  ) {
    const progress =
      smoothStep(
        (
          phase -
          WHEEL_FIT_STOP_DURATION
        ) /
        RETURN_DURATION,
      )

    const sample =
      sampleRoute(
        1 -
        progress,
      )


    return {
      phase:
        'return',

      x:
        sample.x,

      z:
        sample.z,

      positionX:
        sample.x,

      positionZ:
        sample.z,

      rotation:
        sample.rotation +
        Math.PI,

      wheelCount: 0,

      loaded: false,

      installingWheel:
        false,

      moving: true,

      progress,

      stockLoadProgress: 0,
    }
  }


  const outboundStart =
    ASSEMBLY_VEHICLE_INTERVAL -
    OUTBOUND_DURATION


  if (
    phase <
    outboundStart
  ) {
    const loadingStart =
      Math.max(
        WHEEL_FIT_STOP_DURATION +
        RETURN_DURATION,

        outboundStart -
        STOCK_LOADING_DURATION,
      )


    const stockLoadProgress =
      phase <
      loadingStart
        ? 0
        : clamp(
            (
              phase -
              loadingStart
            ) /
            STOCK_LOADING_DURATION,
            0,
            1,
          )


    const wheelCount =
      wheelsDuringLoading(
        stockLoadProgress,
      )


    return {
      phase:
        'pickup',

      x:
        LOGISTICS_PICKUP_POSITION[0],

      z:
        LOGISTICS_PICKUP_POSITION[1],

      positionX:
        LOGISTICS_PICKUP_POSITION[0],

      positionZ:
        LOGISTICS_PICKUP_POSITION[1],

      rotation:
        Math.PI / 2,

      wheelCount,

      loaded:
        wheelCount === 4,

      installingWheel:
        false,

      moving:
        false,

      progress:
        stockLoadProgress,

      stockLoadProgress,
    }
  }


  const progress =
    smoothStep(
      (
        phase -
        outboundStart
      ) /
      OUTBOUND_DURATION,
    )


  const sample =
    sampleRoute(
      progress,
    )


  return {
    phase:
      'outbound',

    x:
      sample.x,

    z:
      sample.z,

    positionX:
      sample.x,

    positionZ:
      sample.z,

    rotation:
      sample.rotation,

    wheelCount: 4,

    loaded: true,

    installingWheel:
      false,

    moving: true,

    progress,

    stockLoadProgress: 1,
  }
}