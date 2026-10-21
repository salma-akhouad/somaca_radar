import {
  ASSEMBLY_VEHICLE_INTERVAL,
  ASSEMBLY_VISIBLE_DURATION,
} from './assemblyLineCycle'

import {
  VEHICLE_JOURNEY,
  VEHICLE_JOURNEY_ORDER,
} from './vehicleJourney'

import type {
  VehicleJourneyKey,
} from './vehicleJourney'


/*
 * The lowering operation starts only when
 * an actual production vehicle completes
 * the U-shaped assembly line.
 */
export const FIRST_FINISHED_VEHICLE_TIME =
  (
    (
      ASSEMBLY_VISIBLE_DURATION %
      ASSEMBLY_VEHICLE_INTERVAL
    ) +
    ASSEMBLY_VEHICLE_INTERVAL
  ) %
  ASSEMBLY_VEHICLE_INTERVAL


export const FINISHED_VEHICLE_CYCLE_DURATION =
  ASSEMBLY_VEHICLE_INTERVAL


export const LOWERING_TOP_WAIT =
  0.8

export const LOWERING_DURATION =
  4

export const LOWERING_HANDOFF_HOLD =
  0.5


export const GROUND_VEHICLE_RELEASE_TIME =
  LOWERING_TOP_WAIT +
  LOWERING_DURATION +
  LOWERING_HANDOFF_HOLD


export const LIFT_RETURN_DELAY =
  0.6

export const LIFT_RETURN_DURATION =
  3.2


const GROUND_VEHICLE_SPEED =
  3.15


const PARKING_REVERSE_SPEED =
  1.55


const PAUSE_BY_DESTINATION:
  Partial<
    Record<
      VehicleJourneyKey,
      number
    >
  > = {
    /*
     * Enough time for the complete
     * light-test sequence.
     */
    finalControl: 5.1,

    validation: 2.6,

    releaseGate: 0.7,

    parkingAisle: 0.35,

    parkingAlign: 0.55,

    /*
     * Briefly remain parked before
     * disappearing invisibly.
     */
    parkingBay: 2.8,
  }


interface TimelineSegment {
  startKey:
    VehicleJourneyKey

  destinationKey:
    VehicleJourneyKey

  movementStart: number

  movementEnd: number

  pauseEnd: number

  pauseDuration: number
}


export interface FinishedVehicleSample {
  visible: boolean

  cycleIndex: number

  cycleTime: number

  phase:
    | 'hidden'
    | 'driving'
    | 'paused'
    | 'parked'

  position: [
    number,
    number,
    number,
  ]

  rotation: number

  destinationKey:
    VehicleJourneyKey |
    null

