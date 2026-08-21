from collections import Counter
from sqlalchemy.orm import Session
from typing import cast 
# cast() is a function that allows you to explicitly specify the expected type of a value, which can be useful for type checking and static analysis. It does not change the runtime behavior of the code; it is purely for type hinting purposes.
from .statistics import TimePeriod
from ..models import (
    ContactType,
    Incident,
    IncidentContact,
    IncidentStatus,
    Utilisateur,
)


def _incident_ids(incidents: list[Incident]) -> list[int]:
    return [
          cast(int, incident.id_incident)
        for incident in incidents
    ]


def count_by_contact_type(db: Session, incidents: list[Incident]) -> dict[str, int]:
    if not incidents:
        return {}

    rows = (
        db.query(IncidentContact.contact_type)
        .filter(
            IncidentContact.id_incident.in_(
                _incident_ids(incidents)
            )
        )
        .all()
    )

    return dict(
        Counter(
            row.contact_type.value
            for row in rows
        )
    )


def count_incidents_with_contacts(db: Session, incidents: list[Incident]) -> int:
    if not incidents:
        return 0

    return (
        db.query(IncidentContact.id_incident)
        .filter(
            IncidentContact.id_incident.in_(
                _incident_ids(incidents)
            )
        )
        .distinct()
        .count()
    )


# only for technician contacts, which are internal users
def count_contacted_users(db: Session, incidents: list[Incident]) -> list[dict]:
    if not incidents:
        return []

    rows = (
        db.query(
            Utilisateur.id_util,
            Utilisateur.nom,
            Utilisateur.prenom,
            Utilisateur.email,
        )
        .join(
            IncidentContact,
            IncidentContact.id_util == Utilisateur.id_util,
        )
        .filter(
            IncidentContact.id_incident.in_(
                _incident_ids(incidents)
            ),
            IncidentContact.contact_type == ContactType.TECHNICIEN,
        )
        .all()
    )

    counts = Counter(
        (
            row.id_util,
            row.nom,
            row.prenom,
            row.email,
        )
        for row in rows
    )

    return [
        {
            "id_util": id_util,
            "nom": nom,
            "prenom": prenom,
            "email": email,
            "count": count,
        }
        for (
            id_util,
            nom,
            prenom,
            email,
        ), count in counts.most_common()
    ]


def count_contacts_by_period(
    db: Session,
    incidents: list[Incident],
    period: TimePeriod,
) -> dict[str, dict[str, int]]:
    if not incidents:
        return {}

    rows = (
        db.query(
            IncidentContact.contacted_at,
            IncidentContact.contact_type,
        )
        .filter(
            IncidentContact.id_incident.in_(_incident_ids(incidents))
        )
        .all()
    )
   
    counts: dict[str, Counter] = {}

    for row in rows:
        if period == "week":
            period_key = (
                f"{row.contacted_at.isocalendar().year}-W"
                f"{row.contacted_at.isocalendar().week:02d}"
            )
        else:
            formats = {
                "day": "%Y-%m-%d",
                "month": "%Y-%m",
                "year": "%Y",
            }

            period_key = row.contacted_at.strftime(formats[period])

        if period_key not in counts:
            counts[period_key] = Counter()

        counts[period_key][row.contact_type.value] += 1
   
    return {
        period_key: dict(type_counts)
        for period_key, type_counts in sorted(counts.items())
    }


def get_resolved_incidents_by_contact_type(db: Session, incidents: list[Incident]) -> dict[str, dict]:
    if not incidents:
        return {}

    resolved_statuses = (
        IncidentStatus.RESOLU,
        IncidentStatus.FERME,
    )

    rows = (
        db.query(
            IncidentContact.id_incident,
            IncidentContact.contact_type,
            Incident.problem,
        )
        .join(
            Incident,
            Incident.id_incident == IncidentContact.id_incident,
        )
        .filter(
            IncidentContact.id_incident.in_(
                _incident_ids(incidents)
            ),
            Incident.status.in_(resolved_statuses),
        )
        .distinct()
        .all()
    )

    result: dict[str, dict] = {}
    
    for row in rows:
        contact_type_value = (row.contact_type.value)

        if contact_type_value not in result:
            result[contact_type_value] = {
                "count": 0,
                "incidents": [],
            }

        result[contact_type_value]["count"] += 1
        result[contact_type_value]["incidents"].append(
            {
                "id_incident": row.id_incident,
                "problem": row.problem,
            }
        )

    return result
   

def count_external_contact_names(
    db: Session,
    incidents: list[Incident],
    contact_type: ContactType | None = None,
) -> list[dict]:
    if not incidents:
        return []

    if contact_type == ContactType.TECHNICIEN:
        raise ValueError(
            "Technician contacts are i" \
            "nternal users, not external contacts"
        )

    query = (
        db.query(
            IncidentContact.contact_type,
            IncidentContact.external_contact_name,
        )
        .filter(
            IncidentContact.id_incident.in_(
                _incident_ids(incidents)
            ),
            IncidentContact.contact_type != ContactType.TECHNICIEN,
            IncidentContact.external_contact_name.is_not(None),
        )
    )

    if contact_type is not None:
        query = query.filter(
            IncidentContact.contact_type == contact_type
        )

    rows = query.all()
    counts = Counter()

    for row in rows:
        cleaned_name = (row.external_contact_name.strip())
        if not cleaned_name:
            continue

        key = (
            row.contact_type.value,
            cleaned_name.casefold(),
        )

        counts[key] += 1

    return [
        {
            "contact_type": contact_type_value,
            "name": normalized_name,
            "count": count,
        }
        for (
            contact_type_value,
            normalized_name,
        ), count in counts.most_common()
    ] # returns the Counter items ordered from highest count to lowest.
