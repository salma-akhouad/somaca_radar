import type {
  MachineKind,
} from '../MachineVisuals'

import type {
  MachineStatus,
} from '../MachineStatus'

export interface MachineConfig {
  id: string
  kind: MachineKind
  status?: MachineStatus
}


export interface PoleConfig {
  id: string

  uet: UetId

  position: [
    number,
    number,
    number,
  ]

  rotation?: number

  machines: MachineConfig[]
}


export type UetId =
  | 'UET 1'
  | 'UET 2'
  | 'UET 3'
  | 'UET 4'


export interface UetLayoutConfig {
  id: UetId
  position: [number, number, number]
  width: number
  depth: number
}


export const UET_LAYOUT: Record<
  UetId,
  UetLayoutConfig
> = {
  'UET 1': {
    id: 'UET 1',
    position: [23.5, 0, 0],
    width: 10,
    depth: 29,
  },

  'UET 2': {
    id: 'UET 2',
    position: [0, 0, 23.5],
    width: 31,
    depth: 8,
  },

  'UET 3': {
    id: 'UET 3',
    position: [-23.5, 0, 0],
    width: 10,
    depth: 29,
  },

  'UET 4': {
    id: 'UET 4',
    position: [0, 0, -23.5],
    width: 31,
    depth: 8,
  },
}

/**
 * CARTOGRAPHIC PROTOTYPE
 *
 * 4 UETs × 6 poteaux per UET = 24 poteaux.
 *
 * The spatial coordinates are visualization decisions.
 *
 * Later, API data can replace the machine arrays without
 * changing the 3D component architecture.
 */
