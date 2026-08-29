export type WorkerBreakId =
  | 'right-production'
  | 'left-production'
  | 'quality'
  | 'wheel-material'
  | 'terminal'
  | 'seat-install'


export type WorkerBreakStage =
  | 'walk-out'
  | 'sit'
  | 'drink'
  | 'walk-back'
  | 'complete'


export interface WorkerBreakRequest {
  open: boolean

  key: string
}


export interface WorkerBreakSample {
  stage: WorkerBreakStage

  complete: boolean

  x: number

  z: number

  yaw: number

  seatIndex:
    0 | 1

  walking: boolean
}


type Point = {
  x: number

  z: number
}


interface WorkerRoute {
  points:
    Point[]

  seatIndex:
    0 | 1
}


const WALK_SPEED =
  1.45


const FIRST_SEATED_DURATION =
  15


const DRINK_DURATION =
  5


const SECOND_SEATED_DURATION =
  8


/*
 * A worker has a short window in which
 * they may start their break.
 *
 * If their workstation is busy for that
 * entire window, they simply skip this
 * cycle instead of teleporting halfway
 * through a walk later.
 */
const REQUEST_WINDOW =
  12


/*
 * Groups are separated by enough time
 * for even the longest round trip.
 *
 * Maximum simultaneous break workers = 2.
 */
const BREAK_CYCLE_DURATION =
  430


const BREAK_STARTS:
  Record<
    WorkerBreakId,
    number
  > = {
    'right-production': 20,

    terminal: 20,

    'left-production': 155,

    quality: 155,

    'wheel-material': 290,

    'seat-install': 290,
  }


/*
 * These points deliberately follow the
 * visible white pedestrian network.
 *
 * Shared destination:
 * horizontal path z = 19
 * vertical employee path x = 8
 */
