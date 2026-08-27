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
  VEHICLE_JOURNEY,
  VEHICLE_JOURNEY_ORDER,
} from './data/vehicleJourney'

import type {
  VehicleJourneyKey,
} from './data/vehicleJourney'

import {
  VehicleBody,
} from './VehicleBody'


const SPEED = 2.4
const TURN_RESPONSE = 5

const PAUSE_BY_DESTINATION:
  Partial<Record<VehicleJourneyKey, number>> = {
    finalControl: 3.5,
    validation: 2.5,
    releaseGate: 1.4,
    parkingBay: 4,
  }


const routePoints =
  VEHICLE_JOURNEY_ORDER.map(
    (key) =>
      VEHICLE_JOURNEY[key],
  )


function lerp(
  start: number,
  end: number,
  amount: number,
) {
  return (
    start +
    (end - start) * amount
  )
}


function lerpAngle(
  start: number,
  end: number,
  amount: number,
) {
  let difference =
    end - start

  while (
    difference > Math.PI
  ) {
    difference -=
      Math.PI * 2
  }

  while (
    difference < -Math.PI
  ) {
    difference +=
      Math.PI * 2
  }

  return (
    start +
    difference * amount
  )
}


function getSegmentLength(
  index: number,
) {
  const start =
    routePoints[index]

  const end =
    routePoints[index + 1]

  const dx =
    end.position[0] -
    start.position[0]

  const dz =
    end.position[2] -
    start.position[2]

  return Math.sqrt(
    dx * dx +
    dz * dz,
  )
}


function getMovementRotation(
  index: number,
) {
  const start =
    routePoints[index]

  const end =
    routePoints[index + 1]

  const dx =
    end.position[0] -
    start.position[0]

  const dz =
    end.position[2] -
    start.position[2]

  return Math.atan2(
    -dz,
    dx,
  )
}


function smoothStep(
  value: number,
) {
  const clamped =
    Math.max(
      0,
      Math.min(1, value),
    )

  return (
    clamped *
    clamped *
    (3 - 2 * clamped)
  )
}


export function AnimatedFinishedVehicle() {
  const vehicle =
    useRef<Group>(null)

  const segmentIndex =
    useRef(0)

  const segmentDistance =
    useRef(0)

  const pauseRemaining =
    useRef(0)


  function resetJourney() {
    const start =
      VEHICLE_JOURNEY.lowered

    segmentIndex.current = 0
    segmentDistance.current = 0
    pauseRemaining.current = 0

    if (!vehicle.current) {
      return
    }

    vehicle.current.position.set(
      ...start.position,
    )

    vehicle.current.rotation.y =
      start.rotation
  }


  useFrame((_, delta) => {
    if (!vehicle.current) {
      return
    }


    if (
      pauseRemaining.current > 0
    ) {
      pauseRemaining.current -=
        delta

      if (
        pauseRemaining.current > 0
      ) {
        return
      }


      if (
        segmentIndex.current >=
        routePoints.length - 1
      ) {
        resetJourney()
        return
      }
    }


    const index =
      segmentIndex.current

    if (
      index >=
      routePoints.length - 1
    ) {
      return
    }


    const start =
      routePoints[index]

    const end =
      routePoints[index + 1]

    const segmentLength =
      getSegmentLength(index)


    segmentDistance.current =
      Math.min(
        segmentLength,
        segmentDistance.current +
          SPEED * delta,
      )


    const progress =
      segmentLength === 0
        ? 1
        : segmentDistance.current /
          segmentLength


    vehicle.current.position.set(
      lerp(
        start.position[0],
        end.position[0],
        progress,
      ),

      lerp(
        start.position[1],
        end.position[1],
        progress,
      ),

      lerp(
        start.position[2],
        end.position[2],
        progress,
      ),
    )


    const movementRotation =
      getMovementRotation(index)


    let desiredRotation =
      movementRotation


    const isParkingSegment =
      index ===
      routePoints.length - 2


    if (isParkingSegment) {
      const parkingTurn =
        smoothStep(
          (
            progress - 0.55
          ) / 0.45,
        )

      desiredRotation =
        lerpAngle(
          movementRotation,
          end.rotation,
          parkingTurn,
        )
    }


    const turnAmount =
      1 -
      Math.exp(
        -TURN_RESPONSE * delta,
      )


    vehicle.current.rotation.y =
      lerpAngle(
        vehicle.current.rotation.y,
        desiredRotation,
        turnAmount,
      )


    if (
      segmentDistance.current <
      segmentLength
    ) {
      return
    }


    const destinationKey =
      VEHICLE_JOURNEY_ORDER[
        index + 1
      ]


    vehicle.current.position.set(
      ...end.position,
    )


    segmentIndex.current += 1
    segmentDistance.current = 0


    const pause =
      PAUSE_BY_DESTINATION[
        destinationKey
      ] ?? 0


    if (pause > 0) {
      pauseRemaining.current =
        pause
    }
  })


  const start =
    VEHICLE_JOURNEY.lowered


  return (
    <group
      ref={vehicle}
      position={start.position}
      rotation-y={start.rotation}
    >
      <VehicleBody
        stage="finished"
        color="#eceee9"
      />
    </group>
  )
}