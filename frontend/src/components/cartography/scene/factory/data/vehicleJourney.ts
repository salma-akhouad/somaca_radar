export type VehicleJourneyPoint = {
  position: [
    number,
    number,
    number,
  ]

  rotation: number
}


export const VEHICLE_JOURNEY = {
  lowered: {
    position: [
      17,
      0.02,
      -12.5,
    ],

    rotation:
      Math.PI / 2,
  },


  handoffStraight: {
    position: [
      17,
      0.02,
      -18,
    ],

    rotation:
      Math.PI / 2,
  },


  finalControlEntry: {
    position: [
      18.7,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  finalControl: {
    position: [
      21,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  validationEntry: {
    position: [
      26,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  validation: {
    position: [
      30,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  validationExit: {
    position: [
      36,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  releaseGate: {
    position: [
      40,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  parkingApproach: {
    position: [
      41.5,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  /*
   * Slow down in the central parking aisle.
   */
  parkingAisle: {
    position: [
      43,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  /*
   * Real multi-point 90° manoeuvre.
   */
  parkingTurnA: {
    position: [
      44,
      0.02,
      -19.1,
    ],

    rotation:
      Math.PI / 6,
  },


  parkingTurnB: {
    position: [
      44.7,
      0.02,
      -19.7,
    ],

    rotation:
      Math.PI / 3,
  },


  /*
   * Vehicle now faces the same direction
   * as the static parked cars.
   */
  parkingAlign: {
    position: [
      44,
      0.02,
      -20.3,
    ],

    rotation:
      Math.PI / 2,
  },


  /*
   * Reverse into the reserved bay.
   *
   * Finished parking orientation therefore
   * matches the other vehicles.
   */
  parkingBay: {
    position: [
      44,
      0.02,
      -14.8,
    ],

    rotation:
      Math.PI / 2,
  },
} satisfies Record<
  string,
  VehicleJourneyPoint
>


export type VehicleJourneyKey =
  keyof typeof VEHICLE_JOURNEY


export const VEHICLE_JOURNEY_ORDER:
  VehicleJourneyKey[] = [
    'lowered',
    'handoffStraight',
    'finalControlEntry',
    'finalControl',
    'validationEntry',
    'validation',
    'validationExit',
    'releaseGate',
    'parkingApproach',
    'parkingAisle',
    'parkingTurnA',
    'parkingTurnB',
    'parkingAlign',
    'parkingBay',
  ]