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
      -18.2,
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
      40.5,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  /*
   * Slow point before entering
   * the parking manoeuvre.
   */
  parkingAisle: {
    position: [
      42,
      0.02,
      -19,
    ],

    rotation: 0,
  },


  /*
   * Quarter-turn approximated by several
   * short points instead of rotating a
   * four-metre vehicle within 0.65 m.
   */
  parkingTurnA: {
    position: [
      42.75,
      0.02,
      -18.85,
    ],

    rotation:
      -Math.PI / 8,
  },


  parkingTurnB: {
    position: [
      43.4,
      0.02,
      -18.4,
    ],

    rotation:
      -Math.PI / 4,
  },


  parkingTurnC: {
    position: [
      43.85,
      0.02,
      -17.75,
    ],

    rotation:
      -3 * Math.PI / 8,
  },


  parkingAlign: {
    position: [
      44,
      0.02,
      -17,
    ],

    rotation:
      -Math.PI / 2,
  },


  parkingBay: {
    position: [
      44,
      0.02,
      -16.75,
    ],

    rotation:
      -Math.PI / 2,
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
    'parkingTurnC',
    'parkingAlign',
    'parkingBay',
  ]


export const VEHICLE_JOURNEY_SEGMENTS = [
  {
    from: 'lowered',
    to: 'handoffStraight',
    kind: 'straight',
  },

  {
    from: 'handoffStraight',
    to: 'finalControlEntry',
    kind: 'turn',
  },

  {
    from: 'finalControlEntry',
    to: 'finalControl',
    kind: 'straight',
  },

  {
    from: 'finalControl',
    to: 'validationEntry',
    kind: 'straight',
  },

  {
    from: 'validationEntry',
    to: 'validation',
    kind: 'straight',
  },

  {
    from: 'validation',
    to: 'validationExit',
    kind: 'straight',
  },

  {
    from: 'validationExit',
    to: 'releaseGate',
    kind: 'straight',
  },

  {
    from: 'releaseGate',
    to: 'parkingApproach',
    kind: 'straight',
  },

  {
    from: 'parkingApproach',
    to: 'parkingAisle',
    kind: 'straight',
  },

  {
    from: 'parkingAisle',
    to: 'parkingTurnA',
    kind: 'turn',
  },

  {
    from: 'parkingTurnA',
    to: 'parkingTurnB',
    kind: 'turn',
  },

  {
    from: 'parkingTurnB',
    to: 'parkingTurnC',
    kind: 'turn',
  },

  {
    from: 'parkingTurnC',
    to: 'parkingAlign',
    kind: 'turn',
  },

  {
    from: 'parkingAlign',
    to: 'parkingBay',
    kind: 'straight',
  },
] satisfies Array<{
  from: VehicleJourneyKey
  to: VehicleJourneyKey

  kind:
    | 'straight'
    | 'turn'
}>