export const montagePoles: PoleConfig[] = [
  // =========================================================
  // UET 1
  // Identification / documentation / operator IT equipment
  // =========================================================

  {
    id: 'P-01',
    uet: 'UET 1',
    position: [23.5, 0, -12],
    rotation: -Math.PI / 2,
    machines: [
      { id: 'P01-PRN', kind: 'printer' },
      { id: 'P01-TAB', kind: 'tablet' },
    ],
  },

  {
    id: 'P-02',
    uet: 'UET 1',
    position: [23.5, 0, -7.2],
    rotation: -Math.PI / 2,
    machines: [
      { id: 'P02-SCN', kind: 'scanner' },
      { id: 'P02-PC', kind: 'pc' },
    ],
  },

  {
    id: 'P-03',
    uet: 'UET 1',
    position: [23.5, 0, -2.4],
    rotation: -Math.PI / 2,
    machines: [
      { id: 'P03-PRN', kind: 'printer' },
      { id: 'P03-PC', kind: 'pc' },
    ],
  },

  {
    id: 'P-04',
    uet: 'UET 1',
    position: [23.5, 0, 2.4],
    rotation: -Math.PI / 2,
    machines: [
      { id: 'P04-TAB', kind: 'tablet' },
      { id: 'P04-SCN', kind: 'scanner', status: 'warning' },
    ],
  },

  {
    id: 'P-05',
    uet: 'UET 1',
    position: [23.5, 0, 7.2],
    rotation: -Math.PI / 2,
    machines: [
      { id: 'P05-PRN', kind: 'printer' },
      { id: 'P05-TAB', kind: 'tablet' },
    ],
  },

  {
    id: 'P-06',
    uet: 'UET 1',
    position: [23.5, 0, 12],
    rotation: -Math.PI / 2,
    machines: [
      { id: 'P06-PC', kind: 'pc' },
      { id: 'P06-CAB', kind: 'control' },
    ],
  },


  // =========================================================
  // UET 2
  // Assembly / operator support / components
  // =========================================================

  {
    id: 'P-07',
    uet: 'UET 2',
    position: [-13.2, 0, 23.5],
    machines: [
      { id: 'P07-TAB', kind: 'tablet' },
      { id: 'P07-CAB', kind: 'control' },
    ],
  },

  {
    id: 'P-08',
    uet: 'UET 2',
    position: [-7.9, 0, 23.5],
    machines: [
      { id: 'P08-PC', kind: 'pc' },
      { id: 'P08-TAB', kind: 'tablet' },
    ],
  },

  {
    id: 'P-09',
    uet: 'UET 2',
    position: [-2.6, 0, 23.5],
    machines: [
      { id: 'P09-SCN', kind: 'scanner' },
      { id: 'P09-TAB', kind: 'tablet' },
    ],
  },

  {
    id: 'P-10',
    uet: 'UET 2',
    position: [2.6, 0, 23.5],
    machines: [
      { id: 'P10-CAB', kind: 'control' },
      { id: 'P10-PC', kind: 'pc' },
    ],
  },

  {
    id: 'P-11',
    uet: 'UET 2',
    position: [7.9, 0, 23.5],
    machines: [
      { id: 'P11-TAB', kind: 'tablet' },
      { id: 'P11-SCN', kind: 'scanner', status: 'offline' },
    ],
  },

  {
    id: 'P-12',
    uet: 'UET 2',
    position: [13.2, 0, 23.5],
    machines: [
      { id: 'P12-PC', kind: 'pc' },
      { id: 'P12-CAB', kind: 'control' },
    ],
  },


  // =========================================================
  // UET 3
  // Mechanical intervention / inspection / raised access
  // =========================================================

  {
    id: 'P-13',
    uet: 'UET 3',
    position: [-23.5, 0, 12],
    rotation: Math.PI / 2,
    machines: [
      { id: 'P13-DSP', kind: 'inspection' },
      { id: 'P13-TAB', kind: 'tablet' },
    ],
  },

  {
    id: 'P-14',
    uet: 'UET 3',
    position: [-23.5, 0, 7.2],
    rotation: Math.PI / 2,
    machines: [
      { id: 'P14-CAB', kind: 'control' },
      { id: 'P14-PC', kind: 'pc' },
    ],
  },

  {
    id: 'P-15',
    uet: 'UET 3',
    position: [-23.5, 0, 2.4],
    rotation: Math.PI / 2,
    machines: [
      { id: 'P15-DSP', kind: 'inspection' },
      { id: 'P15-SCN', kind: 'scanner' },
    ],
  },

  {
    id: 'P-16',
    uet: 'UET 3',
    position: [-23.5, 0, -2.4],
    rotation: Math.PI / 2,
    machines: [
      { id: 'P16-TAB', kind: 'tablet' },
      { id: 'P16-CAB', kind: 'control' },
    ],
  },

  {
    id: 'P-17',
    uet: 'UET 3',
    position: [-23.5, 0, -7.2],
    rotation: Math.PI / 2,
    machines: [
      { id: 'P17-DSP', kind: 'inspection', status: 'fault' },
      { id: 'P17-PC', kind: 'pc' },
    ],
  },

  {
    id: 'P-18',
    uet: 'UET 3',
    position: [-23.5, 0, -12],
    rotation: Math.PI / 2,
    machines: [
      { id: 'P18-CAB', kind: 'control' },
      { id: 'P18-TAB', kind: 'tablet' },
    ],
  },


  // =========================================================
  // UET 4
  // Final verification / IT checks / vehicle release
  // =========================================================

  {
    id: 'P-19',
    uet: 'UET 4',
    position: [-13.2, 0, -23.5],
    rotation: Math.PI,
    machines: [
      { id: 'P19-DSP', kind: 'inspection' },
      { id: 'P19-PC', kind: 'pc' },
    ],
  },

  {
    id: 'P-20',
    uet: 'UET 4',
    position: [-7.9, 0, -23.5],
    rotation: Math.PI,
    machines: [
      { id: 'P20-SCN', kind: 'scanner' },
      { id: 'P20-TAB', kind: 'tablet' },
    ],
  },

  {
    id: 'P-21',
    uet: 'UET 4',
    position: [-2.6, 0, -23.5],
    rotation: Math.PI,
    machines: [
      { id: 'P21-PRN', kind: 'printer' },
      { id: 'P21-PC', kind: 'pc' },
    ],
  },

  {
    id: 'P-22',
    uet: 'UET 4',
    position: [2.6, 0, -23.5],
    rotation: Math.PI,
    machines: [
      { id: 'P22-DSP', kind: 'inspection' },
      { id: 'P22-CAB', kind: 'control' },
    ],
  },

  {
    id: 'P-23',
    uet: 'UET 4',
    position: [7.9, 0, -23.5],
    rotation: Math.PI,
    machines: [
      { id: 'P23-TAB', kind: 'tablet', status: 'warning' },
      { id: 'P23-SCN', kind: 'scanner' },
    ],
  },

  {
    id: 'P-24',
    uet: 'UET 4',
    position: [13.2, 0, -23.5],
    rotation: Math.PI,
    machines: [
      { id: 'P24-DSP', kind: 'inspection' },
      { id: 'P24-PC', kind: 'pc' },
    ],
  },
]