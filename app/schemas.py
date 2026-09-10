from datetime import date, datetime
from enum import Enum
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from .models import ContactType, IncidentSeverity, IncidentStatus


# SQLAlchemy models represent persisted records; Pydantic schemas define
# the validated JSON contract exchanged through the API.


class MachineBase(BaseModel):
    nom_machine: str = Field(min_length=1, max_length=150)
    ip_address: str
    mac_address: str | None = None
    date_installation: date
    id_poteau: int


class MachineCreate(MachineBase):
    pass


class MachineUpdate(BaseModel):
    nom_machine: str | None = Field(default=None, min_length=1, max_length=150)
    ip_address: str | None = None
    mac_address: str | None = None
    date_installation: date | None = None
    id_poteau: int | None = None


class MachineOut(MachineBase):
    model_config = ConfigDict(from_attributes=True)

    id_machine: int
    actif: bool
    date_decommissionnement: datetime | None = None


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_role: int
    nom_role: str


class UtilisateurBase(BaseModel):
    nom: str = Field(min_length=1, max_length=100)
    prenom: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=150)
    id_role: int


class UtilisateurCreate(UtilisateurBase):
    mot_de_passe: str = Field(min_length=8, max_length=128)


class UtilisateurUpdate(BaseModel):
    nom: str | None = Field(default=None, min_length=1, max_length=100)
    prenom: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, min_length=3, max_length=150)
    id_role: int | None = None
    mot_de_passe: str | None = Field(default=None, min_length=8, max_length=128)


class UtilisateurOut(UtilisateurBase):
    model_config = ConfigDict(from_attributes=True)

    id_util: int
    actif: bool
    date_desactivation: datetime | None = None


class CurrentUserOut(UtilisateurOut):
    role: str
    notifications_read_at: datetime | None = None


class NotificationReadRequest(BaseModel):
    read_at: datetime | None = None


class NotificationReadOut(BaseModel):
    read_at: datetime


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_session: int
    date_creation: datetime
    date_expiration: datetime
    date_revocation: datetime | None = None
    id_util: int


class DepartementBase(BaseModel):
    nom_dep: str = Field(min_length=1, max_length=100)


class DepartementCreate(DepartementBase):
    pass


class DepartementUpdate(BaseModel):
    nom_dep: str | None = Field(default=None, min_length=1, max_length=100)


class DepartementOut(DepartementBase):
    model_config = ConfigDict(from_attributes=True)

    id_dep: int
    actif: bool


class UniteBase(BaseModel):
    nom_unite: str = Field(min_length=1, max_length=100)
    id_dep: int


class UniteCreate(UniteBase):
    pass


class UniteUpdate(BaseModel):
    nom_unite: str | None = Field(default=None, min_length=1, max_length=100)
    id_dep: int | None = None


class UniteOut(UniteBase):
    model_config = ConfigDict(from_attributes=True)

    id_unite: int
    actif: bool


class PoteauBase(BaseModel):
    nom_poteau: str = Field(min_length=1, max_length=100)
    id_unite: int


class PoteauCreate(PoteauBase):
    pass


class PoteauUpdate(BaseModel):
    nom_poteau: str | None = Field(default=None, min_length=1, max_length=100)
    id_unite: int | None = None


class PoteauOut(PoteauBase):
    model_config = ConfigDict(from_attributes=True)

    id_poteau: int
    actif: bool


class EtatOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_etat: int
    libelle_etat: str
    couleur: str


class StatutHistoriqueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_statut: int
    date_changement: datetime
    id_machine: int
    id_etat: int
    id_util: int | None = None
    id_incident: int | None = None


class CurrentStatusOut(BaseModel):
    id_statut: int
    date_changement: datetime
    id_incident: int | None = None
    etat: EtatOut


class MachineDetailOut(MachineOut):
    current_status: CurrentStatusOut | None = None


class MachineStateChangeCreate(BaseModel):
    id_etat: int
    id_incident: int | None = None


class LoginRequest(BaseModel):
    email: str
    mot_de_passe: str


class LoginResponse(BaseModel):
    authenticated: bool = True


