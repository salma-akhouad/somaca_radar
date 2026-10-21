export type RoleName =
    | 'operateur_de_production'
    | 'superviseur'
    | 'technicien'
    | 'administrateur'

export interface CurrentUser {
    id_util: number
    nom: string
    prenom: string
    email: string
    id_role: number
    role: RoleName
    notifications_read_at: string | null
    actif?: boolean
    date_desactivation?: string | null
}

export interface LoginResponse {
    authenticated: boolean
}

export interface Machine {
    id_machine: number
    nom_machine: string
    type_machine: string
    ip_address: string
    mac_address: string | null
    date_installation: string
    id_poteau: number
    actif: boolean
    date_decommissionnement: string | null
}

export interface MachinePage {
    items: Machine[]
    total: number
    page: number
    page_size: number
    total_pages: number
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
    actif: boolean
    date_desactivation: string | null
}

export interface UserPage {
    items: User[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface NotificationReadResponse {
    read_at: string
}

export type SessionStatus =
    | 'active'
    | 'expired'
    | 'revoked'

export interface SessionRecord {
    id_session: number
    date_creation: string
    date_expiration: string
    date_revocation: string | null
    id_util: number
    user_email: string
    user_nom: string
    user_prenom: string
    status: SessionStatus
}

export interface SessionPage {
    items: SessionRecord[]
    next_cursor: string | null
    page_size: number
}

export interface Departement {
    id_dep: number
    nom_dep: string
    actif?: boolean
}

export interface Unite {
    id_unite: number
    nom_unite: string
    id_dep: number
    actif: boolean
    represente_carte: boolean
    date_creation: string
}

export interface Poteau {
    id_poteau: number
    nom_poteau: string
    id_unite: number
    actif: boolean
    represente_carte: boolean
    date_creation: string
}

export interface Etat {
    id_etat: number
    libelle_etat: string
    couleur: string
}

export interface StatutHistorique {
    id_statut: number
    date_changement: string
    id_machine: number
    id_etat: number
    id_util: number | null
    id_incident: number | null
    date_suppression: string | null
    id_util_suppression: number | null
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


export interface IncidentPage {
    items: Incident[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface IncidentPriorityItem {
    id_incident: number
    problem: string
    severity: IncidentSeverity
    status: IncidentStatus
    created_at: string
}

export interface IncidentSummary {
    active_count: number
    critical_active_count: number
    waiting_count: number
    oldest_active: IncidentPriorityItem[]
}

export interface IncidentHistory {
    id_status_change: number
    id_incident: number
    status: IncidentStatus
    changed_at: string
    changed_by_user_id: number
    note?: string | null
}

export interface IncidentSeverityHistory {
    id_severity_change: number
    id_incident: number
    old_severity: IncidentSeverity
    new_severity: IncidentSeverity
    changed_at: string
    changed_by_user_id: number
    note: string | null
}

export interface ProblemReport {
    incident: Incident
    machine_status: StatutHistorique
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
    email?: string
}

export interface IncidentActor {
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

export interface EtatUsineSummary {
    total_machines: number
    operational: number
    attention: number
    critical: number
    unknown: number
    operational_health: number
    active_incidents: number
    critical_active_incidents: number
}

export interface EtatUsineTrendPoint {
    date: string
    operational: number
    attention: number
    critical: number
    unknown: number
    operational_health: number
    active_incidents: number
    critical_active_incidents: number
}

export interface EtatUsineWatchedPole {
    id_poteau: number
    nom_poteau: string
    id_unite: number
    nom_unite: string
    attention_machines: number
    critical_machines: number
    unknown_machines: number
    active_incidents: number
    critical_incidents: number
    major_incidents: number
    minor_incidents: number
    highest_severity: IncidentSeverity | null
}

export interface EtatUsineRecentChange {
    id_statut: number
    changed_at: string
    id_machine: number
    machine_name: string
    machine_type: string
    id_poteau: number
    pole_name: string
    id_unite: number
    unite_name: string
    previous_state: string | null
    current_state: string
    id_incident: number | null
}

export interface EtatUsine {
    scope: string
    generated_at: string
    summary: EtatUsineSummary
    trend: EtatUsineTrendPoint[]
    watched_poles: EtatUsineWatchedPole[]
    recent_changes: EtatUsineRecentChange[]
}

export type AnalysisIntent =
    | 'CONVERSATIONAL'
    | 'MACHINE_STATE'
    | 'SEARCH_INCIDENTS'
    | 'INCIDENT_STATISTICS'
    | 'RELEVANT_PREVIOUS_INCIDENTS'
    | 'HISTORICAL_SUMMARY'
    | 'EXTERNAL_SUPPORT_ANALYSIS'

export type HelperResponseStatus =
    | 'ANSWERED'
    | 'CLARIFICATION_REQUIRED'
    | 'UNSUPPORTED_REQUEST'
    | 'ERROR'

export type HelperConversationRole =
    | 'USER'
    | 'ASSISTANT'

export type HelperLanguage =
    | 'fr'
    | 'en'
    | 'ar'

export type HelperErrorCode =
    | 'PROVIDER_UNAVAILABLE'
    | 'ANALYSIS_ERROR'
    | 'NETWORK_ERROR'
    | 'RATE_LIMIT'

export interface HelperContext {
    current_page: string | null
    current_pole_id: number | null
    current_machine_id: number | null
    preferred_language: HelperLanguage | null
}

export interface HelperAskPayload {
    question: string
    conversation_id: string
    context: HelperContext
}

export interface HelperAskResponse {
    status: HelperResponseStatus
    answer: string
    intent: AnalysisIntent | null
    facts: Record<string, unknown>
    error_code: HelperErrorCode | null
}

export interface SomacaHelperMessage {
    id_message: number
    conversation_id: string
    id_util: number
    role: HelperConversationRole
    content: string
    id_machine: number | null
    intent: AnalysisIntent | null
    facts: Record<string, unknown> | null
    model_name: string | null
    date_creation: string
}

export interface HelperConversationSummary {
    conversation_id: string
    preview: string
    message_count: number
    last_activity: string
}

export interface HelperConversationPage {
    items: HelperConversationSummary[]
    next_before_activity: string | null
    next_before_conversation_id: string | null
    has_more: boolean
}


export interface HelperMessagePage {
    items: SomacaHelperMessage[]
    next_before_id: number | null
    has_more: boolean
}