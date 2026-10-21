from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import cast

from ..schemas import AnalysisIntent, RoutingResult
from ..models import (
    ContactType,
    Etat,
    StatutHistorique,
    Departement,
    Incident,
    Machine,
    Poteau,
    Unite,
)
from .search import search_incidents
from .similarity import (
    SimilarIncidentMatch,
    find_similar_incidents,
    find_similar_incidents_from_problem,
)
from .statistics import (
    count_total,
    count_by_status,
    count_by_severity,
    count_by_period,
    count_resolution_state,
    calculate_critical_percentage,
    count_by_location,
)
from .contacts import (
    count_by_contact_type,
    count_incidents_with_contacts,
    count_contacted_users,
    count_contacts_by_period,
    get_resolved_incidents_by_contact_type,
    count_external_contact_names,
)


HELPER_INCIDENT_RESULT_LIMIT = 20


class MachineResolutionError(ValueError):
    def __init__(
        self,
        reason: str,
        identifiers: dict,
        candidates: list[dict] | None = None,
    ):
        super().__init__(reason)
        self.reason = reason
        self.identifiers = identifiers
        self.candidates = candidates or []


class IncidentAnalysisService:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def resolve_machine_id(
        self,
        routing: RoutingResult,
    ) -> int | None:
        has_machine_identifier = any(
            value is not None
            for value in (
                routing.id_machine,
                routing.machine_name,
                routing.machine_ip,
                routing.machine_mac,
            )
        )

        if not has_machine_identifier:
            return None

        identifiers = {
            key: value
            for key, value in {
                "id_machine": routing.id_machine,
                "machine_name": routing.machine_name,
                "machine_ip": routing.machine_ip,
                "machine_mac": routing.machine_mac,
            }.items()
            if value is not None
        }

        query = self.db.query(Machine)

        if routing.id_machine is not None:
            query = query.filter(
                Machine.id_machine == routing.id_machine
            )

        if routing.machine_name is not None:
            query = query.filter(
                func.lower(Machine.nom_machine)
                == routing.machine_name.strip().lower()
            )

        if routing.machine_ip is not None:
            query = query.filter(
                Machine.ip_address == routing.machine_ip.strip()
            )

        if routing.machine_mac is not None:
            query = query.filter(
                func.lower(Machine.mac_address)
                == routing.machine_mac.strip().lower()
            )

        machines = query.all()

        if not machines:
            raise MachineResolutionError(
                reason="not_found",
                identifiers=identifiers,
            )

        if len(machines) > 1:
            machine_ids = [
                machine.id_machine
                for machine in machines
            ]

            rows = (
                self.db.query(
                    Machine,
                    Poteau.nom_poteau.label("pole_name"),
                    Unite.nom_unite.label("unit_name"),
                )
                .join(
                    Poteau,
                    Machine.id_poteau == Poteau.id_poteau,
                )
                .join(
                    Unite,
                    Poteau.id_unite == Unite.id_unite,
                )
                .filter(Machine.id_machine.in_(machine_ids))
                .all()
            )

            candidates = [
                {
                    "id_machine": row.Machine.id_machine,
                    "nom_machine": row.Machine.nom_machine,
                    "type_machine": row.Machine.type_machine,
                    "ip_address": row.Machine.ip_address,
                    "mac_address": row.Machine.mac_address,
                    "pole_name": row.pole_name,
                    "unit_name": row.unit_name,
                    "actif": row.Machine.actif,
                }
                for row in rows
            ]

            raise MachineResolutionError(
                reason="ambiguous",
                identifiers=identifiers,
                candidates=candidates,
            )

        return cast(int, machines[0].id_machine)
    
    def _search_from_routing(
        self,
        routing: RoutingResult,
    ) -> list[Incident]:
        resolved_machine_id = self.resolve_machine_id(routing)

        return search_incidents(
            db=self.db,
            id_machine=resolved_machine_id,
            machine_type=routing.machine_type,
            id_poteau=routing.id_poteau,
            status=routing.status_filter,
            severity=routing.severity_filter,
            date_from=routing.date_from,
            date_to=routing.date_to,
            problem_query=routing.problem_query,
            has_confirmed_cause=routing.has_confirmed_cause,
            has_applied_solution=routing.has_applied_solution,
            poteau_name=routing.poteau_name,
            unite_name=routing.unite_name,
            departement_name=routing.departement_name,
            contact_type=routing.contact_type,
            contacted_user_last_name=routing.contacted_user_last_name,
            contacted_user_email=routing.contacted_user_email,
        )

    def _machine_context_for_id(
        self,
        id_machine: int,
    ) -> dict | None:
        row = (
            self.db.query(
                Machine,
                Poteau.id_poteau.label("id_poteau"),
                Poteau.nom_poteau.label("pole_name"),
                Unite.id_unite.label("id_unite"),
                Unite.nom_unite.label("unit_name"),
                Departement.id_dep.label("id_department"),
                Departement.nom_dep.label("department_name"),
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
            .filter(Machine.id_machine == id_machine)
            .first()
        )

        if row is None:
            return None

        return {
            "id_machine": row.Machine.id_machine,
            "machine_name": row.Machine.nom_machine,
            "machine_type": row.Machine.type_machine,
            "machine_active": row.Machine.actif,
            "decommissioned_at": (
                row.Machine.date_decommissionnement.isoformat()
                if row.Machine.date_decommissionnement is not None
                else None
            ),
            "id_poteau": row.id_poteau,
            "pole_name": row.pole_name,
            "id_unite": row.id_unite,
            "unit_name": row.unit_name,
            "id_department": row.id_department,
            "department_name": row.department_name,
        }

    def _machine_context_map(
        self,
        incidents: list[Incident],
    ) -> dict[int, dict]:
        machine_ids = {
            incident.id_machine
            for incident in incidents
        }

        if not machine_ids:
            return {}

        rows = (
            self.db.query(
                Machine,
                Poteau.id_poteau.label("id_poteau"),
                Poteau.nom_poteau.label("pole_name"),
                Unite.id_unite.label("id_unite"),
                Unite.nom_unite.label("unit_name"),
                Departement.id_dep.label("id_department"),
                Departement.nom_dep.label("department_name"),
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
            .filter(Machine.id_machine.in_(machine_ids))
            .all()
        )

        return {
            row.Machine.id_machine: {
                "id_machine": row.Machine.id_machine,
                "machine_name": row.Machine.nom_machine,
                "machine_type": row.Machine.type_machine,
                "machine_active": row.Machine.actif,
                "decommissioned_at": (
                    row.Machine.date_decommissionnement.isoformat()
                    if row.Machine.date_decommissionnement is not None
                    else None
                ),
                "id_poteau": row.id_poteau,
                "pole_name": row.pole_name,
                "id_unite": row.id_unite,
                "unit_name": row.unit_name,
                "id_department": row.id_department,
                "department_name": row.department_name,
            }
            for row in rows
        }

    @staticmethod
    def _incident_to_dict(
        incident: Incident,
        machine_context: dict | None = None,
    ) -> dict:
        result = {
            "id_incident": incident.id_incident,
            "id_machine": incident.id_machine,
            "problem": incident.problem,
            "severity": incident.severity.value,
            "status": incident.status.value,
            "confirmed_cause": incident.confirmed_cause,
            "applied_solution": incident.applied_solution,
            "created_at": incident.created_at.isoformat(),
        }

        if machine_context is not None:
            result["machine"] = machine_context

        return result

    def _incidents_to_dict(
        self,
        incidents: list[Incident],
    ) -> list[dict]:
        contexts = self._machine_context_map(incidents)
        return [
            self._incident_to_dict(
                incident,
                contexts.get(incident.id_machine),
            )
            for incident in incidents
        ]

    def search(self, routing: RoutingResult) -> dict:
        incidents = self._search_from_routing(routing)
        visible_incidents = incidents[
            :HELPER_INCIDENT_RESULT_LIMIT
        ]

        return {
            "total": len(incidents),
            "returned": len(visible_incidents),
            "truncated": (
                len(incidents)
                > HELPER_INCIDENT_RESULT_LIMIT
            ),
            "incidents": self._incidents_to_dict(
                visible_incidents
            ),
        }

    def _statistics_from_incidents(
        self,
        incidents: list[Incident],
        routing: RoutingResult,
    ) -> dict:
        facts = {
            "total": count_total(incidents),
            "by_status": count_by_status(incidents),
            "by_severity": count_by_severity(incidents),
            "resolution_state": count_resolution_state(incidents),
            "critical_percentage": calculate_critical_percentage(incidents),
        }

        if routing.time_period is not None:
            facts["by_period"] = count_by_period(
                incidents,
                routing.time_period,
            )

        if routing.location_level is not None:
            facts["by_location"] = count_by_location(
                self.db,
                incidents,
                routing.location_level,
            )

        resolved_machine_id = self.resolve_machine_id(routing)
        if resolved_machine_id is not None:
            facts["scope_machine"] = self._machine_context_for_id(
                resolved_machine_id
            )

        return facts

    def statistics(self, routing: RoutingResult) -> dict:
        incidents = self._search_from_routing(routing)
        return self._statistics_from_incidents(incidents, routing)

    def _similar_matches_to_dict(
        self,
        matches: list[SimilarIncidentMatch],
    ) -> list[dict]:
        contexts = self._machine_context_map(
            [match.incident for match in matches]
        )

        return [
            {
                "incident": self._incident_to_dict(
                    match.incident,
                    contexts.get(match.incident.id_machine),
                ),
                "score": match.score,
                "reasons": match.reasons,
                "details": match.details,
            }
            for match in matches
        ]

    def relevant_previous_incidents(
        self,
        routing: RoutingResult,
    ) -> dict:
        if routing.reference_incident_id is not None:
            reference_incident = (
                self.db.query(Incident)
                .filter(
                    Incident.id_incident
                    == routing.reference_incident_id
                )
                .first()
            )

            if reference_incident is None:
                return {
                    "reference_mode": "incident",
                    "reference_incident": None,
                    "matches": [],
                    "error": "Reference incident not found",
                }

            matches = find_similar_incidents(
                db=self.db,
                reference_incident=reference_incident,
            )

            reference_context = self._machine_context_map(
                [reference_incident]
            ).get(reference_incident.id_machine)

            return {
                "reference_mode": "incident",
                "reference_incident": self._incident_to_dict(
                    reference_incident,
                    reference_context,
                ),
                "match_count": len(matches),
                "matches": self._similar_matches_to_dict(matches),
            }

        if routing.problem_query and routing.problem_query.strip():
            resolved_machine_id = self.resolve_machine_id(routing)
            matches = find_similar_incidents_from_problem(
                db=self.db,
                problem_query=routing.problem_query,
                id_machine=resolved_machine_id,
                machine_type=routing.machine_type,
            )

            return {
                "reference_mode": "free_text",
                "reference_problem": routing.problem_query.strip(),
                "reference_machine": (
                    self._machine_context_for_id(resolved_machine_id)
                    if resolved_machine_id is not None
                    else None
                ),
                "machine_type_filter": routing.machine_type,
                "match_count": len(matches),
                "matches": self._similar_matches_to_dict(matches),
            }

        return {
            "reference_mode": None,
            "reference_incident": None,
            "matches": [],
            "error": (
                "reference_incident_id or problem_query is required"
            ),
        }

    def historical_summary(self, routing: RoutingResult) -> dict:
        incidents = self._search_from_routing(routing)
        facts = self._statistics_from_incidents(
            incidents,
            routing,
        )

        if not incidents:
            facts["history_start"] = None
            facts["history_end"] = None
            facts["recent_incidents"] = []
            return facts

        history_start = min(
            incident.created_at
            for incident in incidents
        )
        history_end = max(
            incident.created_at
            for incident in incidents
        )

        facts["history_start"] = history_start.isoformat()
        facts["history_end"] = history_end.isoformat()
        facts["recent_incidents"] = self._incidents_to_dict(
            incidents[:5]
        )
        return facts

    def external_support_analysis(
        self,
        routing: RoutingResult,
    ) -> dict:
        incidents = self._search_from_routing(routing)
        external_contact_type = None

        if routing.contact_type in (
            ContactType.RENAULT,
            ContactType.AUTRE,
        ):
            external_contact_type = routing.contact_type

        facts = {
            "total_incidents": len(incidents),
            "incidents_with_contacts": count_incidents_with_contacts(
                self.db,
                incidents,
            ),
            "by_contact_type": count_by_contact_type(
                self.db,
                incidents,
            ),
            "contacted_users": count_contacted_users(
                self.db,
                incidents,
            ),
            "resolved_incidents_by_contact_type": (
                get_resolved_incidents_by_contact_type(
                    self.db,
                    incidents,
                )
            ),
            "external_contact_names": count_external_contact_names(
                self.db,
                incidents,
                contact_type=external_contact_type,
            ),
        }

        if routing.time_period is not None:
            facts["contacts_by_period"] = count_contacts_by_period(
                self.db,
                incidents,
                routing.time_period,
            )

        return facts

    def machine_state(
        self,
        routing: RoutingResult,
    ) -> dict:
        resolved_machine_id = self.resolve_machine_id(
            routing
        )

        if resolved_machine_id is None:
            raise MachineResolutionError(
                reason="missing",
                identifiers={},
            )

        machine = (
            self.db.query(Machine)
            .filter(
                Machine.id_machine
                == resolved_machine_id
            )
            .first()
        )

        if machine is None:
            raise MachineResolutionError(
                reason="not_found",
                identifiers={
                    "id_machine":
                        resolved_machine_id,
                },
            )

        status_row = (
            self.db.query(
                StatutHistorique,
                Etat,
            )
            .join(
                Etat,
                Etat.id_etat
                == StatutHistorique.id_etat,
            )
            .filter(
                StatutHistorique.id_machine
                == resolved_machine_id,
                StatutHistorique.date_suppression
                .is_(None),
            )
            .order_by(
                StatutHistorique
                .date_changement
                .desc(),
                StatutHistorique
                .id_statut
                .desc(),
            )
            .first()
        )

        current_state = None

        if status_row is not None:
            status_history, state = (
                status_row
            )

            current_state = {
                "label":
                    state.libelle_etat,
                "changed_at":
                    status_history
                    .date_changement
                    .isoformat(),
                "id_incident":
                    status_history.id_incident,
            }

        return {
            "machine": {
                "id_machine":
                    machine.id_machine,
                "name":
                    machine.nom_machine,
                "type":
                    machine.type_machine,
                "ip_address":
                    machine.ip_address,
                "mac_address":
                    machine.mac_address,
                "id_poteau":
                    machine.id_poteau,
                "active":
                    machine.actif,
                "decommissioned_at": (
                    machine
                    .date_decommissionnement
                    .isoformat()
                    if machine
                    .date_decommissionnement
                    is not None
                    else None
                ),
            },
            "current_state":
                current_state,
        }


    def analyze(
        self,
        routing: RoutingResult,
    ) -> dict:
        if (
            routing.intent
            == AnalysisIntent.MACHINE_STATE
        ):
            return self.machine_state(
                routing
            )

        if (
            routing.intent
            == AnalysisIntent.SEARCH_INCIDENTS
        ):
            return self.search(
                routing
            )

        if (
            routing.intent
            == AnalysisIntent.INCIDENT_STATISTICS
        ):
            return self.statistics(
                routing
            )

        if (
            routing.intent
            == AnalysisIntent.RELEVANT_PREVIOUS_INCIDENTS
        ):
            return self.relevant_previous_incidents(
                routing
            )

        if (
            routing.intent
            == AnalysisIntent.HISTORICAL_SUMMARY
        ):
            return self.historical_summary(
                routing
            )

        if (
            routing.intent
            == AnalysisIntent.EXTERNAL_SUPPORT_ANALYSIS
        ):
            return self.external_support_analysis(
                routing
            )

        raise ValueError(
            f"Unsupported analysis intent: {routing.intent}"
        )   