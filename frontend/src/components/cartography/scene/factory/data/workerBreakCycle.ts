import {
  AMENITIES_ENTRY,
  BREAK_CHAIRS,
  BREAK_CHAIR_APPROACH_DISTANCE,
} from './amenitiesLayout'


export type WorkerBreakId =
  | 'right-production'
  | 'left-production'
  | 'quality'
  | 'wheel-material'
  | 'terminal'
  | 'seat-install'


export type WorkerBreakStage =
  | 'walk-out'
  | 'sit-down'
  | 'sit'
  | 'drink'
  | 'stand-up'
  | 'walk-back'
  | 'complete'


export interface WorkerBreakRequest {
  open: boolean

  key: string
}


export interface WorkerBreakSample {
  stage:
    WorkerBreakStage

  complete:
    boolean

  x: number

  z: number

  yaw: number

  seatIndex:
    0 | 1

  walking: boolean

  seatProgress: number
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
  1.38


const SIT_DOWN_DURATION =
  1.35

const FIRST_SEATED_DURATION =
  13

const DRINK_DURATION =
  5

const SECOND_SEATED_DURATION =
  7

const STAND_UP_DURATION =
  1.2

const REQUEST_WINDOW =
  12

const BREAK_CYCLE_DURATION =
  440


const BREAK_STARTS:
  Record<
    WorkerBreakId,
    number
  > = {
    'right-production': 20,

    terminal: 28,

    'left-production': 160,

    quality: 168,

    'wheel-material': 300,

    'seat-install': 308,
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


function chairPoint(
  index:
    0 | 1,
): Point {
  return {
    x:
      BREAK_CHAIRS[index].x,

    z:
      BREAK_CHAIRS[index].z,
  }
}


function chairApproach(
  index:
    0 | 1,
): Point {
  const chair =
    BREAK_CHAIRS[index]


  /*
   * A chair with yaw=0 faces +Z.
   * Its open/front side is therefore +Z.
   * The worker reaches that front point first,
   * turns to face +Z, then moves backwards
   * into the chair during the sit-down stage.
   */
  return {
    x:
      chair.x +
      Math.sin(
        chair.yaw,
      ) *
      BREAK_CHAIR_APPROACH_DISTANCE,

    z:
      chair.z +
      Math.cos(
        chair.yaw,
      ) *
      BREAK_CHAIR_APPROACH_DISTANCE,
  }
}


const ENTRY =
  AMENITIES_ENTRY


function insideAmenities(
  seatIndex:
    0 | 1,
): Point[] {
  const approach =
    chairApproach(
      seatIndex,
    )


  /*
   * The painted pedestrian path ends at ENTRY.
   * From there the worker uses a clear aisle
   * around the furniture and reaches the front
   * of their assigned chair without crossing
   * a table or another chair.
   */
  return [
    ENTRY,

    {
      x: -31,
      z: -31.35,
    },

    {
      x:
        approach.x +
        1.05,
      z: -31.35,
    },

    {
      x:
        approach.x +
        1.05,
      z:
        approach.z,
    },

    approach,
  ]
}


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
          x: -20,
          z: 19,
        },

        {
          x: -20,
          z: -16,
        },

        {
          x: -20,
          z: -27,
        },

        ...insideAmenities(
          0,
        ),
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
          z: -16,
        },

        {
          x: -20,
          z: -27,
        },

        ...insideAmenities(
          0,
        ),
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
          x: 20.8,
          z: -16,
        },

        {
          x: 20,
          z: -16,
        },

        {
          x: 20,
          z: 19,
        },

        {
          x: -20,
          z: 19,
        },

        {
          x: -20,
          z: -16,
        },

        {
          x: -20,
          z: -27,
        },

        ...insideAmenities(
          1,
        ),
      ],
    },


    'wheel-material': {
      seatIndex: 0,

      points: [
        {
          x: -21.4,
          z: 0,
        },

        {
          x: -20,
          z: 0,
        },

        {
          x: -20,
          z: -16,
        },

        {
          x: -20,
          z: -27,
        },

        ...insideAmenities(
          0,
        ),
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
          x: -20,
          z: 19,
        },

        {
          x: -20,
          z: -16,
        },

        {
          x: -20,
          z: -27,
        },

        ...insideAmenities(
          1,
        ),
      ],
    },


    'seat-install': {
      seatIndex: 1,

      points: [
        {
          x: 20.6,
          z: 4.2,
        },

        {
          x: 20,
          z: 4.2,
        },

        {
          x: 20,
          z: 19,
        },

        {
          x: -20,
          z: 19,
        },

        {
          x: -20,
          z: -16,
        },

        {
          x: -20,
          z: -27,
        },

        ...insideAmenities(
          1,
        ),
      ],
    },
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
      segmentLength ===
      0
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
    x:
      last.x,

    z:
      last.z,

    yaw: 0,
  }
}


function seatedSample(
  seatIndex:
    0 | 1,

  stage:
    WorkerBreakStage,

  seatProgress:
    number,
): WorkerBreakSample {
  const chair =
    chairPoint(
      seatIndex,
    )

  const approach =
    chairApproach(
      seatIndex,
    )


  const progress =
    smoothStep(
      seatProgress,
    )


  return {
    stage,

    complete: false,

    /*
     * Approach point is in FRONT of the chair.
     * As progress grows the worker moves backward
     * from that point onto the exact chair centre.
     */
    x:
      approach.x +
      (
        chair.x -
        approach.x
      ) *
      progress,

    z:
      approach.z +
      (
        chair.z -
        approach.z
      ) *
      progress,

    yaw:
      BREAK_CHAIRS[
        seatIndex
      ].yaw,

    seatIndex,

    walking: false,

    seatProgress:
      progress,
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


  const outwardPoints =
    route.points


  const returnPoints =
    [
      ...outwardPoints,
    ].reverse()


  const length =
    routeLength(
      outwardPoints,
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
        outwardPoints,

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

      seatProgress: 0,
    }
  }


  let remaining =
    breakElapsed -
    walkDuration


  if (
    remaining <
    SIT_DOWN_DURATION
  ) {
    return seatedSample(
      route.seatIndex,

      'sit-down',

      remaining /
      SIT_DOWN_DURATION,
    )
  }


  remaining -=
    SIT_DOWN_DURATION


  if (
    remaining <
    FIRST_SEATED_DURATION
  ) {
    return seatedSample(
      route.seatIndex,

      'sit',

      1,
    )
  }


  remaining -=
    FIRST_SEATED_DURATION


  if (
    remaining <
    DRINK_DURATION
  ) {
    return seatedSample(
      route.seatIndex,

      'drink',

      1,
    )
  }


  remaining -=
    DRINK_DURATION


  if (
    remaining <
    SECOND_SEATED_DURATION
  ) {
    return seatedSample(
      route.seatIndex,

      'sit',

      1,
    )
  }


  remaining -=
    SECOND_SEATED_DURATION


  if (
    remaining <
    STAND_UP_DURATION
  ) {
    return seatedSample(
      route.seatIndex,

      'stand-up',

      1 -
      remaining /
      STAND_UP_DURATION,
    )
  }


  remaining -=
    STAND_UP_DURATION


  if (
    remaining <
    walkDuration
  ) {
    const sample =
      sampleRoute(
        returnPoints,

        remaining *
        WALK_SPEED,
      )


    return {
      ...sample,

      stage:
        'walk-back',

      complete: false,

      seatIndex:
        route.seatIndex,

      walking: true,

      seatProgress: 0,
    }
  }


  const home =
    outwardPoints[0]


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

    seatProgress: 0,
  }
}
