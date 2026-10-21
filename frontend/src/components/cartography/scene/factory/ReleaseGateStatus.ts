export type ReleaseGateStatus =
  | 'waiting'
  | 'approved'
  | 'blocked'

export const RELEASE_GATE_COLORS: Record<
  ReleaseGateStatus,
  {
    green: string
    amber: string
    red: string
  }
> = {
  waiting: {
    green: '#46534a',
    amber: '#b99233',
    red: '#523d39',
  },

  approved: {
    green: '#6fa775',
    amber: '#594c31',
    red: '#493936',
  },

  blocked: {
    green: '#3f4a42',
    amber: '#564a32',
    red: '#a34d45',
  },
}