class ConversationRole(str, Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"


class HelperContext(BaseModel):
    current_page: str | None = None
    current_machine_id: int | None = None


class HelperAskRequest(BaseModel):
    question: str = Field(min_length=1)
    conversation_id: UUID
    context: HelperContext = Field(default_factory=HelperContext)


class AnalysisIntent(str, Enum):
    SEARCH_INCIDENTS = "SEARCH_INCIDENTS"
    INCIDENT_STATISTICS = "INCIDENT_STATISTICS"
    RELEVANT_PREVIOUS_INCIDENTS = "RELEVANT_PREVIOUS_INCIDENTS"
    HISTORICAL_SUMMARY = "HISTORICAL_SUMMARY"
    EXTERNAL_SUPPORT_ANALYSIS = "EXTERNAL_SUPPORT_ANALYSIS"


class RoutingResult(BaseModel):
    intent: AnalysisIntent | None = None

    id_machine: int | None = None
    machine_name: str | None = None
    machine_ip: str | None = None
    machine_mac: str | None = None
    reference_incident_id: int | None = None
    status_filter: IncidentStatus | None = None
    severity_filter: IncidentSeverity | None = None
    date_from: date | None = None
    date_to: date | None = None
    time_period: Literal["day", "week", "month", "year"] | None = None
    problem_query: str | None = None
    has_confirmed_cause: bool | None = None
    has_applied_solution: bool | None = None

    poteau_name: str | None = None
    unite_name: str | None = None
    departement_name: str | None = None
    location_level: Literal["machine", "poteau", "unite", "departement"] | None = None

    contact_type: ContactType | None = None
    contacted_user_last_name: str | None = None
    contacted_user_email: str | None = None

    needs_clarification: bool = False
    clarification_question: str | None = None
    unsupported: bool = False
    unsupported_reason: str | None = None

    @model_validator(mode="after")
    def validate_routing_state(self) -> "RoutingResult":
        if (
            self.date_from is not None
            and self.date_to is not None
            and self.date_from > self.date_to
        ):
            raise ValueError("date_from cannot be later than date_to")

        if self.unsupported:
            if self.needs_clarification:
                raise ValueError(
                    "A request cannot be both unsupported and awaiting clarification"
                )
            if self.intent is not None:
                raise ValueError("An unsupported request must not have an intent")
            if not self.unsupported_reason or not self.unsupported_reason.strip():
                raise ValueError(
                    "unsupported_reason is required when unsupported is true"
                )
            if self.clarification_question is not None:
                raise ValueError(
                    "An unsupported request must not contain a clarification question"
                )
            return self

        if self.needs_clarification:
            if (
                not self.clarification_question
                or not self.clarification_question.strip()
            ):
                raise ValueError(
                    "clarification_question is required when needs_clarification is true"
                )
            if self.unsupported_reason is not None:
                raise ValueError(
                    "A clarification result must not contain an unsupported reason"
                )
            return self

        if self.intent is None:
            raise ValueError(
                "A supported request that needs no clarification must have an intent"
            )
        if self.clarification_question is not None:
            raise ValueError(
                "A completed routing result must not contain a clarification question"
            )
        if self.unsupported_reason is not None:
            raise ValueError("A supported request must not contain an unsupported reason")

        return self


class HelperResponseStatus(str, Enum):
    ANSWERED = "ANSWERED"
    CLARIFICATION_REQUIRED = "CLARIFICATION_REQUIRED"
    UNSUPPORTED_REQUEST = "UNSUPPORTED_REQUEST"
    ERROR = "ERROR"


class HelperAskResponse(BaseModel):
    status: HelperResponseStatus
    answer: str
    intent: AnalysisIntent | None = None
    facts: dict[str, Any] = Field(default_factory=dict)


class SomacaHelperMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_message: int
    conversation_id: UUID
    id_util: int
    role: ConversationRole
    content: str
    id_machine: int | None = None
    intent: AnalysisIntent | None = None
    facts: dict[str, Any] | None = None
    model_name: str | None = None
    date_creation: datetime


class HelperConversationSummaryOut(BaseModel):
    conversation_id: UUID
    preview: str
    message_count: int
    last_activity: datetime


class IncidentReportCreate(BaseModel):
    id_machine: int
    id_etat: int
    problem: str = Field(min_length=3, max_length=500)
    severity: IncidentSeverity


class IncidentUpdate(BaseModel):
    severity: IncidentSeverity | None = None
    severity_note: str | None = Field(default=None, max_length=2000)
    confirmed_cause: str | None = Field(default=None, min_length=1, max_length=4000)
    applied_solution: str | None = Field(default=None, min_length=1, max_length=4000)


class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus
    note: str | None = Field(default=None, max_length=2000)


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_incident: int
    id_machine: int
    problem: str
    severity: IncidentSeverity
    status: IncidentStatus
    confirmed_cause: str | None = None
    applied_solution: str | None = None
    created_at: datetime
    created_by_user_id: int


class ProblemReportOut(BaseModel):
    incident: IncidentOut
    machine_status: StatutHistoriqueOut


class IncidentPageOut(BaseModel):
    items: list[IncidentOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class IncidentPriorityItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_incident: int
    problem: str
    severity: IncidentSeverity
    status: IncidentStatus
    created_at: datetime


class IncidentSummaryOut(BaseModel):
    active_count: int
    critical_active_count: int
    waiting_count: int
    oldest_active: list[IncidentPriorityItemOut]


class IncidentStatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_status_change: int
    id_incident: int
    status: IncidentStatus
    changed_at: datetime
    changed_by_user_id: int
    note: str | None = None


class IncidentSeverityHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_severity_change: int
    id_incident: int
    old_severity: IncidentSeverity
    new_severity: IncidentSeverity
    changed_at: datetime
    changed_by_user_id: int
    note: str | None = None


class IncidentContactCreate(BaseModel):
    contact_type: ContactType
    id_util: int | None = None
    external_contact_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    @model_validator(mode="after")
    def validate_contact(self) -> "IncidentContactCreate":
        if self.contact_type == ContactType.TECHNICIEN:
            if self.id_util is None:
                raise ValueError("A technician contact must reference a user")
            if self.external_contact_name is not None:
                raise ValueError(
                    "A technician contact must not use an external contact name"
                )
        else:
            if self.id_util is not None:
                raise ValueError(
                    "An external contact must not reference an application user"
                )

            if (
                not self.external_contact_name
                or not self.external_contact_name.strip()
            ):
                raise ValueError(
                    "An external contact name is required"
                )

        return self


class IncidentContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_contact: int
    id_incident: int
    contact_type: ContactType
    id_util: int | None = None
    external_contact_name: str | None = None
    contacted_at: datetime


class TechnicianOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_util: int
    nom: str
    prenom: str
    email: str


class EtatUsineSummaryOut(BaseModel):
    total_machines: int
    operational: int
    attention: int
    critical: int
    unknown: int
    operational_health: float
    active_incidents: int
    critical_active_incidents: int


class EtatUsineTrendPointOut(BaseModel):
    date: date
    operational: int
    attention: int
    critical: int
    unknown: int
    operational_health: float
    active_incidents: int
    critical_active_incidents: int


class EtatUsineWatchedPoleOut(BaseModel):
    id_poteau: int
    nom_poteau: str
    id_unite: int
    nom_unite: str
    attention_machines: int
    critical_machines: int
    unknown_machines: int
    active_incidents: int
    critical_incidents: int
    major_incidents: int
    minor_incidents: int
    highest_severity: IncidentSeverity | None = None


class EtatUsineRecentChangeOut(BaseModel):
    id_statut: int
    changed_at: datetime
    id_machine: int
    machine_name: str
    id_poteau: int
    pole_name: str
    id_unite: int
    unite_name: str
    previous_state: str | None = None
    current_state: str
    id_incident: int | None = None


class EtatUsineOut(BaseModel):
    scope: str
    generated_at: datetime
    summary: EtatUsineSummaryOut
    trend: list[EtatUsineTrendPointOut]
    watched_poles: list[EtatUsineWatchedPoleOut]
    recent_changes: list[EtatUsineRecentChangeOut]
