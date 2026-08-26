export type VehicleJourneyPoint = {
  position: [number, number, number]
  rotation: number
}

export const VEHICLE_JOURNEY = {
  lowered: {
    position: [17, 0.02, -12.5],
    rotation: Math.PI / 2,
  },



  handoffStraight: {
    position: [17, 0.02, -18],
    rotation: Math.PI / 2,
  },

  finalControlEntry: {
    position: [18.5, 0.02, -19],
    rotation: 0,
  },

  finalControl: {
    position: [21, 0.02, -19],
    rotation: 0,
  },

  validationEntry: {
    position: [26, 0.02, -19],
    rotation: 0,
  },

  validation: {
    position: [30, 0.02, -19],
    rotation: 0,
  },

  validationExit: {
    position: [36, 0.02, -19],
    rotation: 0,
  },

  releaseGate: {
    position: [40, 0.02, -19],
    rotation: 0,
  },

  parkingApproach: {
    position: [44.2, 0.02, -17.25],
    rotation: -0.18,
  },

  parkingEntry: {
    position: [47, 0.02, -17],
    rotation: 0,
  },

  parkingBay: {
    position: [54, 0.02, -16.75],
    rotation: Math.PI / 2,
  },
} satisfies Record<
  string,
  VehicleJourneyPoint
>

export type VehicleJourneyKey =
  keyof typeof VEHICLE_JOURNEY

export const VEHICLE_JOURNEY_ORDER: VehicleJourneyKey[] = [
  'lowered',
  'handoffStraight',
  'finalControlEntry',
  'finalControl',
  'validationEntry',
  'validation',
  'validationExit',
  'releaseGate',
  'parkingApproach',
  'parkingEntry',
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
    kind: 'turn',
  },
  {
    from: 'parkingApproach',
    to: 'parkingEntry',
    kind: 'straight',
  },
  {
    from: 'parkingEntry',
    to: 'parkingBay',
    kind: 'turn',
  },
] satisfies Array<{
  from: VehicleJourneyKey
  to: VehicleJourneyKey
  kind: 'straight' | 'turn'
}>