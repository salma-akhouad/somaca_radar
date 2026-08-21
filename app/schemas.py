from pydantic import BaseModel, Field, model_validator
""" 
    BaseModel is Pydantic's parent class. By inheriting from it, our classes gains Pydantic features:
    validation;
    conversion;
    JSON generation;
    Swagger documentation;
    methods such as model_dump() and model_validate(). 
"""
from datetime import date, datetime
from typing import Any, Optional, Literal
from enum import Enum 
from uuid import UUID 
from .models import IncidentStatus, IncidentSeverity, ContactType
# Universally Unique Identifier, a 128-bit number used to uniquely identify information in computer systems. In this context, it's used to uniquely identify a conversation in the SomacaHelper system.

# Pydantic schema : describes how data is allowed to enter or leave the API,
# Itinteracts directly with the frontend and JSON, serving as the bridge for data validation, serialization, and API documentation

class MachineBase(BaseModel):
    nom_machine: str
    ip_address: str
    mac_address: Optional[str] = None
    date_installation: date
    id_poteau: int

class MachineCreate(MachineBase):
    pass

class MachineUpdate(BaseModel):
    nom_machine: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    date_installation: Optional[date] = None
    id_poteau: Optional[int] = None

class MachineOut(MachineBase):
    id_machine: int
    class Config:
        from_attributes = True # This line tells Pydantic to read the data from the attributes of the SQLAlchemy model instance, rather than expecting a dictionary.
class RoleBase(BaseModel):
    nom_role: str

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    nom_role: Optional[str] = None

class RoleOut(RoleBase):
    id_role: int
    class Config:
        from_attributes = True


class UtilisateurBase(BaseModel):
    nom: str
    prenom: str
    email: str
    id_role: int

class UtilisateurCreate(UtilisateurBase):
    mot_de_passe: str

class UtilisateurUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    id_role: Optional[int] = None
    mot_de_passe: Optional[str] = None

class UtilisateurOut(UtilisateurBase):
    id_util: int
    class Config:
        from_attributes = True


class SessionBase(BaseModel):
    date_creation: datetime
    date_expiration: datetime
    id_util: int

class SessionCreate(SessionBase):
     token: str

class SessionUpdate(BaseModel):
    date_creation: Optional[datetime] = None
    date_expiration: Optional[datetime] = None
    id_util: Optional[int] = None
    token: Optional[str] = None

class SessionOut(SessionBase):
    id_session: int
    class Config:
        from_attributes = True


class DepartementBase(BaseModel):
    nom_dep: str    

class DepartementCreate(DepartementBase):
    pass

class DepartementUpdate(BaseModel):
    nom_dep: Optional[str] = None

class DepartementOut(DepartementBase):
    id_dep: int
    class Config:
        from_attributes = True


class UniteBase(BaseModel):
    nom_unite: str
    id_dep: int

class UniteCreate(UniteBase):
    pass

class UniteUpdate(BaseModel):
    nom_unite: Optional[str] = None
    id_dep: Optional[int] = None

class UniteOut(UniteBase):
    id_unite: int
    class Config:
        from_attributes = True


class PoteauBase(BaseModel):   
    nom_poteau: str
    id_unite: int    

class PoteauCreate(PoteauBase):
    pass

class PoteauUpdate(BaseModel):
    nom_poteau: Optional[str] = None
    id_unite: Optional[int] = None

class PoteauOut(PoteauBase):
    id_poteau: int
    class Config:
        from_attributes = True


class EtatBase(BaseModel):
    libelle_etat: str
    couleur: str

class EtatCreate(EtatBase):
    pass    

class EtatUpdate(BaseModel):
    libelle_etat: Optional[str] = None
    couleur: Optional[str] = None

class EtatOut(EtatBase):
    id_etat: int
    class Config:
        from_attributes = True


class StatutHistoriqueBase(BaseModel):
    description_probleme: Optional[str] = None
    id_machine: int
    id_etat: int
    id_util: Optional[int] = None

class StatutHistoriqueCreate(StatutHistoriqueBase):
    pass


class StatutHistoriqueUpdate(BaseModel):
    date_changement: Optional[datetime] = None
    description_probleme: Optional[str] = None
    id_machine: Optional[int] = None
    id_etat: Optional[int] = None
    id_util: Optional[int] = None

class StatutHistoriqueOut(StatutHistoriqueBase):
    id_statut: int
    date_changement: datetime
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    mot_de_passe: str
    
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentStatusOut(BaseModel):
    id_statut: int
    date_changement: datetime
    description_probleme: Optional[str] = None
    etat: EtatOut
    class Config:
     from_attributes = True # When building this schema from an object, read object.field_name

class MachineDetailOut(MachineOut):
    current_status: Optional[CurrentStatusOut] = None