const ROUTES:
  Record<
    WorkerBreakId,
    WorkerRoute
  > = {
    'right-production': {
      seatIndex: 0,

      points: [
        {
          x: 21.1,
          z: -7.2,
        },

        {
          x: 20,
          z: -7.2,
        },

        {
          x: 20,
          z: 19,
        },

        {
          x: 8,
          z: 19,
        },

        {
          x: 8,
          z: 30.4,
        },

        {
          x: 4.25,
          z: 30.4,
        },
      ],
    },


    'left-production': {
      seatIndex: 0,

      points: [
        {
          x: -21.1,
          z: 7.2,
        },

        {
          x: -20,
          z: 7.2,
        },

        {
          x: -20,
          z: 19,
        },

        {
          x: 8,
          z: 19,
        },

        {
          x: 8,
          z: 30.4,
        },

        {
          x: 4.25,
          z: 30.4,
        },
      ],
    },


    quality: {
      seatIndex: 1,

      points: [
        {
          x: 20.8,
          z: -16.2,
        },

        {
          x: 20,
          z: -16.2,
        },

        {
          x: 20,
          z: 19,
        },

        {
          x: 8,
          z: 19,
        },

        {
          x: 8,
          z: 30.4,
        },

        {
          x: 10.75,
          z: 30.4,
        },
      ],
    },


    'wheel-material': {
      seatIndex: 0,

      points: [
        {
          x: -21.4,
          z: 0,
        },

        /*
         * Move away from the wheel AGV
         * before joining the pedestrian path.
         */
        {
          x: -20,
          z: 0,
        },

        {
          x: -20,
          z: 19,
        },

        {
          x: 8,
          z: 19,
        },

        {
          x: 8,
          z: 30.4,
        },

        {
          x: 4.25,
          z: 30.4,
        },
      ],
    },


    terminal: {
      seatIndex: 1,

      points: [
        {
          x: -8.2,
          z: 20.7,
        },

        {
          x: -8.2,
          z: 19,
        },

        {
          x: 8,
          z: 19,
        },

        {
          x: 8,
          z: 30.4,
        },

        {
          x: 10.75,
          z: 30.4,
        },
      ],
    },


    'seat-install': {
      seatIndex: 1,

      points: [
        {
          x: 22.1,
          z: 4.2,
        },

        /*
         * First move away from the seat AGV
         * delivery point at [23, 4].
         */
        {
          x: 20,
          z: 4.2,
        },

        {
          x: 20,
          z: 19,
        },

        {
          x: 8,
          z: 19,
        },

        {
          x: 8,
          z: 30.4,
        },

        {
          x: 10.75,
          z: 30.4,
        },
      ],
    },
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


function distance(
  first: Point,
  second: Point,
) {
  const dx =
    second.x -
    first.x


  const dz =
    second.z -
    first.z


  return Math.sqrt(
    dx * dx +
    dz * dz,
  )
}


function routeLength(
  points: Point[],
) {
  let total =
    0


  for (
    let index = 0;
    index <
    points.length - 1;
    index += 1
  ) {
    total +=
      distance(
        points[index],
        points[
          index + 1
        ],
      )
  }


  return total
}


function sampleRoute(
  points: Point[],
  rawDistance: number,
) {
  const total =
    routeLength(
      points,
    )


  let remaining =
    clamp(
      rawDistance,
      0,
      total,
    )


  for (
    let index = 0;
    index <
    points.length - 1;
    index += 1
  ) {
    const start =
      points[index]


    const end =
      points[
        index + 1
      ]


    const segmentLength =
      distance(
        start,
        end,
      )


    if (
      remaining >
      segmentLength
    ) {
      remaining -=
        segmentLength

      continue
    }


    const progress =
      segmentLength === 0
        ? 1
        : remaining /
          segmentLength


    return {
      x:
        start.x +
        (
          end.x -
          start.x
        ) *
        progress,

      z:
        start.z +
        (
          end.z -
          start.z
        ) *
        progress,

      yaw:
        Math.atan2(
          end.x -
          start.x,

          end.z -
          start.z,
        ),
    }
  }


  const last =
    points[
      points.length - 1
    ]


  return {
    x: last.x,

    z: last.z,

    yaw: Math.PI,
  }
}


export function getWorkerBreakRequest(
  elapsedTime: number,
  workerId: WorkerBreakId,
): WorkerBreakRequest {
  const cycleIndex =
    Math.floor(
      Math.max(
        0,
        elapsedTime,
      ) /
      BREAK_CYCLE_DURATION,
    )


  const cycleTime =
    (
      (
        elapsedTime %
        BREAK_CYCLE_DURATION
      ) +
      BREAK_CYCLE_DURATION
    ) %
    BREAK_CYCLE_DURATION


  const start =
    BREAK_STARTS[
      workerId
    ]


  return {
    open:
      cycleTime >=
        start &&
      cycleTime <
        start +
        REQUEST_WINDOW,

    key:
      `${cycleIndex}-${start}`,
  }
}


export function sampleWorkerBreak(
  workerId: WorkerBreakId,
  breakElapsed: number,
): WorkerBreakSample {
  const route =
    ROUTES[
      workerId
    ]


  const length =
    routeLength(
      route.points,
    )


  const walkDuration =
    length /
    WALK_SPEED


  if (
    breakElapsed <
    walkDuration
  ) {
    const sample =
      sampleRoute(
        route.points,

        breakElapsed *
        WALK_SPEED,
      )


    return {
      ...sample,

      stage:
        'walk-out',

      complete: false,

      seatIndex:
        route.seatIndex,

      walking: true,
    }
  }


  const afterWalk =
    breakElapsed -
    walkDuration


  const destination =
    route.points[
      route.points.length - 1
    ]


  if (
    afterWalk <
    FIRST_SEATED_DURATION
  ) {
    return {
      x:
        destination.x,

      z:
        destination.z,

      yaw:
        route.seatIndex === 0
          ? Math.PI / 2
          : -Math.PI / 2,

      stage: 'sit',

      complete: false,

      seatIndex:
        route.seatIndex,

      walking: false,
    }
  }


  const afterFirstSit =
    afterWalk -
    FIRST_SEATED_DURATION


  if (
    afterFirstSit <
    DRINK_DURATION
  ) {
    return {
      x:
        destination.x,

      z:
        destination.z,

      yaw:
        route.seatIndex === 0
          ? Math.PI / 2
          : -Math.PI / 2,

      stage: 'drink',

      complete: false,

      seatIndex:
        route.seatIndex,

      walking: false,
    }
  }


  const afterDrink =
    afterFirstSit -
    DRINK_DURATION


  if (
    afterDrink <
    SECOND_SEATED_DURATION
  ) {
    return {
      x:
        destination.x,

      z:
        destination.z,

      yaw:
        route.seatIndex === 0
          ? Math.PI / 2
          : -Math.PI / 2,

      stage: 'sit',

      complete: false,

      seatIndex:
        route.seatIndex,

      walking: false,
    }
  }


  const returnElapsed =
    afterDrink -
    SECOND_SEATED_DURATION


  if (
    returnElapsed <
    walkDuration
  ) {
    const sample =
      sampleRoute(
        route.points,

        length -
        returnElapsed *
        WALK_SPEED,
      )


    /*
     * Reverse direction while returning.
     */
    return {
      ...sample,

      yaw:
        sample.yaw +
        Math.PI,

      stage:
        'walk-back',

      complete: false,

      seatIndex:
        route.seatIndex,

      walking: true,
    }
  }


  const home =
    route.points[0]


  return {
    x:
      home.x,

    z:
      home.z,

    yaw: 0,

    stage:
      'complete',

    complete: true,

    seatIndex:
      route.seatIndex,

    walking: false,
  }
}