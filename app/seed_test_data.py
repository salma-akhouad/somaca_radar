from datetime import date, datetime, timedelta, timezone

from passlib.context import CryptContext

from .database import SessionLocal
from .models import (
    ContactType,
    Departement,
    Etat,
    Incident,
    IncidentContact,
    IncidentSeverity,
    IncidentStatus,
    IncidentStatusHistory,
    Machine,
    Poteau,
    Role,
    StatutHistorique,
    Unite,
    Utilisateur,
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

TEST_PASSWORD = "Test123!"


def get_or_create_role(db, role_name: str):
    role = (
        db.query(Role)
        .filter(Role.nom_role == role_name)
        .first()
    )

    if role is None:
        role = Role(nom_role=role_name)
        db.add(role)
        db.flush()

    return role


def get_or_create_user(
    db,
    *,
    nom: str,
    prenom: str,
    email: str,
    role: Role,
):
    user = (
        db.query(Utilisateur)
        .filter(Utilisateur.email == email)
        .first()
    )

    if user is None:
        user = Utilisateur(
            nom=nom,
            prenom=prenom,
            email=email,
            mot_de_passe=pwd_context.hash(TEST_PASSWORD),
            id_role=role.id_role,
            actif=True,
        )
        db.add(user)
        db.flush()
    else:
        user.id_role = role.id_role
        user.actif = True
        user.date_desactivation = None

    return user


def get_state(db, label: str) -> Etat:
    state = (
        db.query(Etat)
        .filter(Etat.libelle_etat == label)
        .first()
    )
    if state is None:
        raise RuntimeError(
            f"Required fixed machine state is missing: {label}"
        )
    return state


def seed():
    db = SessionLocal()

    try:
        admin_role = get_or_create_role(
            db,
            "administrateur",
        )
        technician_role = get_or_create_role(
            db,
            "technicien",
        )
        supervisor_role = get_or_create_role(
            db,
            "superviseur",
        )
        operator_role = get_or_create_role(
            db,
            "operateur_de_production",
        )

        admin = get_or_create_user(
            db,
            nom="TEST-ADMIN",
            prenom="Admin",
            email="test.admin@somaca.local",
            role=admin_role,
        )
        technician = get_or_create_user(
            db,
            nom="TEST-TECH",
            prenom="Technician",
            email="test.tech@somaca.local",
            role=technician_role,
        )
        get_or_create_user(
            db,
            nom="TEST-SUPERVISOR",
            prenom="Supervisor",
            email="test.supervisor@somaca.local",
            role=supervisor_role,
        )
        operator = get_or_create_user(
            db,
            nom="TEST-OPERATOR",
            prenom="Operator",
            email="test.operator@somaca.local",
            role=operator_role,
        )

        department = (
            db.query(Departement)
            .filter(Departement.nom_dep == "TEST-DEPARTEMENT")
            .first()
        )
        if department is None:
            department = Departement(
                nom_dep="TEST-DEPARTEMENT",
                actif=True,
            )
            db.add(department)
            db.flush()
        else:
            department.actif = True

        unit = (
            db.query(Unite)
            .filter(Unite.nom_unite == "TEST-UNITE")
            .first()
        )
        if unit is None:
            unit = Unite(
                nom_unite="TEST-UNITE",
                id_dep=department.id_dep,
                actif=True,
            )
            db.add(unit)
            db.flush()
        else:
            unit.actif = True

        pole_1 = (
            db.query(Poteau)
            .filter(Poteau.nom_poteau == "TEST-POTEAU-1")
            .first()
        )
        if pole_1 is None:
            pole_1 = Poteau(
                nom_poteau="TEST-POTEAU-1",
                id_unite=unit.id_unite,
                actif=True,
            )
            db.add(pole_1)
            db.flush()
        else:
            pole_1.actif = True

        pole_2 = (
            db.query(Poteau)
            .filter(Poteau.nom_poteau == "TEST-POTEAU-2")
            .first()
        )
        if pole_2 is None:
            pole_2 = Poteau(
                nom_poteau="TEST-POTEAU-2",
                id_unite=unit.id_unite,
                actif=True,
            )
            db.add(pole_2)
            db.flush()
        else:
            pole_2.actif = True

        machine_1 = (
            db.query(Machine)
            .filter(Machine.ip_address == "192.0.2.10")
            .first()
        )
        if machine_1 is None:
            machine_1 = Machine(
                nom_machine="TEST-MACHINE-DUP",
                ip_address="192.0.2.10",
                mac_address="02:00:00:00:00:10",
                date_installation=date(2026, 1, 10),
                id_poteau=pole_1.id_poteau,
                actif=True,
            )
            db.add(machine_1)
            db.flush()
        else:
            machine_1.actif = True
            machine_1.date_decommissionnement = None

        machine_2 = (
            db.query(Machine)
            .filter(Machine.ip_address == "192.0.2.11")
            .first()
        )
        if machine_2 is None:
            machine_2 = Machine(
                nom_machine="TEST-MACHINE-DUP",
                ip_address="192.0.2.11",
                mac_address="02:00:00:00:00:11",
                date_installation=date(2026, 1, 11),
                id_poteau=pole_2.id_poteau,
                actif=True,
            )
            db.add(machine_2)
            db.flush()
        else:
            machine_2.actif = True
            machine_2.date_decommissionnement = None

        machine_3 = (
            db.query(Machine)
            .filter(Machine.ip_address == "192.0.2.12")
            .first()
        )
        if machine_3 is None:
            machine_3 = Machine(
                nom_machine="TEST-MACHINE-B",
                ip_address="192.0.2.12",
                mac_address="02:00:00:00:00:12",
                date_installation=date(2026, 2, 1),
                id_poteau=pole_1.id_poteau,
                actif=True,
            )
            db.add(machine_3)
            db.flush()
        else:
            machine_3.actif = True
            machine_3.date_decommissionnement = None

        operational = get_state(db, "Opérationnel")
        attention = get_state(db, "Attention requise")
        critical = get_state(db, "Critique")

        existing_status = (
            db.query(StatutHistorique)
            .filter(StatutHistorique.id_machine == machine_1.id_machine)
            .first()
        )
        if existing_status is None:
            db.add_all(
                [
                    StatutHistorique(
                        id_machine=machine_1.id_machine,
                        id_etat=operational.id_etat,
                        id_util=admin.id_util,
                    ),
                    StatutHistorique(
                        id_machine=machine_2.id_machine,
                        id_etat=operational.id_etat,
                        id_util=admin.id_util,
                    ),
                    StatutHistorique(
                        id_machine=machine_3.id_machine,
                        id_etat=attention.id_etat,
                        id_util=operator.id_util,
                    ),
                ]
            )

        existing_test_incident = (
            db.query(Incident)
            .filter(Incident.problem.like("TEST:%"))
            .first()
        )

        if existing_test_incident is None:
            now = datetime.now(timezone.utc)

            old_network_incident = Incident(
                id_machine=machine_1.id_machine,
                problem="TEST: The machine lost its network connection",
                severity=IncidentSeverity.MAJEUR,
                status=IncidentStatus.RESOLU,
                confirmed_cause="Network cable disconnected",
                applied_solution="Reconnect the network cable",
                created_at=now - timedelta(days=30),
                created_by_user_id=operator.id_util,
            )
            similar_network_incident = Incident(
                id_machine=machine_3.id_machine,
                problem="TEST: Connexion réseau perdue sur la machine",
                severity=IncidentSeverity.CRITIQUE,
                status=IncidentStatus.EN_COURS,
                created_at=now - timedelta(days=5),
                created_by_user_id=operator.id_util,
            )
            printer_incident = Incident(
                id_machine=machine_2.id_machine,
                problem="TEST: Le papier de l'imprimante est bloqué",
                severity=IncidentSeverity.MINEUR,
                status=IncidentStatus.FERME,
                confirmed_cause="Paper jam",
                applied_solution="Remove blocked paper",
                created_at=now - timedelta(days=20),
                created_by_user_id=operator.id_util,
            )
            critical_incident = Incident(
                id_machine=machine_1.id_machine,
                problem="TEST: Communication with the server is unavailable",
                severity=IncidentSeverity.CRITIQUE,
                status=IncidentStatus.OUVERT,
                created_at=now - timedelta(days=2),
                created_by_user_id=operator.id_util,
            )

            db.add_all(
                [
                    old_network_incident,
                    similar_network_incident,
                    printer_incident,
                    critical_incident,
                ]
            )
            db.flush()

            db.add_all(
                [
                    IncidentStatusHistory(
                        id_incident=old_network_incident.id_incident,
                        status=IncidentStatus.OUVERT,
                        changed_by_user_id=operator.id_util,
                        changed_at=now - timedelta(days=30),
                    ),
                    IncidentStatusHistory(
                        id_incident=old_network_incident.id_incident,
                        status=IncidentStatus.EN_COURS,
                        changed_by_user_id=technician.id_util,
                        changed_at=now - timedelta(days=30, hours=-1),
                    ),
                    IncidentStatusHistory(
                        id_incident=old_network_incident.id_incident,
                        status=IncidentStatus.RESOLU,
                        changed_by_user_id=technician.id_util,
                        changed_at=now - timedelta(days=29),
                    ),
                    IncidentStatusHistory(
                        id_incident=similar_network_incident.id_incident,
                        status=IncidentStatus.OUVERT,
                        changed_by_user_id=operator.id_util,
                        changed_at=now - timedelta(days=5, hours=2),
                    ),
                    IncidentStatusHistory(
                        id_incident=similar_network_incident.id_incident,
                        status=IncidentStatus.EN_COURS,
                        changed_by_user_id=technician.id_util,
                        changed_at=now - timedelta(days=5),
                    ),
                    IncidentStatusHistory(
                        id_incident=printer_incident.id_incident,
                        status=IncidentStatus.OUVERT,
                        changed_by_user_id=operator.id_util,
                        changed_at=now - timedelta(days=20, hours=3),
                    ),
                    IncidentStatusHistory(
                        id_incident=printer_incident.id_incident,
                        status=IncidentStatus.EN_COURS,
                        changed_by_user_id=technician.id_util,
                        changed_at=now - timedelta(days=20, hours=2),
                    ),
                    IncidentStatusHistory(
                        id_incident=printer_incident.id_incident,
                        status=IncidentStatus.RESOLU,
                        changed_by_user_id=technician.id_util,
                        changed_at=now - timedelta(days=20, hours=1),
                    ),
                    IncidentStatusHistory(
                        id_incident=printer_incident.id_incident,
                        status=IncidentStatus.FERME,
                        changed_by_user_id=admin.id_util,
                        changed_at=now - timedelta(days=20),
                    ),
                    IncidentStatusHistory(
                        id_incident=critical_incident.id_incident,
                        status=IncidentStatus.OUVERT,
                        changed_by_user_id=operator.id_util,
                        changed_at=now - timedelta(days=2),
                    ),
                ]
            )

            db.add_all(
                [
                    IncidentContact(
                        id_incident=old_network_incident.id_incident,
                        contact_type=ContactType.TECHNICIEN,
                        id_util=technician.id_util,
                    ),
                    IncidentContact(
                        id_incident=old_network_incident.id_incident,
                        contact_type=ContactType.RENAULT,
                        external_contact_name="Renault Assistance",
                    ),
                    IncidentContact(
                        id_incident=similar_network_incident.id_incident,
                        contact_type=ContactType.AUTRE,
                        external_contact_name="Orange",
                    ),
                ]
            )

            db.add_all(
                [
                    StatutHistorique(
                        id_machine=machine_1.id_machine,
                        id_etat=attention.id_etat,
                        id_util=operator.id_util,
                        id_incident=old_network_incident.id_incident,
                        date_changement=now - timedelta(days=30),
                    ),
                    StatutHistorique(
                        id_machine=machine_1.id_machine,
                        id_etat=operational.id_etat,
                        id_util=technician.id_util,
                        id_incident=old_network_incident.id_incident,
                        date_changement=now - timedelta(days=29),
                    ),
                    StatutHistorique(
                        id_machine=machine_3.id_machine,
                        id_etat=critical.id_etat,
                        id_util=technician.id_util,
                        id_incident=similar_network_incident.id_incident,
                        date_changement=now - timedelta(days=5),
                    ),
                ]
            )

        db.commit()

        print()
        print("TEST DATA READY")
        print()
        print("Admin: test.admin@somaca.local")
        print("Technician: test.tech@somaca.local")
        print("Supervisor: test.supervisor@somaca.local")
        print("Operator: test.operator@somaca.local")
        print(f"Password for all: {TEST_PASSWORD}")
        print()
        print("Ambiguous machine name: TEST-MACHINE-DUP")
        print("Machine IP 1: 192.0.2.10")
        print("Machine IP 2: 192.0.2.11")
        print("Machine IP 3: 192.0.2.12")
        print("Test department: TEST-DEPARTEMENT")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
