export type MachineStatus =
  | 'online'
  | 'warning'
  | 'fault'
  | 'offline'

export const MACHINE_STATUS_COLORS: Record<
  MachineStatus,
  string
> = {
  online: '#6f9b76',
  warning: '#b69036',
  fault: '#9a4b43',
  offline: '#666b67',
}