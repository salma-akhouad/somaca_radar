from sqlalchemy import UUID, Column, Integer, String, Date, DateTime, ForeignKey, Text, Index, Enum as SQLEnum, func
from .database import Base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from enum import Enum

# SQLAlchemy model : describes how data is stored in the database,
# It does not directly interface with frontend JSON. 

class IncidentStatus(str, Enum):
    OUVERT = "ouvert"
    EN_COURS = "en_cours"
    EN_ATTENTE = "en_attente"
    RESOLU = "resolu"
    FERME = "ferme"
    ANNULE = "annule"

class IncidentSeverity(str, Enum):
    MINEUR = "mineur"
    MAJEUR = "majeur"
    CRITIQUE = "critique"

class ContactType(str, Enum):
    TECHNICIEN = "technicien"
    RENAULT = "renault"
    AUTRE = "autre"


class Incident(Base):
    __tablename__ = "incident"
    id_incident = Column(Integer, primary_key=True)
    id_machine = Column(
        Integer,
        ForeignKey("machine.id_machine"),
        nullable=False,
        index=True,
    )
    problem = Column(
        Text,
        nullable=False,
    )
    severity = Column(
        SQLEnum(
            IncidentSeverity,
            name="incident_severity",
            # This Python enum maps to the PostgreSQL enum type 
            # that already exists under the name incident_status.
            values_callable=lambda enum_class: [
            member.value for member in enum_class
        ], # this line converts the enum members to their string values for storage in the database
        ),
        nullable=False,
    )
    status = Column(
        SQLEnum(
            IncidentStatus,
            name="incident_status",
            values_callable=lambda enum_class: [
            member.value for member in enum_class
        ],
        ),
        nullable=False,
    )
    confirmed_cause = Column(
        Text,
        nullable=True,
    )
    applied_solution = Column(
        Text,
        nullable=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    created_by_user_id = Column(
        Integer,
        ForeignKey("utilisateur.id_util"),
        nullable=False,
        index=True,
    )


class IncidentStatusHistory(Base):
    __tablename__ = "incident_status_history"
    id_status_change = Column(
        Integer,
        primary_key=True,
    )
    id_incident = Column(
        Integer,
        ForeignKey("incident.id_incident"),
        nullable=False,
        index=True,
    )
    status = Column(
        SQLEnum(
            IncidentStatus,
            name="incident_status",
            create_type=False, # do not create a new enum type in the database, use the existing one
            values_callable=lambda enum_class: [
            member.value for member in enum_class
        ],
        ),
        nullable=False,
    )
    changed_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    changed_by_user_id = Column(
        Integer,
        ForeignKey("utilisateur.id_util"),
        nullable=False,
        index=True,
    )


class IncidentContact(Base):
    __tablename__ = "incident_contact"
    id_contact = Column(
        Integer,
        primary_key=True,
    )
    id_incident = Column(
        Integer,
        ForeignKey("incident.id_incident"),
        nullable=False,
        index=True,
    )
    contact_type = Column(
        SQLEnum(
            ContactType,
            name="incident_contact_type",
            values_callable=lambda enum_class: [
            member.value for member in enum_class
        ],
        ),
        nullable=False,
    )
    id_util = Column(
        Integer,
        ForeignKey("utilisateur.id_util"),
        nullable=True,
        index=True,
    )
    external_contact_name = Column(
        String(150),
        nullable=True,
    )
    contacted_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(), 
    )

    
class Role(Base):
    __tablename__ = "role"
    id_role = Column(Integer, primary_key=True)
    nom_role = Column(String)

class Utilisateur(Base): # Base means that this class is a SQLAlchemy model, and it will be mapped to a table in the database.
    __tablename__ = "utilisateur"
    id_util = Column(Integer, primary_key=True)
    nom = Column(String)
    prenom = Column(String)
    email = Column(String, unique=True)
    mot_de_passe = Column(String)
    id_role = Column(Integer, ForeignKey("role.id_role"))
    role = relationship("Role")
    notifications_read_at = Column(DateTime(timezone=True),nullable=True)

class Session(Base):
    __tablename__ = "session"
    id_session = Column(Integer, primary_key=True)
    token = Column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
    )
    date_creation = Column(DateTime)
    date_expiration = Column(DateTime)
    date_revocation = Column(DateTime, nullable=True)
    id_util = Column(Integer, ForeignKey("utilisateur.id_util"), index=True)

class Departement(Base):
    __tablename__ = "departement"
    id_dep = Column(Integer, primary_key=True)
    nom_dep = Column(String)

class Unite(Base):
    __tablename__ = "unite"
    id_unite = Column(Integer, primary_key=True)
    nom_unite = Column(String)
    id_dep = Column(Integer, ForeignKey("departement.id_dep"))

class Poteau(Base):
    __tablename__ = "poteau"
    id_poteau = Column(Integer, primary_key=True)
    nom_poteau = Column(String)
    id_unite = Column(Integer, ForeignKey("unite.id_unite"))

class Etat(Base):
    __tablename__ = "etat"
    id_etat = Column(Integer, primary_key=True)
    libelle_etat = Column(String)
    couleur = Column(String)

# It records machine health-state changes (not full incident management).
class StatutHistorique(Base):
    __tablename__ = "statut_historique"
    id_statut = Column(Integer, primary_key=True)
    date_changement = Column(DateTime)
    description_probleme = Column(Text, nullable=True)
    id_machine = Column(Integer, ForeignKey("machine.id_machine"), index=True)
    id_etat = Column(Integer, ForeignKey("etat.id_etat"))
    id_util = Column(Integer, ForeignKey("utilisateur.id_util"), nullable=True, index=True)
    date_suppression = Column(DateTime, nullable=True)  # soft delete marker

class SomacaHelperMessage(Base):
    __tablename__ = "somaca_helper_message"
    id_message = Column(Integer, primary_key=True) # identifies one message
    conversation_id = Column(UUID(as_uuid=True), nullable=False)# groups several messages into one conversation 
    id_util = Column(Integer, ForeignKey("utilisateur.id_util"), nullable=False)
    role = Column( String(10), nullable=False) # USER or ASSISTANT.
    content = Column(Text, nullable=False) # Text means a large amount of text
    id_machine = Column(Integer, ForeignKey("machine.id_machine"), index=True)
    intent = Column(String(60)) # Intent means the purpose or goal of the message
    facts = Column(JSONB) # JSONB means a JSON object that can be queried and indexed in PostgreSQL
    model_name = Column(String(100))
    date_creation = Column(DateTime(timezone=True), nullable=False,  server_default=func.now())

    __table_args__ = (
        Index(
            "idx_helper_conversation_user_date",
            "conversation_id",
            "id_util",
            "date_creation",
        ),
        Index(
        "idx_helper_user_conversation_date",
        "id_util",
        "conversation_id",
        "date_creation",
    ),
    )
class Machine(Base):
    __tablename__ = "machine"
    id_machine = Column(Integer, primary_key=True)
    nom_machine = Column(String)
    ip_address = Column(String, unique=True) 
    mac_address = Column(String)
    date_installation = Column(Date)
    id_poteau = Column(Integer, ForeignKey("poteau.id_poteau"))

