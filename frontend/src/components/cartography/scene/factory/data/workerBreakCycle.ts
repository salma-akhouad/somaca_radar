export type WorkerBreakId =
  | 'right-production'
  | 'left-production'
  | 'quality'
  | 'wheel-material'
  | 'terminal'
  | 'seat-stock'
  | 'seat-install'


export type WorkerBreakStage =
  | 'work'
  | 'walk-out'
  | 'sit'
  | 'drink'
  | 'walk-back'


export interface WorkerBreakState {
  active: boolean

  stage: WorkerBreakStage

  progress: number

  seatIndex: 0 | 1
}


const BREAK_CYCLE_DURATION = 240

const WALK_OUT_DURATION = 8

const FIRST_SEATED_DURATION = 15

const DRINK_DURATION = 5

const SECOND_SEATED_DURATION = 7

const WALK_BACK_DURATION = 8


const TOTAL_BREAK_DURATION =
  WALK_OUT_DURATION +
  FIRST_SEATED_DURATION +
  DRINK_DURATION +
  SECOND_SEATED_DURATION +
  WALK_BACK_DURATION


const BREAK_STARTS: Record<
  WorkerBreakId,
  number
> = {
  'right-production': 20,
  terminal: 23,

  'left-production': 80,
  quality: 83,

  'wheel-material': 140,
  'seat-stock': 143,

  'seat-install': 200,
}


const BREAK_SEATS: Record<
  WorkerBreakId,
  0 | 1
> = {
  'right-production': 0,
  terminal: 1,

  'left-production': 0,
  quality: 1,

  'wheel-material': 0,
  'seat-stock': 1,

  'seat-install': 0,
}


function normalizeCycleTime(
  elapsedTime: number,
) {
  return (
    (
      elapsedTime %
      BREAK_CYCLE_DURATION
    ) +
    BREAK_CYCLE_DURATION
  ) %
  BREAK_CYCLE_DURATION
}


function localBreakTime(
  elapsedTime: number,
  workerId: WorkerBreakId,
) {
  const cycleTime =
    normalizeCycleTime(
      elapsedTime,
    )

  const start =
    BREAK_STARTS[
      workerId
    ]


  if (
    cycleTime >=
    start
  ) {
    return (
      cycleTime -
      start
    )
  }


  return (
    cycleTime +
    BREAK_CYCLE_DURATION -
    start
  )
}


export function getWorkerBreakState(
  elapsedTime: number,
  workerId: WorkerBreakId,
): WorkerBreakState {
  const local =
    localBreakTime(
      elapsedTime,
      workerId,
    )


  const seatIndex =
    BREAK_SEATS[
      workerId
    ]


  if (
    local >=
    TOTAL_BREAK_DURATION
  ) {
    return {
      active: false,

      stage: 'work',

      progress: 0,

      seatIndex,
    }
  }


  if (
    local <
    WALK_OUT_DURATION
  ) {
    return {
      active: true,

      stage:
        'walk-out',

      progress:
        local /
        WALK_OUT_DURATION,

      seatIndex,
    }
  }


  const afterWalk =
    local -
    WALK_OUT_DURATION


  if (
    afterWalk <
    FIRST_SEATED_DURATION
  ) {
    return {
      active: true,

      stage: 'sit',

      progress:
        afterWalk /
        FIRST_SEATED_DURATION,

      seatIndex,
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
      active: true,

      stage: 'drink',

      progress:
        afterFirstSit /
        DRINK_DURATION,

      seatIndex,
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
      active: true,

      stage: 'sit',

      progress:
        afterDrink /
        SECOND_SEATED_DURATION,

      seatIndex,
    }
  }


  const returnTime =
    afterDrink -
    SECOND_SEATED_DURATION


  return {
    active: true,

    stage:
      'walk-back',

    progress:
      returnTime /
      WALK_BACK_DURATION,

    seatIndex,
  }
}