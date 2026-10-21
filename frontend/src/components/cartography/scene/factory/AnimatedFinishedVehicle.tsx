import {
  useRef,
  useState,
} from 'react'

import {
  useFrame,
} from '@react-three/fiber'

import type {
  Group,
} from 'three'

import {
  sampleFinishedVehicleJourney,
} from './data/vehicleContinuity'

import {
  VehicleBody,
} from './VehicleBody'

import {
  FINAL_CONTROL_LIGHTING,
} from './FinalControlTest'

import type {
  FinalControlPhase,
} from './FinalControlTest'

import type {
  VehicleLightingState,
} from './VehicleLighting'

import {
  VEHICLE_LIGHTS_OFF,
} from './VehicleLighting'


const DRIVING_LIGHTS:
  VehicleLightingState = {
  ...VEHICLE_LIGHTS_OFF,

  headlights: true,
}


const BRAKING_LIGHTS:
  VehicleLightingState = {
  ...DRIVING_LIGHTS,

  brakeLights: true,
}


const PARKING_TURN_LIGHTS:
  VehicleLightingState = {
  ...DRIVING_LIGHTS,

  rightIndicator: true,
}


const REVERSING_LIGHTS:
  VehicleLightingState = {
  ...VEHICLE_LIGHTS_OFF,

  reverseLights: true,
}


function getFinalControlPhase(
  elapsed: number,
): FinalControlPhase {
  if (
    elapsed <
    1.2
  ) {
    return 'headlights'
  }


  if (
    elapsed <
    2.4
  ) {
    return 'left-indicator'
  }


  if (
    elapsed <
    3.6
  ) {
    return 'right-indicator'
  }


  if (
    elapsed <
    4.8
  ) {
    return 'brakes'
  }


  return 'complete'
}


function isParkingTurn(
  destination:
    string | null,
) {
  return (
    destination ===
      'parkingTurnA' ||
    destination ===
      'parkingTurnB' ||
    destination ===
      'parkingAlign'
  )
}


export function AnimatedFinishedVehicle() {
  const vehicle =
    useRef<Group>(null)


  const lightingKey =
    useRef(
      'off',
    )


  const [
    lights,
    setLights,
  ] =
    useState<VehicleLightingState>(
      VEHICLE_LIGHTS_OFF,
    )


  function applyLights(
    key: string,

    next:
      VehicleLightingState,
  ) {
    if (
      lightingKey.current ===
      key
    ) {
      return
    }


    lightingKey.current =
      key


    setLights(
      next,
    )
  }


  useFrame(
    (state) => {
      if (
        !vehicle.current
      ) {
        return
      }


      const sample =
        sampleFinishedVehicleJourney(
          state.clock.elapsedTime,
        )


      vehicle.current.visible =
        sample.visible


      if (
        !sample.visible
      ) {
        applyLights(
          'off',
          VEHICLE_LIGHTS_OFF,
        )

        return
      }


      vehicle.current.position.set(
        ...sample.position,
      )


      vehicle.current.rotation.y =
        sample.rotation


      if (
        sample.phase ===
        'parked'
      ) {
        applyLights(
          'parked',
          VEHICLE_LIGHTS_OFF,
        )

        return
      }


      if (
        sample.phase ===
          'paused' &&
        sample.destinationKey ===
          'finalControl'
      ) {
        const phase =
          getFinalControlPhase(
            sample.pauseElapsed,
          )


        applyLights(
          `final-${phase}`,

          FINAL_CONTROL_LIGHTING[
            phase
          ],
        )

        return
      }


      if (
        sample.phase ===
          'paused' &&
        sample.destinationKey ===
          'validation'
      ) {
        applyLights(
          'validation-brake',
          BRAKING_LIGHTS,
        )

        return
      }


      if (
        sample.phase ===
          'paused' &&
        sample.destinationKey ===
          'releaseGate'
      ) {
        applyLights(
          'release-brake',
          BRAKING_LIGHTS,
        )

        return
      }


      if (
        sample.destinationKey ===
        'parkingBay'
      ) {
        applyLights(
          'reverse',
          REVERSING_LIGHTS,
        )

        return
      }


      if (
        sample.destinationKey ===
          'parkingAisle' ||
        isParkingTurn(
          sample.destinationKey,
        )
      ) {
        applyLights(
          'parking-turn',
          PARKING_TURN_LIGHTS,
        )

        return
      }


      applyLights(
        'driving',
        DRIVING_LIGHTS,
      )
    },
  )


  return (
    <group
      ref={vehicle}
      visible={false}
    >
      <VehicleBody
        stage="finished"
        color="#eceee9"
        lights={lights}
      />
    </group>
  )
}