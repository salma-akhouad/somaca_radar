from sqlalchemy.orm import Session
from typing import cast
from ..schemas import AnalysisIntent, RoutingResult
from ..models import ContactType, Incident, Machine
from .search import search_incidents
from .similarity import SimilarIncidentMatch, find_similar_incidents
from sqlalchemy import func
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

class MachineResolutionError(ValueError):
    def __init__(
        self,
        reason: str,
        identifiers: dict,
        candidates: list[dict] | None = None,
    ):
        super().__init__(reason) # Calling the constructor of the base class (ValueError) with the reason for the error.

        self.reason = reason
        self.identifiers = identifiers
        self.candidates = candidates or []

class IncidentAnalysisService:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def _resolve_machine_id(self, routing: RoutingResult) -> int | None:
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
                func.lower(Machine.nom_machine) == routing.machine_name.strip().lower()
            )

        if routing.machine_ip is not None:
            query = query.filter(
                Machine.ip_address == routing.machine_ip.strip()
            )

        if routing.machine_mac is not None:
            query = query.filter(
                func.lower(Machine.mac_address) == routing.machine_mac.strip().lower()
            )

        machines = query.all()

        if not machines:
            raise MachineResolutionError(
                reason="not_found",
                identifiers=identifiers,
            )

        if len(machines) > 1:
            candidates = [
                {
                    "id_machine": machine.id_machine,
                    "nom_machine": machine.nom_machine,
                    "ip_address": machine.ip_address,
                    "mac_address": machine.mac_address,
                }
                for machine in machines
            ]

            raise MachineResolutionError(
                reason="ambiguous",
                identifiers=identifiers,
                candidates=candidates,
            )
       
        return cast(int,machines[0].id_machine)
    
    def _search_from_routing(
        self,
        routing: RoutingResult,
    ):
        resolved_machine_id = (self._resolve_machine_id(routing))
        return search_incidents(
            db=self.db,
            id_machine=resolved_machine_id,
            status=routing.status_filter,
            severity=routing.severity_filter,
            date_from=routing.date_from,
            date_to=routing.date_to,
            problem_query=routing.problem_query,
            has_confirmed_cause=(routing.has_confirmed_cause),
            has_applied_solution=(routing.has_applied_solution),
            poteau_name=routing.poteau_name,
            unite_name=routing.unite_name,
            departement_name=(routing.departement_name),
            contact_type=routing.contact_type,
            contacted_user_last_name=(routing.contacted_user_last_name),
            contacted_user_email=(routing.contacted_user_email),
        )


    # this is a converter function that takes an Incident object (SQLAlchemy object) and returns a dictionary representation of it
    @staticmethod # this decorator indicates that the method does not depend on the instance of the class and can be called on the class itself
    def _incident_to_dict(incident: Incident) -> dict:
        return {
            "id_incident": incident.id_incident,
            "id_machine": incident.id_machine,
            "problem": incident.problem,
            "severity": incident.severity.value,
            "status": incident.status.value,
            "confirmed_cause": incident.confirmed_cause,
            "applied_solution":incident.applied_solution,
            "created_at": incident.created_at.isoformat(),
        }

    # this method takes a RoutingResult object and returns a dictionary containing 
    # the total number of incidents found and a list of dictionaries representing each incident
    def search(self, routing: RoutingResult) -> dict:
        incidents = self._search_from_routing(routing)
        return {
            "total": len(incidents),
            "incidents": [
                self._incident_to_dict(incident)
                for incident in incidents
            ],
        }
    

    def _statistics_from_incidents(self, incidents: list[Incident], routing: RoutingResult) -> dict:
        facts = {
            "total": count_total(incidents),
            "by_status": count_by_status(incidents),
            "by_severity": count_by_severity(incidents),
            "resolution_state": (
                count_resolution_state(incidents)
            ),
            "critical_percentage": (
                calculate_critical_percentage(
                    incidents
                )
            ),
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

        return facts

    def statistics(self,routing: RoutingResult) -> dict:
        incidents = self._search_from_routing(routing)
        return self._statistics_from_incidents(incidents, routing)


    # this method takes a SimilarIncidentMatch object and returns a dictionary representation of it (because a class is not json compatible).
    @staticmethod
    def _similar_match_to_dict(match: SimilarIncidentMatch) -> dict:
        return {
            "incident": (
                IncidentAnalysisService._incident_to_dict(
                    match.incident
                )
            ),
            "score": match.score,
            "reasons": match.reasons,
            "details": match.details,
        }

    def relevant_previous_incidents(self, routing: RoutingResult) -> dict:
        if routing.reference_incident_id is None:
            return {
                "reference_incident": None,
                "matches": [],
                "error": (
                    "reference_incident_id is required"
                ),
            }

        reference_incident = (
            self.db.query(Incident)
            .filter(
                Incident.id_incident == routing.reference_incident_id
            )
            .first()
        )

        if reference_incident is None:
            return {
                "reference_incident": None,
                "matches": [],
                "error": "Reference incident not found",
            }

        matches = find_similar_incidents(
            db=self.db,
            reference_incident=reference_incident,
        )

        return {
            "reference_incident": (
                self._incident_to_dict(reference_incident)
            ),
            "match_count": len(matches),
            "matches": [
                self._similar_match_to_dict(match)
                for match in matches
            ],
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

        facts["history_start"] = (
            history_start.isoformat()
        )

        facts["history_end"] = (
            history_end.isoformat()
        )

        facts["recent_incidents"] = [
            self._incident_to_dict(incident)
            for incident in incidents[:5]
        ]

        return facts


    def external_support_analysis(self, routing: RoutingResult) -> dict:
        incidents = self._search_from_routing(routing)
        external_contact_type = None

        if routing.contact_type in (
            ContactType.RENAULT,
            ContactType.AUTRE,
        ):
            external_contact_type = routing.contact_type

        facts = {
            "total_incidents": len(incidents),
            "incidents_with_contacts": (
                count_incidents_with_contacts(
                    self.db,
                    incidents,
                )
            ),
            "by_contact_type": (
                count_by_contact_type(
                    self.db,
                    incidents,
                )
            ),
            "contacted_users": (
                count_contacted_users(
                    self.db,
                    incidents,
                )
            ),
            "resolved_incidents_by_contact_type": (
                get_resolved_incidents_by_contact_type(
                    self.db,
                    incidents,
                )
            ),
            "external_contact_names": (
                count_external_contact_names(
                    self.db,
                    incidents,
                    contact_type=external_contact_type,
                )
            ),
        }

        if routing.time_period is not None:
            facts["contacts_by_period"] = (
                count_contacts_by_period(
                    self.db,
                    incidents,
                    routing.time_period,
                )
            )

        return facts

    # This method takes the requested analysis intent from the routing result and calls the corresponding method to perform the analysis.
    def analyze(self,routing: RoutingResult) -> dict:
        if routing.intent == AnalysisIntent.SEARCH_INCIDENTS:
            return self.search(routing)

        if routing.intent == AnalysisIntent.INCIDENT_STATISTICS:
            return self.statistics(routing)

        if (
            routing.intent == AnalysisIntent.RELEVANT_PREVIOUS_INCIDENTS
        ):
            return self.relevant_previous_incidents(routing)

        if (
            routing.intent == AnalysisIntent.HISTORICAL_SUMMARY
        ):
            return self.historical_summary(routing)

        if (
            routing.intent == AnalysisIntent.EXTERNAL_SUPPORT_ANALYSIS
        ):
            return self.external_support_analysis(routing)

        raise ValueError(
            f"Unsupported analysis intent: {routing.intent}"
        )
    