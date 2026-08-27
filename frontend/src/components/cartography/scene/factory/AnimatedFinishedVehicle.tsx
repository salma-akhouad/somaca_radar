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

import {
  VehicleBody,
} from './VehicleBody'


const SPEED = 2.4
const PARKING_PAUSE = 4


const routePoints =
  VEHICLE_JOURNEY_ORDER.map(
    (key) =>
      VEHICLE_JOURNEY[key],
  )


const segmentLengths =
  routePoints
    .slice(0, -1)
    .map((point, index) => {
      const next =
        routePoints[index + 1]

      const dx =
        next.position[0] -
        point.position[0]

      const dz =
        next.position[2] -
        point.position[2]

      return Math.sqrt(
        dx * dx +
        dz * dz,
      )
    })


const totalDistance =
  segmentLengths.reduce(
    (sum, length) =>
      sum + length,
    0,
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
    difference * amount
  )
}


export function AnimatedFinishedVehicle() {
  const vehicle =
    useRef<Group>(null)

  const travelledDistance =
    useRef(0)

  const parkingPause =
    useRef(0)


  useFrame((_, delta) => {
    if (!vehicle.current) {
      return
    }


    if (
      travelledDistance.current >=
      totalDistance
    ) {
      parkingPause.current +=
        delta

      if (
        parkingPause.current >=
        PARKING_PAUSE
      ) {
        travelledDistance.current = 0
        parkingPause.current = 0
      } else {
        return
      }
    }


    travelledDistance.current =
      Math.min(
        totalDistance,
        travelledDistance.current +
          SPEED * delta,
      )


    let remainingDistance =
      travelledDistance.current


    for (
      let index = 0;
      index <
      segmentLengths.length;
      index += 1
    ) {
      const segmentLength =
        segmentLengths[index]

      if (
        remainingDistance >
        segmentLength
      ) {
        remainingDistance -=
          segmentLength

        continue
      }


      const start =
        routePoints[index]

      const end =
        routePoints[index + 1]

      const progress =
        segmentLength === 0
          ? 1
          : remainingDistance /
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


      vehicle.current.rotation.y =
        lerpAngle(
          start.rotation,
          end.rotation,
          progress,
        )

      break
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