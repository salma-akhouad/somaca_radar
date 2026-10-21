from collections import Counter 
# Counts the occurrences of each element in a list and returns a dictionary-like object with the counts.
from typing import Literal
from typing import cast
from sqlalchemy.orm import Session
from ..models import (
    Departement,
    Incident,
    IncidentSeverity,
    IncidentStatus,
    Machine,
    Poteau,
    Unite,
)

TimePeriod = Literal["day", "week", "month", "year"]
LocationLevel = Literal[
    "machine",
    "poteau",
    "unite",
    "departement",
]


def count_total(incidents: list[Incident]) -> int:
    return len(incidents)


def count_by_status(
    incidents: list[Incident],
) -> dict[str, int]:
    return dict(
        Counter(
            incident.status.value
            for incident in incidents
        )
    )


def count_by_severity(
    incidents: list[Incident],
) -> dict[str, int]:
    return dict(
        Counter(
            incident.severity.value
            for incident in incidents
        )
    )


def count_by_period(
    incidents: list[Incident],
    period: TimePeriod,
) -> dict[str, int]:
    formats = {
        "day": "%Y-%m-%d",
        "month": "%Y-%m",
        "year": "%Y",
    }

    if period == "week":
        counts = Counter(
            f"{incident.created_at.isocalendar().year}-W"
            f"{incident.created_at.isocalendar().week:02d}"
            for incident in incidents
        ) # this generates a string like "2023-W15" for each incident's creation date, representing the year and week number.
    else:
        date_format = formats[period]
        counts = Counter(
            incident.created_at.strftime(date_format) 
            for incident in incidents
        ) 

    return dict(sorted(counts.items()))


def count_resolution_state(
    incidents: list[Incident],
) -> dict[str, int]:
    resolved_statuses = {
        IncidentStatus.RESOLU,
        IncidentStatus.FERME,
    }

    resolved = sum(
        1
        for incident in incidents
        if incident.status in resolved_statuses
    )

    return {
        "resolved": resolved,
        "unresolved": len(incidents) - resolved,
    }


def calculate_critical_percentage(
    incidents: list[Incident],
) -> float:
    if not incidents:
        return 0.0

    critical_count = sum(
        1
        for incident in incidents
        if cast(IncidentSeverity, incident.severity) == IncidentSeverity.CRITIQUE
    )

    return round(
        critical_count / len(incidents) * 100,
        2,
    )


def count_by_location(
    db: Session,
    incidents: list[Incident],
    level: LocationLevel,
) -> list[dict]:
    if not incidents:
        return []

    incident_ids = [
        incident.id_incident
        for incident in incidents
    ]

    rows = (
        db.query(
            Machine.id_machine,
            Machine.nom_machine,
            Poteau.id_poteau,
            Poteau.nom_poteau,
            Unite.id_unite,
            Unite.nom_unite,
            Departement.id_dep,
            Departement.nom_dep,
        )
        .join(
            Incident,
            Incident.id_machine == Machine.id_machine,
        )
        .join(
            Poteau,
            Machine.id_poteau == Poteau.id_poteau,
        )
        .join(
            Unite,
            Poteau.id_unite == Unite.id_unite,
        )
        .join(
            Departement,
            Unite.id_dep == Departement.id_dep,
        )
        .filter(
            Incident.id_incident.in_(incident_ids)
        )
        .all()
    )

    level_fields = {
        "machine": ("id_machine", "nom_machine"),
        "poteau": ("id_poteau", "nom_poteau"),
        "unite": ("id_unite", "nom_unite"),
        "departement": ("id_dep", "nom_dep"),
    }

    id_field, name_field = level_fields[level]

    counts = Counter(
        (
            getattr(row, id_field),
            getattr(row, name_field),
        )
        for row in rows
    ) # the line calculates the times each pair of (id,name) appears.

    return [
        {
            "id": item_id,
            "name": name,
            "count": count,
        }
        for (item_id, name), count in counts.most_common() 
        # .most_common() returns a list of tuples sorted by count in descending order
    ]