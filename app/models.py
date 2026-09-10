

from datetime import date, datetime
from enum import Enum
from typing import Any
from uuid import UUID as PyUUID

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


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

    id_incident: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_machine: Mapped[int] = mapped_column(
        ForeignKey("machine.id_machine"),
        nullable=False,
        index=True,
    )
    problem: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    severity: Mapped[IncidentSeverity] = mapped_column(
        SQLEnum(
            IncidentSeverity,
            name="incident_severity",
            values_callable=lambda enum_class: [
                member.value
                for member in enum_class
            ],
        ),
        nullable=False,
    )
    status: Mapped[IncidentStatus] = mapped_column(
        SQLEnum(
            IncidentStatus,
            name="incident_status",
            values_callable=lambda enum_class: [
                member.value
                for member in enum_class
            ],
        ),
        nullable=False,
    )
    confirmed_cause: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    applied_solution: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("utilisateur.id_util"),
        nullable=False,
        index=True,
    )


class IncidentStatusHistory(Base):
    __tablename__ = "incident_status_history"

    id_status_change: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_incident: Mapped[int] = mapped_column(
        ForeignKey("incident.id_incident"),
        nullable=False,
        index=True,
    )
    status: Mapped[IncidentStatus] = mapped_column(
        SQLEnum(
            IncidentStatus,
            name="incident_status",
            create_type=False,
            values_callable=lambda enum_class: [
                member.value
                for member in enum_class
            ],
        ),
        nullable=False,
    )
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    changed_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("utilisateur.id_util"),
        nullable=False,
        index=True,
    )
    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


class IncidentSeverityHistory(Base):
    __tablename__ = "incident_severity_history"

    id_severity_change: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_incident: Mapped[int] = mapped_column(
        ForeignKey("incident.id_incident"),
        nullable=False,
        index=True,
    )
    old_severity: Mapped[IncidentSeverity] = mapped_column(
        SQLEnum(
            IncidentSeverity,
            name="incident_severity",
            create_type=False,
            values_callable=lambda enum_class: [
                member.value
                for member in enum_class
            ],
        ),
        nullable=False,
    )
    new_severity: Mapped[IncidentSeverity] = mapped_column(
        SQLEnum(
            IncidentSeverity,
            name="incident_severity",
            create_type=False,
            values_callable=lambda enum_class: [
                member.value
                for member in enum_class
            ],
        ),
        nullable=False,
    )
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    changed_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("utilisateur.id_util"),
        nullable=False,
        index=True,
    )
    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


class IncidentContact(Base):
    __tablename__ = "incident_contact"

    id_contact: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_incident: Mapped[int] = mapped_column(
        ForeignKey("incident.id_incident"),
        nullable=False,
        index=True,
    )
    contact_type: Mapped[ContactType] = mapped_column(
        SQLEnum(
            ContactType,
            name="incident_contact_type",
            values_callable=lambda enum_class: [
                member.value
                for member in enum_class
            ],
        ),
        nullable=False,
    )
    id_util: Mapped[int | None] = mapped_column(
        ForeignKey("utilisateur.id_util"),
        nullable=True,
        index=True,
    )
    external_contact_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )
    contacted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class Role(Base):
    __tablename__ = "role"

    id_role: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    nom_role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
    )

    utilisateurs: Mapped[list["Utilisateur"]] = relationship(
        back_populates="role",
    )

class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id_util: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    nom: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    prenom: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
    )
    mot_de_passe: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    id_role: Mapped[int] = mapped_column(
        ForeignKey("role.id_role"),
        nullable=False,
    )
    notifications_read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    actif: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )
    date_desactivation: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    role: Mapped[Role] = relationship(
        back_populates="utilisateurs",
    )


class Session(Base):
    __tablename__ = "session"

    id_session: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    token: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
    )
    date_creation: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )
    date_expiration: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )
    date_revocation: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
    id_util: Mapped[int] = mapped_column(
        ForeignKey("utilisateur.id_util"),
        nullable=False,
        index=True,
    )


class Departement(Base):
    __tablename__ = "departement"

    id_dep: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    nom_dep: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    actif: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )


class Unite(Base):
    __tablename__ = "unite"

    id_unite: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    nom_unite: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    id_dep: Mapped[int] = mapped_column(
        ForeignKey("departement.id_dep"),
        nullable=False,
    )
    actif: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )


class Poteau(Base):
    __tablename__ = "poteau"

    id_poteau: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    nom_poteau: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    id_unite: Mapped[int] = mapped_column(
        ForeignKey("unite.id_unite"),
        nullable=False,
    )
    actif: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )


class Etat(Base):
    __tablename__ = "etat"

    id_etat: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    libelle_etat: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
    )
    couleur: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )


class StatutHistorique(Base):
    __tablename__ = "statut_historique"

    # The current machine state is derived from the latest active history row.
    id_statut: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    date_changement: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    id_machine: Mapped[int] = mapped_column(
        ForeignKey("machine.id_machine"),
        nullable=False,
        index=True,
    )
    id_etat: Mapped[int] = mapped_column(
        ForeignKey("etat.id_etat"),
        nullable=False,
    )
    id_util: Mapped[int | None] = mapped_column(
        ForeignKey("utilisateur.id_util"),
        nullable=True,
        index=True,
    )
    id_incident: Mapped[int | None] = mapped_column(
        ForeignKey("incident.id_incident"),
        nullable=True,
        index=True,
    )
    date_suppression: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )


class SomacaHelperMessage(Base):
    __tablename__ = "somaca_helper_message"

    id_message: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    conversation_id: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    id_util: Mapped[int] = mapped_column(
        ForeignKey("utilisateur.id_util"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    id_machine: Mapped[int | None] = mapped_column(
        ForeignKey("machine.id_machine"),
        nullable=True,
        index=True,
    )
    intent: Mapped[str | None] = mapped_column(
        String(60),
        nullable=True,
    )
    facts: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    model_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    date_creation: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

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

    id_machine: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    nom_machine: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        unique=True,
        nullable=True,
    )
    mac_address: Mapped[str | None] = mapped_column(
        String(17),
        nullable=True,
    )
    date_installation: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )
    id_poteau: Mapped[int] = mapped_column(
        ForeignKey("poteau.id_poteau"),
        nullable=False,
    )
    actif: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )
    date_decommissionnement: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
