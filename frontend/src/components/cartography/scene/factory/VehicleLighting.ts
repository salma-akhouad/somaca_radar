export interface VehicleLightingState {
  /**
   * Front low-beam / dipped headlights.
   */
  headlights?: boolean

  /**
   * Rear braking lamps.
   */
  brakeLights?: boolean

  /**
   * Left turn indicator.
   */
  leftIndicator?: boolean

  /**
   * Right turn indicator.
   */
  rightIndicator?: boolean

  /**
   * Reverse lamps.
   */
  reverseLights?: boolean
}


export const VEHICLE_LIGHTS_OFF: VehicleLightingState = {
  headlights: false,
  brakeLights: false,
  leftIndicator: false,
  rightIndicator: false,
  reverseLights: false,
}