  pauseElapsed: number
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


function lerpAngle(
  start: number,
  end: number,
  progress: number,
) {
  let difference =
    end -
    start


  while (
    difference >
    Math.PI
  ) {
    difference -=
      Math.PI * 2
  }


  while (
    difference <
    -Math.PI
  ) {
    difference +=
      Math.PI * 2
  }


  return (
    start +
    difference *
    progress
  )
}


function distanceBetween(
  startKey:
    VehicleJourneyKey,

  destinationKey:
    VehicleJourneyKey,
) {
  const start =
    VEHICLE_JOURNEY[
      startKey
    ]


  const destination =
    VEHICLE_JOURNEY[
      destinationKey
    ]


  const dx =
    destination
      .position[0] -
    start.position[0]


  const dz =
    destination
      .position[2] -
    start.position[2]


  return Math.sqrt(
    dx * dx +
    dz * dz,
  )
}


function movementSpeed(
  destinationKey:
    VehicleJourneyKey,
) {
  if (
    destinationKey ===
    'parkingBay'
  ) {
    return (
      PARKING_REVERSE_SPEED
    )
  }


  return (
    GROUND_VEHICLE_SPEED
  )
}


function buildTimeline() {
  const timeline:
    TimelineSegment[] = []


  let cursor =
    GROUND_VEHICLE_RELEASE_TIME


  for (
    let index = 0;
    index <
    VEHICLE_JOURNEY_ORDER.length -
    1;
    index += 1
  ) {
    const startKey =
      VEHICLE_JOURNEY_ORDER[
        index
      ]


    const destinationKey =
      VEHICLE_JOURNEY_ORDER[
        index + 1
      ]


    const movementDuration =
      distanceBetween(
        startKey,
        destinationKey,
      ) /
      movementSpeed(
        destinationKey,
      )


    const movementStart =
      cursor


    const movementEnd =
      movementStart +
      movementDuration


    const pauseDuration =
      PAUSE_BY_DESTINATION[
        destinationKey
      ] ?? 0


    const pauseEnd =
      movementEnd +
      pauseDuration


    timeline.push({
      startKey,

      destinationKey,

      movementStart,

      movementEnd,

      pauseEnd,

      pauseDuration,
    })


    cursor =
      pauseEnd
  }


  return {
    timeline,

    endTime:
      cursor,
  }
}


const builtTimeline =
  buildTimeline()


const JOURNEY_TIMELINE =
  builtTimeline.timeline


export const GROUND_JOURNEY_END_TIME =
  builtTimeline.endTime


export function getFinishedVehicleCycleIndex(
  elapsedTime: number,
) {
  if (
    elapsedTime <
    FIRST_FINISHED_VEHICLE_TIME
  ) {
    return -1
  }


  return Math.floor(
    (
      elapsedTime -
      FIRST_FINISHED_VEHICLE_TIME
    ) /
    FINISHED_VEHICLE_CYCLE_DURATION,
  )
}


export function getFinishedVehicleCycleTime(
  elapsedTime: number,
) {
  if (
    elapsedTime <
    FIRST_FINISHED_VEHICLE_TIME
  ) {
    return -1
  }


  return (
    (
      elapsedTime -
      FIRST_FINISHED_VEHICLE_TIME
    ) %
    FINISHED_VEHICLE_CYCLE_DURATION
  )
}


export function sampleFinishedVehicleJourney(
  elapsedTime: number,
): FinishedVehicleSample {
  const cycleIndex =
    getFinishedVehicleCycleIndex(
      elapsedTime,
    )


  const cycleTime =
    getFinishedVehicleCycleTime(
      elapsedTime,
    )


  const start =
    VEHICLE_JOURNEY.lowered


  if (
    cycleTime <
      GROUND_VEHICLE_RELEASE_TIME ||
    cycleTime >=
      GROUND_JOURNEY_END_TIME
  ) {
    return {
      visible: false,

      cycleIndex,

      cycleTime,

      phase: 'hidden',

      position: [
        ...start.position,
      ],

      rotation:
        start.rotation,

      destinationKey:
        null,

      pauseElapsed: 0,
    }
  }


  for (
    const segment
    of JOURNEY_TIMELINE
  ) {
    const startPoint =
      VEHICLE_JOURNEY[
        segment.startKey
      ]


    const destination =
      VEHICLE_JOURNEY[
        segment.destinationKey
      ]


    if (
      cycleTime <=
      segment.movementEnd
    ) {
      const duration =
        segment.movementEnd -
        segment.movementStart


      const progress =
        duration <= 0
          ? 1
          : clamp(
            (
              cycleTime -
              segment.movementStart
            ) /
            duration,
            0,
            1,
          )


      return {
        visible: true,

        cycleIndex,

        cycleTime,

        phase: 'driving',

        position: [
          lerp(
            startPoint.position[0],
            destination.position[0],
            progress,
          ),

          lerp(
            startPoint.position[1],
            destination.position[1],
            progress,
          ),

          lerp(
            startPoint.position[2],
            destination.position[2],
            progress,
          ),
        ],

        rotation:
          lerpAngle(
            startPoint.rotation,
            destination.rotation,
            smoothStep(
              progress,
            ),
          ),

        destinationKey:
          segment.destinationKey,

        pauseElapsed: 0,
      }
    }


    if (
      segment.pauseDuration >
        0 &&
      cycleTime <
        segment.pauseEnd
    ) {
      return {
        visible: true,

        cycleIndex,

        cycleTime,

        phase:
          segment.destinationKey ===
          'parkingBay'
            ? 'parked'
            : 'paused',

        position: [
          ...destination.position,
        ],

        rotation:
          destination.rotation,

        destinationKey:
          segment.destinationKey,

        pauseElapsed:
          cycleTime -
          segment.movementEnd,
      }
    }
  }


  return {
    visible: false,

    cycleIndex,

    cycleTime,

    phase: 'hidden',

    position: [
      ...start.position,
    ],

    rotation:
      start.rotation,

    destinationKey:
      null,

    pauseElapsed: 0,
  }
}


export function isFinishedVehicleStoppedAt(
  elapsedTime: number,

  destination:
    VehicleJourneyKey,
) {
  const sample =
    sampleFinishedVehicleJourney(
      elapsedTime,
    )


  return (
    sample.visible &&
    (
      sample.phase ===
        'paused' ||
      sample.phase ===
        'parked'
    ) &&
    sample.destinationKey ===
      destination
  )
}