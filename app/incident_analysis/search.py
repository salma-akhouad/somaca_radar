from datetime import date, datetime, time, timedelta, timezone
from sqlalchemy import func 
from sqlalchemy.orm import Session
from ..models import (
    ContactType,
    Departement,
    Incident,
    IncidentContact,
    IncidentSeverity,
    IncidentStatus,
    Machine,
    Poteau,
    Unite,
    Utilisateur,
)

def _normalize_text(value: str) -> str:
    return value.strip().lower()

def search_incidents(
    db: Session,
    id_machine: int | None = None,
    status: IncidentStatus | None = None,
    severity: IncidentSeverity | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    problem_query: str | None = None,
    has_confirmed_cause: bool | None = None,
    has_applied_solution: bool | None = None,
    poteau_name: str | None = None,
    unite_name: str | None = None,
    departement_name: str | None = None,
    contact_type: ContactType | None = None,
    contacted_user_last_name: str | None = None,
    contacted_user_email: str | None = None,
) -> list[Incident]:
    """
    Query PostgreSQL for incidents matching filters extracted by SomacaHelper.
    """
    query = db.query(Incident)

    if id_machine is not None:
        query = query.filter(
            Incident.id_machine == id_machine
        )

    if status is not None:
        query = query.filter(
            Incident.status == status
        )

    if severity is not None:
        query = query.filter(
            Incident.severity == severity
        )

    if date_from is not None:
        start_datetime = datetime.combine(
            date_from,
            time.min,
            tzinfo=timezone.utc,
        )

        query = query.filter(
            Incident.created_at >= start_datetime
        )

    if date_to is not None:
        end_datetime = datetime.combine(
            date_to + timedelta(days=1),
            time.min,
            tzinfo=timezone.utc,
        )

        query = query.filter(
            Incident.created_at < end_datetime
        )

    if problem_query:
        query = query.filter(
            Incident.problem.ilike(
                f"%{problem_query.strip()}%"
            )
        )

    if has_confirmed_cause is True:
        query = query.filter(
            Incident.confirmed_cause.is_not(None),
            func.length(
                func.trim(Incident.confirmed_cause)
            ) > 0,
        )

    elif has_confirmed_cause is False:
        query = query.filter(
            (Incident.confirmed_cause.is_(None))
            | (
                func.length(
                    func.trim(Incident.confirmed_cause)
                ) == 0
            )
        )

    if has_applied_solution is True:
        query = query.filter(
            Incident.applied_solution.is_not(None),
            func.length(
                func.trim(Incident.applied_solution)
            ) > 0,
        )

    elif has_applied_solution is False:
        query = query.filter(
            (Incident.applied_solution.is_(None))
            | (
                func.length(
                    func.trim(Incident.applied_solution)
                ) == 0
            )
        )

    needs_location = any(
    value is not None
    for value in (
        poteau_name,
        unite_name,
        departement_name,
    )
    )

    # needs_location returns True if at least one of these conditions are provided, otherwise False.
    if needs_location:
        query = (
            query
            .join(
                Machine,
                Incident.id_machine == Machine.id_machine,
            )
            .join(
                Poteau,
                Machine.id_poteau == Poteau.id_poteau,
            )
        )

        if unite_name is not None or departement_name is not None:
            query = query.join(
                Unite,
                Poteau.id_unite == Unite.id_unite,
            )

        if departement_name is not None:
            query = query.join(
                Departement,
                Unite.id_dep == Departement.id_dep,
            )

    if poteau_name is not None:
        query = query.filter(
            func.lower(Poteau.nom_poteau)
            == _normalize_text(poteau_name)
        )

    if unite_name is not None:
        query = query.filter(
            func.lower(Unite.nom_unite)
            == _normalize_text(unite_name)
        )

    if departement_name is not None:
        query = query.filter(
            func.lower(Departement.nom_dep)
            == _normalize_text(departement_name)
        )

    needs_contact = (
        contact_type is not None
        or contacted_user_last_name is not None
        or contacted_user_email is not None
    )

    if needs_contact:
        query = query.join(
            IncidentContact,
            IncidentContact.id_incident == Incident.id_incident,
        )

    needs_contacted_user = (
        contacted_user_last_name is not None
        or contacted_user_email is not None
    )

    if needs_contacted_user:
        query = query.join(
            Utilisateur,
            IncidentContact.id_util == Utilisateur.id_util,
        )

    if contact_type is not None:
        query = query.filter(
            IncidentContact.contact_type == contact_type
    )

    if contacted_user_last_name is not None:
        query = query.filter(
            func.lower(Utilisateur.nom)
            == _normalize_text(contacted_user_last_name)
    )
    
    if contacted_user_email is not None:
        query = query.filter(
            func.lower(Utilisateur.email)
            == _normalize_text(contacted_user_email)
    )

    return (
        query
        .distinct()
        .order_by(
            Incident.created_at.desc(),
            Incident.id_incident.desc(),
        )
        .all()
    )