import type {
  VehicleLightingState,
} from './VehicleLighting'


export type FinalControlPhase =
  | 'headlights'
  | 'left-indicator'
  | 'right-indicator'
  | 'brakes'
  | 'complete'


export const FINAL_CONTROL_LIGHTING: Record<
  FinalControlPhase,
  VehicleLightingState
> = {
  headlights: {
    headlights: true,
    brakeLights: false,
    leftIndicator: false,
    rightIndicator: false,
    reverseLights: false,
  },

  'left-indicator': {
    headlights: false,
    brakeLights: false,
    leftIndicator: true,
    rightIndicator: false,
    reverseLights: false,
  },

  'right-indicator': {
    headlights: false,
    brakeLights: false,
    leftIndicator: false,
    rightIndicator: true,
    reverseLights: false,
  },

  brakes: {
    headlights: false,
    brakeLights: true,
    leftIndicator: false,
    rightIndicator: false,
    reverseLights: false,
  },

  complete: {
    headlights: true,
    brakeLights: true,
    leftIndicator: true,
    rightIndicator: true,
    reverseLights: false,
  },
}