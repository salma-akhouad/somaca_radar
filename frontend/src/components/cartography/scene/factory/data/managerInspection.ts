export type ManagerFocus =
  | 'none'
  | 'right-car'
  | 'right-worker'
  | 'upper-line'
  | 'left-car'
  | 'left-worker'


export type ManagerConversation =
  | 'right-production'
  | 'left-production'


export interface ManagerTimelineSample {
  x: number

  z: number

  rotation: number

  walking: boolean

  resting: boolean

  focus:
    ManagerFocus

  talkingTo?:
    ManagerConversation
}


type RoutePoint = {
  x: number

  z: number

  pause?: number

  resting?: boolean

  focus?:
    ManagerFocus

  talkingTo?:
    ManagerConversation
}


const WALK_SPEED =
  1.55


const OFFICE_CHAIR = {
  x: 29.7,
  z: 9.33,
}


const ROUTE:
  RoutePoint[] = [
    {
      ...OFFICE_CHAIR,

      pause: 16,

      resting: true,

      focus: 'none',
    },

    {
      x: 31,
      z: 9.4,
    },

    {
      x: 31.8,
      z: 8.2,
    },

    {
      x: 33.4,
      z: 8,
    },

    {
      x: 34,
      z: 11,
    },

    {
      x: 27,
      z: 11,
    },

    {
      x: 20,
      z: 11,
    },

    {
      x: 20,
      z: -1,

      pause: 6,

      focus:
        'right-car',
    },

    {
      x: 20,
      z: -7.4,

      pause: 5,

      focus:
        'right-worker',

      talkingTo:
        'right-production',
    },

    {
      x: 20,
      z: 10,
    },

    {
      x: 20,
      z: 16,
    },

    {
      x: 17,
      z: 19,
    },

    {
      x: 0,
      z: 19,

      pause: 6,

      focus:
        'upper-line',
    },

    /*
     * The centre of the production U is
     * intentionally left empty.
     * The manager stays on the existing
     * pedestrian network.
     */

    {
      x: -17,
      z: 19,
    },

    {
      x: -20,
      z: 16,
    },

    {
      x: -20,
      z: 7.1,

      pause: 5,

      focus:
        'left-worker',

      talkingTo:
        'left-production',
    },

    {
      x: -20,
      z: 1,

      pause: 6,

      focus:
        'left-car',
    },

    {
      x: -20,
      z: 16,
    },

    {
      x: -17,
      z: 19,
    },

    {
      x: 0,
      z: 19,
    },

    {
      x: 17,
      z: 19,
    },

    {
      x: 20,
      z: 16,
    },

    {
      x: 20,
      z: 11,
    },

    {
      x: 27,
      z: 11,
    },

    {
      x: 34,
      z: 11,
    },

    {
      x: 33.4,
      z: 8,
    },

    {
      x: 31.8,
      z: 8.2,
    },

    {
      x: 31,
      z: 9.4,
    },

    {
      ...OFFICE_CHAIR,

      pause: 18,

      resting: true,

      focus: 'none',
    },
  ]


type TimelineSegment =
  | {
      kind: 'walk'

      from:
        RoutePoint

      to:
        RoutePoint

      duration:
        number
    }

  | {
      kind: 'pause'

      at:
        RoutePoint

      duration:
        number
    }


function distance(
  first:
    RoutePoint,

  second:
    RoutePoint,
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


const TIMELINE:
  TimelineSegment[] = []


ROUTE.forEach(
  (
    point,
    index,
  ) => {
    if (
      point.pause
    ) {
      TIMELINE.push({
        kind:
          'pause',

        at:
          point,

        duration:
          point.pause,
      })
    }


    if (
      index <
      ROUTE.length - 1
    ) {
      const next =
        ROUTE[
          index + 1
        ]


      TIMELINE.push({
        kind:
          'walk',

        from:
          point,

        to:
          next,

        duration:
          distance(
            point,
            next,
          ) /
          WALK_SPEED,
      })
    }
  },
)


const TOTAL_DURATION =
  TIMELINE.reduce(
    (
      total,
      segment,
    ) =>
      total +
      segment.duration,

    0,
  )


function pauseRotation(
  point:
    RoutePoint,
) {
  if (
    point.resting
  ) {
    return Math.PI
  }


  switch (
    point.focus
  ) {
    case 'right-car':
      return -Math.PI / 2

    case 'right-worker':
      return Math.PI / 2

    case 'upper-line':
      return Math.PI

    case 'left-worker':
      return -Math.PI / 2

    case 'left-car':
      return Math.PI / 2

    default:
      return Math.PI
  }
}


export function sampleManagerTimeline(
  elapsedTime: number,
): ManagerTimelineSample {
  let remaining =
    elapsedTime %
    TOTAL_DURATION


  for (
    const segment
    of TIMELINE
  ) {
    if (
      remaining >
      segment.duration
    ) {
      remaining -=
        segment.duration

      continue
    }


    if (
      segment.kind ===
      'pause'
    ) {
      return {
        x:
          segment.at.x,

        z:
          segment.at.z,

        rotation:
          pauseRotation(
            segment.at,
          ),

        walking: false,

        resting:
          Boolean(
            segment.at.resting,
          ),

        focus:
          segment.at.focus ??
          'none',

        talkingTo:
          segment.at.talkingTo,
      }
    }


    const progress =
      segment.duration ===
      0
        ? 1
        : remaining /
          segment.duration


    const x =
      segment.from.x +
      (
        segment.to.x -
        segment.from.x
      ) *
      progress


    const z =
      segment.from.z +
      (
        segment.to.z -
        segment.from.z
      ) *
      progress


    const dx =
      segment.to.x -
      segment.from.x


    const dz =
      segment.to.z -
      segment.from.z


    return {
      x,

      z,

      rotation:
        Math.atan2(
          dx,
          dz,
        ),

      walking: true,

      resting: false,

      focus: 'none',
    }
  }


  return {
    x:
      ROUTE[0].x,

    z:
      ROUTE[0].z,

    rotation:
      Math.PI,

    walking: false,

    resting: true,

    focus: 'none',
  }
}


export function getManagerFocusTarget(
  sample:
    ManagerTimelineSample,
): [
  number,
  number,
] | null {
  switch (
    sample.focus
  ) {
    case 'right-car':
      return [
        17,
        -1,
      ]

    case 'right-worker':
      return [
        21.1,
        -7.2,
      ]

    case 'upper-line':
      return [
        0,
        16,
      ]

    case 'left-worker':
      return [
        -21.1,
        7.2,
      ]

    case 'left-car':
      return [
        -17,
        1,
      ]

    default:
      return null
  }
}


export function managerNeedsDoorOpen(
  elapsedTime: number,
) {
  const manager =
    sampleManagerTimeline(
      elapsedTime,
    )


  if (
    manager.resting
  ) {
    return false
  }


  const dx =
    manager.x -
    32.8


  const dz =
    manager.z -
    8


  return (
    Math.sqrt(
      dx * dx +
      dz * dz,
    ) <
    2.5
  )
}