class ConversationRole(str, Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"

class HelperContext(BaseModel):
    current_page: str | None = None
    current_machine_id: int | None = None

# API Contract Design of somaca_helper endpoint that is sent to the LLM for processing. It includes the question, conversation ID, and context.
class HelperAskRequest(BaseModel):
    question: str = Field(min_length=1)
    conversation_id: UUID  # which existing discussion this new message continues
    context: HelperContext = Field(default_factory=HelperContext) # default_factory is used to create a new instance of HelperContext for each HelperAskRequest, ensuring that each request has its own context object.

# Intent routing
class AnalysisIntent(str, Enum):
    SEARCH_INCIDENTS = "SEARCH_INCIDENTS"
    INCIDENT_STATISTICS = "INCIDENT_STATISTICS"
    RELEVANT_PREVIOUS_INCIDENTS = "RELEVANT_PREVIOUS_INCIDENTS"
    HISTORICAL_SUMMARY = "HISTORICAL_SUMMARY"
    EXTERNAL_SUPPORT_ANALYSIS = "EXTERNAL_SUPPORT_ANALYSIS"

# It's an internal translation of the user’s natural-language question: it is returned by the LLM
class RoutingResult(BaseModel): 
    # The model_config attribute is used to configure the behavior of the Pydantic model. In this case, extra="forbid" means that any extra fields not defined in the model will raise a validation error. 
    # This ensures that only the expected fields are present in the input data.
    intent: AnalysisIntent | None = None
    # Parameters extracted from the question.
    
    # Incident/ Machine filters
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

    # Location filters
    poteau_name: str | None = None
    unite_name: str | None = None
    departement_name: str | None = None
    location_level: Literal["machine", "poteau", "unite", "departement"] | None = None

    # Contact filters
    contact_type: ContactType | None = None
    contacted_user_last_name: str | None = None
    contacted_user_email: str | None = None

    # Clarification and unsupported request handling
    needs_clarification: bool = False 
    clarification_question: str | None = None

    # Used when the request is outside SomacaHelper's scope.
    unsupported: bool = False
    unsupported_reason: str | None = None

    @model_validator(mode="after")
    def validate_routing_state(self) -> "RoutingResult": 
        # RoutingResult is with quotes because the class is not fully defined yet when this method is being defined. 
        # This is a forward reference, allowing the method to refer to the class itself before it is fully constructed.
        if (
            self.date_from is not None
            and self.date_to is not None
            and self.date_from > self.date_to
        ):
            raise ValueError(
                "date_from cannot be later than date_to"
            )

        if self.unsupported:
            if self.needs_clarification:
                raise ValueError(
                    "A request cannot be both unsupported "
                    "and awaiting clarification"
                )

            if self.intent is not None:
                raise ValueError(
                    "An unsupported request must not have an intent"
                )

            if not self.unsupported_reason or not self.unsupported_reason.strip():
                raise ValueError(
                    "unsupported_reason is required "
                    "when unsupported is true"
                )

            if self.clarification_question is not None:
                raise ValueError(
                    "An unsupported request must not contain "
                    "a clarification question"
                )

            return self

        if self.needs_clarification:
            if (
                not self.clarification_question
                or not self.clarification_question.strip()
            ):
                raise ValueError(
                    "clarification_question is required "
                    "when needs_clarification is true"
                )

            if self.unsupported_reason is not None:
                raise ValueError(
                    "A clarification result must not contain "
                    "an unsupported reason"
                )

            return self

        if self.intent is None:
            raise ValueError(
                "A supported request that needs no clarification "
                "must have an intent"
            )

        if self.clarification_question is not None:
            raise ValueError(
                "A completed routing result must not contain "
                "a clarification question"
            )

        if self.unsupported_reason is not None:
            raise ValueError(
                "A supported request must not contain "
                "an unsupported reason"
            )
        
        return self
    
class HelperResponseStatus(str, Enum):
    ANSWERED = "ANSWERED"
    CLARIFICATION_REQUIRED = "CLARIFICATION_REQUIRED"
    UNSUPPORTED_REQUEST = "UNSUPPORTED_REQUEST"
    ERROR = "ERROR"

# what the API returns to the user after processing the question. It includes the status, answer, and any extracted facts.
class HelperAskResponse(BaseModel):
    status: HelperResponseStatus
    answer: str
    intent: AnalysisIntent | None = None
    facts: dict[str, Any] = Field(default_factory=dict)

# Schema for representing a message in the SomacaHelper system
class SomacaHelperMessageOut(BaseModel):
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

    class Config:
        from_attributes = True

class HelperConversationSummaryOut(BaseModel):
    conversation_id: UUID
    preview: str
    message_count: int
    last_activity: datetime


# Incidents 
class IncidentCreate(BaseModel):
    id_machine: int
    problem: str
    severity: IncidentSeverity

class IncidentUpdate(BaseModel):
    problem: str | None = Field(default=None, min_length=1)
    severity: IncidentSeverity | None = None
    confirmed_cause: str | None = None
    applied_solution: str | None = None

class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus

class IncidentOut(BaseModel):
    id_incident: int
    id_machine: int
    problem: str
    severity: IncidentSeverity
    status: IncidentStatus
    confirmed_cause: str | None = None
    applied_solution: str | None = None
    created_at: datetime
    created_by_user_id: int
    class Config:
            from_attributes = True

class IncidentStatusHistoryOut(BaseModel):
    id_status_change: int
    id_incident: int
    status: IncidentStatus
    changed_at: datetime
    changed_by_user_id: int
    class Config:
        from_attributes = True

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
                raise ValueError(
                    "A technician contact must reference a user"
                )

            if self.external_contact_name is not None:
                raise ValueError(
                    "A technician contact must not use an external contact name"
                )

        else:
            if self.id_util is not None:
                raise ValueError(
                    "An external contact must not reference an application user"
                )

        return self

class IncidentContactOut(BaseModel):
    id_contact: int
    id_incident: int
    contact_type: ContactType
    id_util: int | None = None
    external_contact_name: str | None = None
    contacted_at: datetime
    class Config:
            from_attributes = True

class TechnicianOut(BaseModel):
    id_util: int
    nom: str
    prenom: str

    class Config:
        from_attributes = True