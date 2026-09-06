export type RoleName = 'administrateur' | 'technicien' | 'superviseur'

export interface CurrentUser {
  id_util: number
  nom: string
  prenom: string
  email: string
  id_role: number
  role: RoleName
  notifications_read_at: string | null
}

export interface LoginResponse {
  authenticated: boolean
}

export interface Machine {
  id_machine: number
  nom_machine: string
  ip_address: string
  mac_address: string | null
  date_installation: string
  id_poteau: number
}

export interface Role {
  id_role: number
  nom_role: string
}

export interface User {
  id_util: number
  nom: string
  prenom: string
  email: string
  id_role: number
}

export interface NotificationReadResponse {
  read_at: string
}

export interface SessionRecord {
  id_session: number
  date_creation: string
  date_expiration: string
  id_util: number
  date_revocation: string | null
}

export interface Departement {
  id_dep: number
  nom_dep: string
}

export interface Unite {
  id_unite: number
  nom_unite: string
  id_dep: number
}

export interface Poteau {
  id_poteau: number
  nom_poteau: string
  id_unite: number
}

export interface Etat {
  id_etat: number
  libelle_etat: string
  couleur: string
}

export interface StatutHistorique {
  id_statut: number
  date_changement: string
  description_probleme: string | null
  id_machine: number
  id_etat: number
  id_util: number | null
}

export type IncidentSeverity = 'mineur' | 'majeur' | 'critique'
export type IncidentStatus =
  | 'ouvert'
  | 'en_cours'
  | 'en_attente'
  | 'resolu'
  | 'ferme'
  | 'annule'

export interface Incident {
  id_incident: number
  id_machine: number
  problem: string
  severity: IncidentSeverity
  status: IncidentStatus
  confirmed_cause: string | null
  applied_solution: string | null
  created_at: string
  created_by_user_id: number
}

export interface IncidentHistory {
  id_status_change: number
  id_incident: number
  status: IncidentStatus
  changed_at: string
  changed_by_user_id: number
}

export type ContactType = 'technicien' | 'renault' | 'autre'

export interface IncidentContact {
  id_contact: number
  id_incident: number
  contact_type: ContactType
  id_util: number | null
  external_contact_name: string | null
  contacted_at: string
}

export interface Technician {
  id_util: number
  nom: string
  prenom: string
}

export type PoleOperationalLevel =
  | 'operational'
  | 'alert'
  | 'critical'
  | 'stopped'

export interface PoleOperationalState {
  poleId: number
  poleName: string
  level: PoleOperationalLevel
  incidentId: number | null
  machineId: number | null
  message: string
}

export interface OperationsNotification {
  id: string
  level: Exclude<PoleOperationalLevel, 'operational'>
  severity: IncidentSeverity
  isUnread: boolean
  title: string
  description: string
  timestamp: string
  poleId: number | null
  poleName: string | null
  incidentId: number | null
  machineId: number | null
}
