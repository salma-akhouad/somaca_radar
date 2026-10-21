import {
  ASSEMBLY_VEHICLE_INTERVAL,
  getSeatServicePhase,
  SEAT_FIT_STOP_DURATION,
} from './assemblyLineCycle'


export const SEAT_PICKUP_POSITION = [
  58,
  22,
] as const


export const SEAT_DELIVERY_POSITION = [
  23,
  4,
] as const


export const SEAT_LOGISTICS_ROUTE = [
  [58, 22],
  [66, 22],
  [66, -2],
  [23, -2],
  [23, 4],
] as const


const OUTBOUND_DURATION = 12

const RETURN_DURATION = 11

const LOADING_DURATION = 4


export type SeatLogisticsPhase =
  | 'pickup'
  | 'outbound'
  | 'delivery'
  | 'return'


export interface SeatLogisticsState {
  phase:
    SeatLogisticsPhase

  x: number
  z: number

  rotation: number

  seatCount:
    0 | 1 | 2

  loaded: boolean

  moving: boolean

  installingSeat: boolean

  progress: number

  loadProgress: number
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


const SEGMENT_LENGTHS =
  SEAT_LOGISTICS_ROUTE
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
          SEAT_LOGISTICS_ROUTE[
            index + 1
          ],
        ),
    )


const TOTAL_LENGTH =
  SEGMENT_LENGTHS.reduce(
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
    TOTAL_LENGTH *
    progress


  for (
    let index = 0;
    index <
    SEGMENT_LENGTHS.length;
    index += 1
  ) {
    const segmentLength =
      SEGMENT_LENGTHS[
        index
      ]

    const start =
      SEAT_LOGISTICS_ROUTE[
        index
      ]

    const end =
      SEAT_LOGISTICS_ROUTE[
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
    SEAT_LOGISTICS_ROUTE[
      SEAT_LOGISTICS_ROUTE.length -
      1
    ]


  return {
    x:
      last[0],

    z:
      last[1],

    rotation:
      Math.PI,
  }
}


function seatsDuringLoading(
  progress: number,
):
  0 | 1 | 2 {
  if (
    progress <
    0.25
  ) {
    return 0
  }

  if (
    progress <
    0.62
  ) {
    return 1
  }

  return 2
}


function seatsDuringDelivery(
  progress: number,
):
  0 | 1 | 2 {
  if (
    progress <
    0.36
  ) {
    return 2
  }

  if (
    progress <
    0.74
  ) {
    return 1
  }

  return 0
}


export function getSeatLogisticsState(
  elapsedTime: number,
): SeatLogisticsState {
  const phase =
    getSeatServicePhase(
      elapsedTime,
    )


  if (
    phase <
    SEAT_FIT_STOP_DURATION
  ) {
    const progress =
      clamp(
        phase /
        SEAT_FIT_STOP_DURATION,
        0,
        1,
      )


    const seatCount =
      seatsDuringDelivery(
        progress,
      )


    return {
      phase:
        'delivery',

      x:
        SEAT_DELIVERY_POSITION[0],

      z:
        SEAT_DELIVERY_POSITION[1],

      rotation:
        Math.PI,

      seatCount,

      loaded:
        seatCount > 0,

      moving:
        false,

      installingSeat:
        true,

      progress,

      loadProgress: 1,
    }
  }


  if (
    phase <
    SEAT_FIT_STOP_DURATION +
    RETURN_DURATION
  ) {
    const progress =
      smoothStep(
        (
          phase -
          SEAT_FIT_STOP_DURATION
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

      rotation:
        sample.rotation +
        Math.PI,

      seatCount: 0,

      loaded: false,

      moving: true,

      installingSeat:
        false,

      progress,

      loadProgress: 0,
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
        SEAT_FIT_STOP_DURATION +
        RETURN_DURATION,

        outboundStart -
        LOADING_DURATION,
      )


    const loadProgress =
      phase <
      loadingStart
        ? 0
        : clamp(
            (
              phase -
              loadingStart
            ) /
            LOADING_DURATION,
            0,
            1,
          )


    const seatCount =
      seatsDuringLoading(
        loadProgress,
      )


    return {
      phase:
        'pickup',

      x:
        SEAT_PICKUP_POSITION[0],

      z:
        SEAT_PICKUP_POSITION[1],

      rotation:
        Math.PI / 2,

      seatCount,

      loaded:
        seatCount === 2,

      moving:
        false,

      installingSeat:
        false,

      progress:
        loadProgress,

      loadProgress,
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

    rotation:
      sample.rotation,

    seatCount: 2,

    loaded: true,

    moving: true,

    installingSeat:
      false,

    progress,

    loadProgress: 1,
  }
}