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
        role = Role(
            nom_role=role_name,
        )
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
            mot_de_passe=(
                pwd_context.hash(TEST_PASSWORD)
            ),
            id_role=role.id_role,
        )

        db.add(user)
        db.flush()

    return user


def seed():
    db = SessionLocal()

    try:
        # -------------------------------------------------
        # 1. Roles
        # -------------------------------------------------

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

        # -------------------------------------------------
        # 2. Users
        # -------------------------------------------------

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

        # -------------------------------------------------
        # 3. Location hierarchy
        # -------------------------------------------------

        department = (
            db.query(Departement)
            .filter(
                Departement.nom_dep
                == "TEST-DEPARTEMENT"
            )
            .first()
        )

        if department is None:
            department = Departement(
                nom_dep="TEST-DEPARTEMENT",
            )
            db.add(department)
            db.flush()

        unit = (
            db.query(Unite)
            .filter(
                Unite.nom_unite
                == "TEST-UNITE"
            )
            .first()
        )

        if unit is None:
            unit = Unite(
                nom_unite="TEST-UNITE",
                id_dep=department.id_dep,
            )
            db.add(unit)
            db.flush()

        pole_1 = (
            db.query(Poteau)
            .filter(
                Poteau.nom_poteau
                == "TEST-POTEAU-1"
            )
            .first()
        )

        if pole_1 is None:
            pole_1 = Poteau(
                nom_poteau="TEST-POTEAU-1",
                id_unite=unit.id_unite,
            )
            db.add(pole_1)
            db.flush()

        pole_2 = (
            db.query(Poteau)
            .filter(
                Poteau.nom_poteau
                == "TEST-POTEAU-2"
            )
            .first()
        )

        if pole_2 is None:
            pole_2 = Poteau(
                nom_poteau="TEST-POTEAU-2",
                id_unite=unit.id_unite,
            )
            db.add(pole_2)
            db.flush()

        # -------------------------------------------------
        # 4. Machines
        # -------------------------------------------------

        machine_1 = (
            db.query(Machine)
            .filter(
                Machine.ip_address
                == "192.0.2.10"
            )
            .first()
        )

        if machine_1 is None:
            machine_1 = Machine(
                nom_machine="TEST-MACHINE-DUP",
                ip_address="192.0.2.10",
                mac_address="02:00:00:00:00:10",
                date_installation=date(2026, 1, 10),
                id_poteau=pole_1.id_poteau,
            )
            db.add(machine_1)
            db.flush()

        machine_2 = (
            db.query(Machine)
            .filter(
                Machine.ip_address
                == "192.0.2.11"
            )
            .first()
        )

        if machine_2 is None:
            machine_2 = Machine(
                # SAME NAME intentionally.
                nom_machine="TEST-MACHINE-DUP",
                ip_address="192.0.2.11",
                mac_address="02:00:00:00:00:11",
                date_installation=date(2026, 1, 11),
                id_poteau=pole_2.id_poteau,
            )
            db.add(machine_2)
            db.flush()

        machine_3 = (
            db.query(Machine)
            .filter(
                Machine.ip_address
                == "192.0.2.12"
            )
            .first()
        )

        if machine_3 is None:
            machine_3 = Machine(
                nom_machine="TEST-MACHINE-B",
                ip_address="192.0.2.12",
                mac_address="02:00:00:00:00:12",
                date_installation=date(2026, 2, 1),

                # Same pole as machine_1.
                id_poteau=pole_1.id_poteau,
            )
            db.add(machine_3)
            db.flush()

        # -------------------------------------------------
        # 5. Machine-health states
        # -------------------------------------------------

        ok_state = (
            db.query(Etat)
            .filter(
                Etat.libelle_etat
                == "TEST-OK"
            )
            .first()
        )

        if ok_state is None:
            ok_state = Etat(
                libelle_etat="TEST-OK",
                couleur="green",
            )
            db.add(ok_state)

        failure_state = (
            db.query(Etat)
            .filter(
                Etat.libelle_etat
                == "TEST-PANNE"
            )
            .first()
        )

        if failure_state is None:
            failure_state = Etat(
                libelle_etat="TEST-PANNE",
                couleur="red",
            )
            db.add(failure_state)

        # -------------------------------------------------
        # 6. Incidents
        # -------------------------------------------------

        existing_test_incident = (
            db.query(Incident)
            .filter(
                Incident.problem.like("TEST:%")
            )
            .first()
        )

        if existing_test_incident is None:
            now = datetime.now(timezone.utc)

            old_network_incident = Incident(
                id_machine=machine_1.id_machine,
                problem=(
                    "TEST: The machine lost its "
                    "network connection"
                ),
                severity=IncidentSeverity.MAJEUR,
                status=IncidentStatus.RESOLU,
                confirmed_cause=(
                    "Network cable disconnected"
                ),
                applied_solution=(
                    "Reconnect the network cable"
                ),
                created_at=now - timedelta(days=30),
                created_by_user_id=admin.id_util,
            )

            similar_network_incident = Incident(
                id_machine=machine_3.id_machine,
                problem=(
                    "TEST: Connexion réseau perdue "
                    "sur la machine"
                ),
                severity=IncidentSeverity.CRITIQUE,
                status=IncidentStatus.EN_COURS,
                confirmed_cause=None,
                applied_solution=None,
                created_at=now - timedelta(days=5),
                created_by_user_id=technician.id_util,
            )

            printer_incident = Incident(
                id_machine=machine_2.id_machine,
                problem=(
                    "TEST: Le papier de "
                    "l'imprimante est bloqué"
                ),
                severity=IncidentSeverity.MINEUR,
                status=IncidentStatus.FERME,
                confirmed_cause="Paper jam",
                applied_solution="Remove blocked paper",
                created_at=now - timedelta(days=20),
                created_by_user_id=admin.id_util,
            )

            critical_incident = Incident(
                id_machine=machine_1.id_machine,
                problem=(
                    "TEST: Communication with "
                    "the server is unavailable"
                ),
                severity=IncidentSeverity.CRITIQUE,
                status=IncidentStatus.OUVERT,
                confirmed_cause=None,
                applied_solution=None,
                created_at=now - timedelta(days=2),
                created_by_user_id=technician.id_util,
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

            # ---------------------------------------------
            # 7. Incident status histories
            # ---------------------------------------------

            db.add_all(
                [
                    IncidentStatusHistory(
                        id_incident=(
                            old_network_incident.id_incident
                        ),
                        status=IncidentStatus.OUVERT,
                        changed_by_user_id=admin.id_util,
                        changed_at=now - timedelta(days=30),
                    ),
                    IncidentStatusHistory(
                        id_incident=(
                            old_network_incident.id_incident
                        ),
                        status=IncidentStatus.RESOLU,
                        changed_by_user_id=technician.id_util,
                        changed_at=now - timedelta(days=29),
                    ),
                    IncidentStatusHistory(
                        id_incident=(
                            similar_network_incident.id_incident
                        ),
                        status=IncidentStatus.EN_COURS,
                        changed_by_user_id=technician.id_util,
                        changed_at=now - timedelta(days=5),
                    ),
                ]
            )

            # ---------------------------------------------
            # 8. Contacts
            # ---------------------------------------------

            db.add_all(
                [
                    IncidentContact(
                        id_incident=(
                            old_network_incident.id_incident
                        ),
                        contact_type=ContactType.TECHNICIEN,
                        id_util=technician.id_util,
                    ),
                    IncidentContact(
                        id_incident=(
                            old_network_incident.id_incident
                        ),
                        contact_type=ContactType.RENAULT,
                        external_contact_name=(
                            "Renault Assistance"
                        ),
                    ),
                    IncidentContact(
                        id_incident=(
                            similar_network_incident.id_incident
                        ),
                        contact_type=ContactType.AUTRE,
                        external_contact_name="Orange",
                    ),
                ]
            )

        db.commit()

        print()
        print("=== TEST DATA READY ===")
        print()
        print(
            "Admin: test.admin@somaca.local"
        )
        print(
            "Technician: test.tech@somaca.local"
        )
        print(
            "Supervisor: test.supervisor@somaca.local"
        )
        print(
            f"Password for all: {TEST_PASSWORD}"
        )
        print()
        print(
            "Ambiguous machine name: "
            "TEST-MACHINE-DUP"
        )
        print(
            "Machine IP 1: 192.0.2.10"
        )
        print(
            "Machine IP 2: 192.0.2.11"
        )
        print(
            "Machine IP 3: 192.0.2.12"
        )
        print()
        print(
            "Test department: TEST-DEPARTEMENT"
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()