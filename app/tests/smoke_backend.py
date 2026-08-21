import uuid
import requests


BASE_URL = "http://127.0.0.1:8000"

PASSWORD = "Test123!"

ADMIN_EMAIL = "test.admin@somaca.local"
TECH_EMAIL = "test.tech@somaca.local"
SUPERVISOR_EMAIL = (
    "test.supervisor@somaca.local"
)


def section(title: str):
    print()
    print("=" * 60)
    print(title)
    print("=" * 60)


def login(
    email: str,
    password: str = PASSWORD,
) -> str:
    response = requests.post(
        f"{BASE_URL}/login",
        json={
            "email": email,
            "mot_de_passe": password,
        },
        timeout=30,
    )

    assert response.status_code == 200, (
        response.status_code,
        response.text,
    )

    token = response.json()["access_token"]

    print(
        f"PASS login: {email}"
    )

    return token


def headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}"
    }


def test_status(
    label: str,
    response,
    expected_status: int,
):
    assert response.status_code == expected_status, (
        f"{label}\n"
        f"Expected: {expected_status}\n"
        f"Received: {response.status_code}\n"
        f"Body: {response.text}"
    )

    print(
        f"PASS {label}: "
        f"{response.status_code}"
    )


def main():
    section("1. AUTHENTICATION")

    admin_token = login(ADMIN_EMAIL)
    tech_token = login(TECH_EMAIL)
    supervisor_token = login(
        SUPERVISOR_EMAIL
    )

    bad_login = requests.post(
        f"{BASE_URL}/login",
        json={
            "email": ADMIN_EMAIL,
            "mot_de_passe": "WRONG_PASSWORD",
        },
        timeout=30,
    )

    test_status(
        "bad password rejected",
        bad_login,
        401,
    )

    section("2. AUTHORIZATION / RBAC")

    admin_users = requests.get(
        f"{BASE_URL}/utilisateurs",
        headers=headers(admin_token),
        timeout=30,
    )

    test_status(
        "admin can read users",
        admin_users,
        200,
    )

    tech_users = requests.get(
        f"{BASE_URL}/utilisateurs",
        headers=headers(tech_token),
        timeout=30,
    )

    test_status(
        "technician cannot read admin users endpoint",
        tech_users,
        403,
    )

    section("3. MACHINES")

    machines_response = requests.get(
        f"{BASE_URL}/machines",
        headers=headers(admin_token),
        timeout=30,
    )

    test_status(
        "authenticated user can read machines",
        machines_response,
        200,
    )

    machines = machines_response.json()

    test_machine = next(
        machine
        for machine in machines
        if (
            machine["ip_address"]
            == "192.0.2.10"
        )
    )

    print(
        "Resolved seeded machine ID:",
        test_machine["id_machine"],
    )

    detail_response = requests.get(
        (
            f"{BASE_URL}/machines/"
            f"{test_machine['id_machine']}"
        ),
        headers=headers(admin_token),
        timeout=30,
    )

    test_status(
        "machine details work",
        detail_response,
        200,
    )

    section("4. INCIDENTS")

    incidents_response = requests.get(
        f"{BASE_URL}/incidents",
        headers=headers(admin_token),
        timeout=30,
    )

    test_status(
        "incident list works",
        incidents_response,
        200,
    )

    incidents = incidents_response.json()

    test_incidents = [
        incident
        for incident in incidents
        if incident["problem"].startswith(
            "TEST:"
        )
    ]

    assert len(test_incidents) >= 4, (
        "Expected at least 4 seeded "
        "TEST incidents"
    )

    print(
        "PASS seeded incidents found:",
        len(test_incidents),
    )

    incident_with_history = next(
        incident
        for incident in test_incidents
        if (
            "lost its network connection"
            in incident["problem"]
        )
    )

    history_response = requests.get(
        (
            f"{BASE_URL}/incidents/"
            f"{incident_with_history['id_incident']}"
            "/history"
        ),
        headers=headers(admin_token),
        timeout=30,
    )

    test_status(
        "incident history works",
        history_response,
        200,
    )

    assert len(history_response.json()) >= 2

    print(
        "PASS incident history contains "
        "multiple status changes"
    )

    section("5. TECHNICIANS")

    technicians_response = requests.get(
        f"{BASE_URL}/technicians",
        headers=headers(admin_token),
        timeout=30,
    )

    test_status(
        "technician selector endpoint works",
        technicians_response,
        200,
    )

    technician_emails = {
        technician.get("email")
        for technician in technicians_response.json()
        if "email" in technician
    }

    print(
        "Technicians returned:",
        technicians_response.json(),
    )

    section("6. SOMACAHELPER - NORMAL ANSWER")

    conversation_id = str(uuid.uuid4())

    normal_helper = requests.post(
        f"{BASE_URL}/helper/ask",
        headers=headers(admin_token),
        json={
            "question": (
                "Combien d'incidents critiques "
                "existent dans le département "
                "TEST-DEPARTEMENT ?"
            ),
            "conversation_id": conversation_id,
            "context": {
                "current_page": (
                    "/dashboard"
                ),
                "current_machine_id": None,
            },
        },
        timeout=90,
    )

    test_status(
        "SomacaHelper statistics request",
        normal_helper,
        200,
    )

    normal_body = normal_helper.json()

    assert (
        normal_body["status"]
        == "ANSWERED"
    ), normal_body

    print(
        "SomacaHelper answer:",
        normal_body["answer"],
    )

    print(
        "SomacaHelper facts:",
        normal_body["facts"],
    )

    section(
        "7. SOMACAHELPER - MACHINE IP RESOLUTION"
    )

    ip_conversation = str(uuid.uuid4())

    ip_helper = requests.post(
        f"{BASE_URL}/helper/ask",
        headers=headers(admin_token),
        json={
            "question": (
                "Show me the incidents for "
                "the machine with IP "
                "192.0.2.10."
            ),
            "conversation_id": (
                ip_conversation
            ),
            "context": {
                "current_page": (
                    "/dashboard"
                ),
                "current_machine_id": None,
            },
        },
        timeout=90,
    )

    test_status(
        "machine resolved from IP",
        ip_helper,
        200,
    )

    assert (
        ip_helper.json()["status"]
        == "ANSWERED"
    ), ip_helper.json()

    print(
        "PASS machine IP resolution"
    )

    section(
        "8. SOMACAHELPER - AMBIGUOUS MACHINE"
    )

    ambiguity_conversation = str(
        uuid.uuid4()
    )

    ambiguity_response = requests.post(
        f"{BASE_URL}/helper/ask",
        headers=headers(admin_token),
        json={
            "question": (
                "Show me the history of "
                "TEST-MACHINE-DUP."
            ),
            "conversation_id": (
                ambiguity_conversation
            ),
            "context": {
                "current_page": (
                    "/dashboard"
                ),
                "current_machine_id": None,
            },
        },
        timeout=90,
    )

    test_status(
        "ambiguous machine request",
        ambiguity_response,
        200,
    )

    ambiguity_body = (
        ambiguity_response.json()
    )

    assert (
        ambiguity_body["status"]
        == "CLARIFICATION_REQUIRED"
    ), ambiguity_body

    print(
        "Clarification:",
        ambiguity_body["answer"],
    )

    section(
        "9. SOMACAHELPER - UNSUPPORTED REQUEST"
    )

    unsupported_conversation = str(
        uuid.uuid4()
    )

    unsupported_response = requests.post(
        f"{BASE_URL}/helper/ask",
        headers=headers(admin_token),
        json={
            "question": (
                "What is the weather "
                "in Casablanca today?"
            ),
            "conversation_id": (
                unsupported_conversation
            ),
            "context": {},
        },
        timeout=90,
    )

    test_status(
        "unsupported helper request",
        unsupported_response,
        200,
    )

    assert (
        unsupported_response.json()["status"]
        == "UNSUPPORTED_REQUEST"
    ), unsupported_response.json()

    print(
        "PASS unsupported request handling"
    )

    section(
        "10. CONVERSATION PERSISTENCE"
    )

    history = requests.get(
        (
            f"{BASE_URL}/helper/"
            f"conversations/{conversation_id}"
        ),
        headers=headers(admin_token),
        timeout=30,
    )

    test_status(
        "conversation can be reopened",
        history,
        200,
    )

    messages = history.json()

    assert len(messages) >= 2

    assert messages[-2]["role"] == "USER"
    assert messages[-1]["role"] == "ASSISTANT"

    print(
        "PASS USER and ASSISTANT "
        "messages persisted"
    )

    section("ALL SMOKE TESTS PASSED")

    print(
        "Backend core integration is ready "
        "for frontend development."
    )


if __name__ == "__main__":
    main()