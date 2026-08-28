import {
  ASSEMBLY_VEHICLE_INTERVAL,
} from './assemblyLineCycle'

import {
  VEHICLE_JOURNEY,
  VEHICLE_JOURNEY_ORDER,
} from './vehicleJourney'

import type {
  VehicleJourneyKey,
} from './vehicleJourney'


export const LOWERING_TOP_WAIT = 2

export const LOWERING_DURATION = 5

export const LOWERING_HANDOFF_HOLD = 1


export const GROUND_VEHICLE_RELEASE_TIME =
  LOWERING_TOP_WAIT +
  LOWERING_DURATION +
  LOWERING_HANDOFF_HOLD


export const LIFT_RETURN_DELAY = 1

export const LIFT_RETURN_DURATION = 4


export const GROUND_VEHICLE_SPEED =
  2.45


export const GROUND_PAUSE_BY_DESTINATION:
  Partial<
    Record<
      VehicleJourneyKey,
      number
    >
  > = {
    finalControl: 6.2,

    validation: 3.6,

    releaseGate: 1.2,

    parkingAisle: 0.7,

    /*
     * The finished car remains in
     * its bay long enough to read
     * as genuinely parked.
     */
    parkingBay: 7,
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
      GROUND_VEHICLE_SPEED


    const movementStart =
      cursor


    const movementEnd =
      movementStart +
      movementDuration


    const pauseDuration =
      GROUND_PAUSE_BY_DESTINATION[
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

    endTime: cursor,
  }
}


const builtTimeline =
  buildTimeline()


const JOURNEY_TIMELINE =
  builtTimeline.timeline


export const GROUND_JOURNEY_END_TIME =
  builtTimeline.endTime


/*
 * The next finished-car cycle is aligned
 * to an integer number of production
 * vehicle intervals.
 *
 * This prevents a second finished vehicle
 * from appearing while the previous one
 * is still travelling or parked.
 */
const REQUIRED_CYCLE_TIME =
  GROUND_JOURNEY_END_TIME +
  4


const REQUIRED_ASSEMBLY_INTERVALS =
  Math.max(
    1,

    Math.ceil(
      REQUIRED_CYCLE_TIME /
      ASSEMBLY_VEHICLE_INTERVAL,
    ),
  )


export const FINISHED_VEHICLE_CYCLE_DURATION =
  ASSEMBLY_VEHICLE_INTERVAL *
  REQUIRED_ASSEMBLY_INTERVALS


export function getFinishedVehicleCycleIndex(
  elapsedTime: number,
) {
  return Math.floor(
    Math.max(
      0,
      elapsedTime,
    ) /
    FINISHED_VEHICLE_CYCLE_DURATION,
  )
}


export function getFinishedVehicleCycleTime(
  elapsedTime: number,
) {
  const safeTime =
    Math.max(
      0,
      elapsedTime,
    )


  return (
    safeTime %
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

      destinationKey: null,

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


      const easedRotation =
        smoothStep(
          progress,
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
            easedRotation,
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

    destinationKey: null,

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