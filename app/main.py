import asyncio
import logging
from datetime import datetime, time, timedelta, timezone
from typing import cast
from uuid import UUID

from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    HTTPException,
    Query,
    Request,
    Response,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy import and_, func, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, aliased

from .auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SESSION_COOKIE_NAME,
    RoleName,
    _resolve_user_from_token,
    clear_session_cookie,
    create_access_token,
    get_current_user,
    hash_token,
    require_role,
    revoke_current_token_session,
    set_session_cookie,
)
from .database import SessionLocal, get_db
from .gemini_client import GEMINI_MODEL, HELPER_CONTEXT_MESSAGE_LIMIT
from .models import (
    ContactType,
    Departement,
    Etat,
    Incident,
    IncidentContact,
    IncidentSeverity,
    IncidentSeverityHistory,
    IncidentStatus,
    IncidentStatusHistory,
    Machine,
    Poteau,
    Role,
    Session as SessionModel,
    SomacaHelperMessage,
    StatutHistorique,
    Unite,
    Utilisateur,
)
from .schemas import (
    CurrentStatusOut,
    CurrentUserOut,
    DepartementCreate,
    DepartementOut,
    DepartementUpdate,
    EtatOut,
    EtatUsineOut,
    HelperAskRequest,
    HelperAskResponse,
    HelperConversationSummaryOut,
    HelperResponseStatus,
    IncidentContactCreate,
    IncidentContactOut,
    IncidentOut,
    IncidentPageOut,
    IncidentSummaryOut,
    IncidentReportCreate,
    IncidentSeverityHistoryOut,
    IncidentStatusHistoryOut,
    IncidentStatusUpdate,
    IncidentUpdate,
    LoginRequest,
    LoginResponse,
    MachineCreate,
    MachineDetailOut,
    MachineOut,
    MachineStateChangeCreate,
    MachineUpdate,
    NotificationReadOut,
    NotificationReadRequest,
    PoteauCreate,
    PoteauOut,
    PoteauUpdate,
    ProblemReportOut,
    RoleOut,
    SessionOut,
    SomacaHelperMessageOut,
    StatutHistoriqueOut,
    TechnicianOut,
    UniteCreate,
    UniteOut,
    UniteUpdate,
    UtilisateurCreate,
    UtilisateurOut,
    UtilisateurUpdate,
)
from .somaca_helper_service import (
    SomacaHelperClarificationError,
    SomacaHelperServiceError,
    analyze_routing,
    detect_intent,
    generate_clarification_answer,
    generate_final_answer,
)


logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

FIXED_ROLES = {
    RoleName.OPERATEUR,
    RoleName.SUPERVISEUR,
    RoleName.TECHNICIEN,
    RoleName.ADMINISTRATEUR,
}

FIXED_ETAT_LABELS = {
    "opérationnel",
    "attention requise",
    "critique",
    "inconnu",
}

MONTAGE_DEPARTMENT_NAME = "montage"

ACTIVE_INCIDENT_STATUSES = (
    IncidentStatus.OUVERT,
    IncidentStatus.EN_COURS,
    IncidentStatus.EN_ATTENTE,
    IncidentStatus.RESOLU,
)

TECHNICIAN_TRANSITIONS = {
    (IncidentStatus.OUVERT, IncidentStatus.EN_COURS),
    (IncidentStatus.EN_COURS, IncidentStatus.EN_ATTENTE),
    (IncidentStatus.EN_ATTENTE, IncidentStatus.EN_COURS),
    (IncidentStatus.EN_COURS, IncidentStatus.RESOLU),
}

ADMIN_TRANSITIONS = {
    (IncidentStatus.RESOLU, IncidentStatus.FERME),
    (IncidentStatus.RESOLU, IncidentStatus.EN_COURS),
    (IncidentStatus.OUVERT, IncidentStatus.ANNULE),
    (IncidentStatus.EN_COURS, IncidentStatus.ANNULE),
    (IncidentStatus.EN_ATTENTE, IncidentStatus.ANNULE),
    (IncidentStatus.RESOLU, IncidentStatus.ANNULE),
}


def commit_or_409(
    db: Session,
    conflict_detail: str = "La modification entre en conflit avec les données existantes.",
) -> None:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=conflict_detail,
        )


def latest_statut_query(db: Session):
    # The latest non-deleted history row is the machine's current physical state.
    return (
        db.query(StatutHistorique, Etat)
        .join(
            Etat,
            Etat.id_etat == StatutHistorique.id_etat,
        )
        .filter(StatutHistorique.date_suppression.is_(None))
        .order_by(
            StatutHistorique.id_machine,
            StatutHistorique.date_changement.desc(),
            StatutHistorique.id_statut.desc(),
        )
        .distinct(StatutHistorique.id_machine)
    )


def build_incident_event(
    event_type: str,
    incident: Incident,
) -> dict:
    return jsonable_encoder(
        {
            "type": event_type,
            "incident": IncidentOut.model_validate(incident),
        }
    )


def build_status_event(statut: StatutHistorique) -> dict:
    return {
        "type": "machine_status_changed",
        "id_statut": statut.id_statut,
        "id_machine": statut.id_machine,
        "id_etat": statut.id_etat,
        "id_util": statut.id_util,
        "id_incident": statut.id_incident,
        "date_changement": statut.date_changement.isoformat(),
    }


def get_role_or_404(db: Session, id_role: int) -> Role:
    role = (
        db.query(Role)
        .filter(Role.id_role == id_role)
        .first()
    )
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rôle introuvable.",
        )
    if role.nom_role.lower() not in FIXED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce rôle ne fait pas partie des rôles système autorisés.",
        )
    return role


def revoke_active_user_sessions(
    db: Session,
    id_util: int,
    revoked_at: datetime,
) -> None:
    (
        db.query(SessionModel)
        .filter(
            SessionModel.id_util == id_util,
            SessionModel.date_revocation.is_(None),
        )
        .update(
            {SessionModel.date_revocation: revoked_at},
            synchronize_session=False,
        )
    )


def validate_incident_transition(
    current_status: IncidentStatus,
    target_status: IncidentStatus,
    role_name: str,
    note: str | None,
) -> str | None:
    if current_status == target_status:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="L'incident possède déjà ce statut.",
        )

    transition = (current_status, target_status)

    if role_name == RoleName.TECHNICIEN:
        allowed = transition in TECHNICIAN_TRANSITIONS
    elif role_name == RoleName.ADMINISTRATEUR:
        allowed = transition in ADMIN_TRANSITIONS
    else:
        allowed = False

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Transition non autorisée : "
                f"{current_status.value} → {target_status.value}."
            ),
        )

    normalized_note = note.strip() if note and note.strip() else None

    requires_note = (
        target_status == IncidentStatus.ANNULE
        or transition == (IncidentStatus.RESOLU, IncidentStatus.EN_COURS)
    )

    if requires_note and normalized_note is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Une justification est obligatoire pour cette action.",
        )

    return normalized_note


class ConnectionManager:
    MAX_CONNECTIONS = 120

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict) -> None:
        dead_connections: list[WebSocket] = []

        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)

        for connection in dead_connections:
            self.disconnect(connection)


# Machine-state and incident streams remain separate because they drive
# different realtime behavior in the frontend.
manager = ConnectionManager()
incident_manager = ConnectionManager()


@app.get("/machines", response_model=list[MachineOut])
def get_machines(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    query = db.query(Machine)

    if not include_inactive:
        query = query.filter(Machine.actif.is_(True))

    return query.order_by(Machine.id_machine.asc()).all()


@app.get("/machines/{id_machine}", response_model=MachineDetailOut)
def get_machine(
    id_machine: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    machine = (
        db.query(Machine)
        .filter(Machine.id_machine == id_machine)
        .first()
    )
    if machine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine introuvable.",
        )

    row = (
        latest_statut_query(db)
        .filter(StatutHistorique.id_machine == id_machine)
        .first()
    )

    current_status = None
    if row is not None:
        statut, etat = row
        current_status = CurrentStatusOut(
            id_statut=statut.id_statut,
            date_changement=statut.date_changement,
            id_incident=statut.id_incident,
            etat=EtatOut.model_validate(etat),
        )

    return MachineDetailOut(
        **MachineOut.model_validate(machine).model_dump(),
        current_status=current_status,
    )


@app.post(
    "/machines",
    response_model=MachineOut,
    status_code=status.HTTP_201_CREATED,
)
def create_machine(
    machine: MachineCreate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    pole = (
        db.query(Poteau)
        .filter(Poteau.id_poteau == machine.id_poteau)
        .first()
    )
    if pole is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poteau introuvable.",
        )
    if not pole.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Une machine ne peut pas être rattachée à un poteau archivé.",
        )

    new_machine = Machine(**machine.model_dump())
    db.add(new_machine)
    commit_or_409(
        db,
        "La machine n'a pas pu être créée. Vérifiez notamment l'adresse IP.",
    )
    db.refresh(new_machine)
    return new_machine


@app.patch("/machines/{id_machine}", response_model=MachineOut)
def update_machine(
    id_machine: int,
    machine: MachineUpdate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Machine)
        .filter(Machine.id_machine == id_machine)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine introuvable.",
        )

    data = machine.model_dump(exclude_unset=True)

    if "id_poteau" in data:
        pole = (
            db.query(Poteau)
            .filter(Poteau.id_poteau == data["id_poteau"])
            .first()
        )
        if pole is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Poteau introuvable.",
            )
        if not pole.actif:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="La machine ne peut pas être déplacée vers un poteau archivé.",
            )

    for field, value in data.items():
        setattr(existing, field, value)

    commit_or_409(
        db,
        "La machine n'a pas pu être modifiée. Vérifiez les valeurs saisies.",
    )
    db.refresh(existing)
    return existing


@app.patch("/machines/{id_machine}/decommission", response_model=MachineOut)
def decommission_machine(
    id_machine: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    machine = (
        db.query(Machine)
        .filter(Machine.id_machine == id_machine)
        .first()
    )
    if machine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine introuvable.",
        )
    if not machine.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cette machine est déjà décommissionnée.",
        )

    has_active_incident = (
        db.query(Incident.id_incident)
        .filter(
            Incident.id_machine == id_machine,
            Incident.status.in_(
                ACTIVE_INCIDENT_STATUSES
            ),
        )
        .first()
        is not None
    )

    if has_active_incident:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Les incidents actifs de cette machine doivent être "
                "fermés ou annulés avant sa décommission."
            ),
        )

    machine.actif = False
    machine.date_decommissionnement = datetime.now(timezone.utc)
    commit_or_409(db, "La machine n'a pas pu être décommissionnée.")
    db.refresh(machine)
    return machine


@app.patch("/machines/{id_machine}/reactivate", response_model=MachineOut)
def reactivate_machine(
    id_machine: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    machine = (
        db.query(Machine)
        .filter(Machine.id_machine == id_machine)
        .first()
    )
    if machine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine introuvable.",
        )
    if machine.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cette machine est déjà active.",
        )

    pole = (
        db.query(Poteau)
        .filter(Poteau.id_poteau == machine.id_poteau)
        .first()
    )
    if pole is None or not pole.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Le poteau de cette machine doit être actif avant sa réactivation.",
        )

    machine.actif = True
    machine.date_decommissionnement = None
    commit_or_409(db, "La machine n'a pas pu être réactivée.")
    db.refresh(machine)
    return machine


@app.delete("/machines/{id_machine}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unused_machine(
    id_machine: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    machine = (
        db.query(Machine)
        .filter(Machine.id_machine == id_machine)
        .first()
    )
    if machine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine introuvable.",
        )

    has_history = (
        db.query(StatutHistorique.id_statut)
        .filter(StatutHistorique.id_machine == id_machine)
        .first()
        is not None
    )
    has_incident = (
        db.query(Incident.id_incident)
        .filter(Incident.id_machine == id_machine)
        .first()
        is not None
    )
    has_helper_history = (
        db.query(SomacaHelperMessage.id_message)
        .filter(SomacaHelperMessage.id_machine == id_machine)
        .first()
        is not None
    )

    if has_history or has_incident or has_helper_history:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Cette machine possède un historique. "
                "Décommissionnez-la au lieu de la supprimer."
            ),
        )

    db.delete(machine)
    commit_or_409(db, "La machine n'a pas pu être supprimée.")
    return None


@app.post(
    "/machines/{id_machine}/etat",
    response_model=StatutHistoriqueOut,
    status_code=status.HTTP_201_CREATED,
)
def change_machine_state(
    id_machine: int,
    payload: MachineStateChangeCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        require_role(RoleName.TECHNICIEN)
    ),
):
    machine = (
        db.query(Machine)
        .filter(Machine.id_machine == id_machine)
        .first()
    )
    if machine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine introuvable.",
        )
    if not machine.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="L'état d'une machine décommissionnée ne peut pas être modifié.",
        )

    etat = (
        db.query(Etat)
        .filter(Etat.id_etat == payload.id_etat)
        .first()
    )
    if etat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="État machine introuvable.",
        )
    if etat.libelle_etat.strip().casefold() not in FIXED_ETAT_LABELS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet état ne fait pas partie du référentiel système.",
        )

    if payload.id_incident is not None:
        incident = (
            db.query(Incident)
            .filter(Incident.id_incident == payload.id_incident)
            .first()
        )
        if incident is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident introuvable.",
            )
        if incident.id_machine != id_machine:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cet incident ne concerne pas la machine sélectionnée.",
            )
        if incident.status not in {
            IncidentStatus.EN_COURS,
            IncidentStatus.EN_ATTENTE,
        }:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "L'incident doit être en cours ou en attente avant "
                    "d'enregistrer un changement d'état machine."
                ),
            )

    current_row = (
        latest_statut_query(db)
        .filter(StatutHistorique.id_machine == id_machine)
        .first()
    )
    if current_row is not None and current_row[0].id_etat == payload.id_etat:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La machine possède déjà cet état.",
        )

    new_status = StatutHistorique(
        id_machine=id_machine,
        id_etat=payload.id_etat,
        id_util=current_user.id_util,
        id_incident=payload.id_incident,
        date_changement=datetime.now(timezone.utc),
    )
    db.add(new_status)
    commit_or_409(db, "Le nouvel état de la machine n'a pas pu être enregistré.")
    db.refresh(new_status)

    background_tasks.add_task(
        manager.broadcast,
        build_status_event(new_status),
    )
    return new_status


@app.get("/roles", response_model=list[RoleOut])
def get_roles(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    return (
        db.query(Role)
        .filter(func.lower(Role.nom_role).in_(FIXED_ROLES))
        .order_by(Role.id_role.asc())
        .all()
    )


@app.get("/utilisateurs", response_model=list[UtilisateurOut])
def get_utilisateurs(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    query = db.query(Utilisateur)

    if not include_inactive:
        query = query.filter(Utilisateur.actif.is_(True))

    return (
        query
        .order_by(Utilisateur.nom.asc(), Utilisateur.prenom.asc())
        .all()
    )


@app.post(
    "/utilisateurs",
    response_model=UtilisateurOut,
    status_code=status.HTTP_201_CREATED,
)
def create_utilisateur(
    utilisateur: UtilisateurCreate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    get_role_or_404(db, utilisateur.id_role)

    data = utilisateur.model_dump()
    data["mot_de_passe"] = pwd_context.hash(data["mot_de_passe"])

    new_user = Utilisateur(**data)
    db.add(new_user)
    commit_or_409(
        db,
        "L'utilisateur n'a pas pu être créé. L'adresse e-mail est peut-être déjà utilisée.",
    )
    db.refresh(new_user)
    return new_user


@app.patch("/utilisateurs/{id_util}", response_model=UtilisateurOut)
def update_utilisateur(
    id_util: int,
    utilisateur: UtilisateurUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        require_role(RoleName.ADMINISTRATEUR)
    ),
):
    existing = (
        db.query(Utilisateur)
        .filter(Utilisateur.id_util == id_util)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    data = utilisateur.model_dump(exclude_unset=True)

    if "id_role" in data and data["id_role"] is not None:
        target_role = get_role_or_404(db, data["id_role"])

        if (
            id_util == current_user.id_util
            and target_role.id_role != existing.id_role
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Vous ne pouvez pas modifier votre propre rôle.",
            )

    password_changed = (
        "mot_de_passe" in data
        and data["mot_de_passe"] is not None
    )

    if password_changed:
        data["mot_de_passe"] = pwd_context.hash(data["mot_de_passe"])

    for field, value in data.items():
        setattr(existing, field, value)

    if password_changed:
        revoke_active_user_sessions(
            db,
            id_util,
            datetime.now(timezone.utc),
        )

    commit_or_409(
        db,
        "L'utilisateur n'a pas pu être modifié.",
    )
    db.refresh(existing)
    return existing


@app.patch("/utilisateurs/{id_util}/deactivate", response_model=UtilisateurOut)
def deactivate_utilisateur(
    id_util: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        require_role(RoleName.ADMINISTRATEUR)
    ),
):
    if id_util == current_user.id_util:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vous ne pouvez pas désactiver votre propre compte.",
        )

    existing = (
        db.query(Utilisateur)
        .filter(Utilisateur.id_util == id_util)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )
    if not existing.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet utilisateur est déjà désactivé.",
        )

    now = datetime.now(timezone.utc)
    existing.actif = False
    existing.date_desactivation = now
    revoke_active_user_sessions(db, id_util, now)

    commit_or_409(db, "L'utilisateur n'a pas pu être désactivé.")
    db.refresh(existing)
    return existing



@app.delete("/utilisateurs/{id_util}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_utilisateur_via_delete(
    id_util: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        require_role(RoleName.ADMINISTRATEUR)
    ),
):
    if id_util == current_user.id_util:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vous ne pouvez pas désactiver votre propre compte.",
        )

    existing = (
        db.query(Utilisateur)
        .filter(Utilisateur.id_util == id_util)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )
    if not existing.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet utilisateur est déjà désactivé.",
        )

    now = datetime.now(timezone.utc)
    existing.actif = False
    existing.date_desactivation = now
    revoke_active_user_sessions(db, id_util, now)

    commit_or_409(db, "L'utilisateur n'a pas pu être désactivé.")
    return None


@app.patch("/utilisateurs/{id_util}/activate", response_model=UtilisateurOut)
def activate_utilisateur(
    id_util: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Utilisateur)
        .filter(Utilisateur.id_util == id_util)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )
    if existing.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet utilisateur est déjà actif.",
        )

    get_role_or_404(db, existing.id_role)

    existing.actif = True
    existing.date_desactivation = None
    commit_or_409(db, "L'utilisateur n'a pas pu être réactivé.")
    db.refresh(existing)
    return existing


@app.get("/technicians", response_model=list[TechnicianOut])
def get_technicians(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    return (
        db.query(Utilisateur)
        .join(Role, Utilisateur.id_role == Role.id_role)
        .filter(
            func.lower(Role.nom_role) == RoleName.TECHNICIEN,
            Utilisateur.actif.is_(True),
        )
        .order_by(Utilisateur.nom.asc(), Utilisateur.prenom.asc())
        .all()
    )


@app.get("/incident-actors")
def get_incident_actors(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    users = (
        db.query(Utilisateur)
        .order_by(
            Utilisateur.nom.asc(),
            Utilisateur.prenom.asc(),
        )
        .all()
    )

    return [
        {
            "id_util": user.id_util,
            "nom": user.nom,
            "prenom": user.prenom,
        }
        for user in users
    ]


@app.get("/sessions", response_model=list[SessionOut])
def get_sessions(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    return (
        db.query(SessionModel)
        .order_by(SessionModel.date_creation.desc())
        .all()
    )


@app.patch("/sessions/{id_session}/revoke", response_model=SessionOut)
def revoke_session(
    id_session: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(SessionModel)
        .filter(SessionModel.id_session == id_session)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session introuvable.",
        )
    if existing.date_revocation is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cette session est déjà révoquée.",
        )

    now = datetime.now(timezone.utc)
    expiration = existing.date_expiration
    comparison_now = (
        now.replace(tzinfo=None)
        if expiration.tzinfo is None
        else now
    )

    if expiration <= comparison_now:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cette session est déjà expirée.",
        )

    existing.date_revocation = comparison_now
    commit_or_409(db, "La session n'a pas pu être révoquée.")
    db.refresh(existing)
    return existing


@app.get("/departements", response_model=list[DepartementOut])
def get_departements(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    query = db.query(Departement)

    if not include_inactive:
        query = query.filter(Departement.actif.is_(True))

    return query.order_by(Departement.id_dep.asc()).all()


@app.post(
    "/departements",
    response_model=DepartementOut,
    status_code=status.HTTP_201_CREATED,
)
def create_departement(
    departement: DepartementCreate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    new_department = Departement(**departement.model_dump())
    db.add(new_department)
    commit_or_409(db, "Le département n'a pas pu être créé.")
    db.refresh(new_department)
    return new_department


@app.patch("/departements/{id_dep}", response_model=DepartementOut)
def update_departement(
    id_dep: int,
    departement: DepartementUpdate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Departement)
        .filter(Departement.id_dep == id_dep)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Département introuvable.",
        )

    for field, value in departement.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)

    commit_or_409(db, "Le département n'a pas pu être modifié.")
    db.refresh(existing)
    return existing


@app.patch("/departements/{id_dep}/archive", response_model=DepartementOut)
def archive_departement(
    id_dep: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Departement)
        .filter(Departement.id_dep == id_dep)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Département introuvable.",
        )
    if not existing.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce département est déjà archivé.",
        )

    has_active_units = (
        db.query(Unite.id_unite)
        .filter(
            Unite.id_dep == id_dep,
            Unite.actif.is_(True),
        )
        .first()
        is not None
    )
    if has_active_units:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Archivez d'abord les UET actives de ce département.",
        )

    existing.actif = False
    commit_or_409(db, "Le département n'a pas pu être archivé.")
    db.refresh(existing)
    return existing


@app.patch("/departements/{id_dep}/restore", response_model=DepartementOut)
def restore_departement(
    id_dep: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Departement)
        .filter(Departement.id_dep == id_dep)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Département introuvable.",
        )
    if existing.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce département est déjà actif.",
        )

    existing.actif = True
    commit_or_409(db, "Le département n'a pas pu être restauré.")
    db.refresh(existing)
    return existing


@app.delete("/departements/{id_dep}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unused_departement(
    id_dep: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Departement)
        .filter(Departement.id_dep == id_dep)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Département introuvable.",
        )

    has_units = (
        db.query(Unite.id_unite)
        .filter(Unite.id_dep == id_dep)
        .first()
        is not None
    )
    if has_units:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Ce département possède un historique structurel. "
                "Archivez-le au lieu de le supprimer."
            ),
        )

    db.delete(existing)
    commit_or_409(db, "Le département n'a pas pu être supprimé.")
    return None


@app.get("/unites", response_model=list[UniteOut])
def get_unites(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    query = db.query(Unite)

    if not include_inactive:
        query = query.filter(Unite.actif.is_(True))

    return query.order_by(Unite.id_unite.asc()).all()


@app.post(
    "/unites",
    response_model=UniteOut,
    status_code=status.HTTP_201_CREATED,
)
def create_unite(
    unite: UniteCreate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    department = (
        db.query(Departement)
        .filter(Departement.id_dep == unite.id_dep)
        .first()
    )
    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Département introuvable.",
        )
    if not department.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Une UET ne peut pas être rattachée à un département archivé.",
        )

    new_unit = Unite(**unite.model_dump())
    db.add(new_unit)
    commit_or_409(db, "L'UET n'a pas pu être créée.")
    db.refresh(new_unit)
    return new_unit


@app.patch("/unites/{id_unite}", response_model=UniteOut)
def update_unite(
    id_unite: int,
    unite: UniteUpdate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Unite)
        .filter(Unite.id_unite == id_unite)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UET introuvable.",
        )

    data = unite.model_dump(exclude_unset=True)
    if "id_dep" in data:
        department = (
            db.query(Departement)
            .filter(Departement.id_dep == data["id_dep"])
            .first()
        )
        if department is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Département introuvable.",
            )
        if not department.actif:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="L'UET ne peut pas être déplacée vers un département archivé.",
            )

    for field, value in data.items():
        setattr(existing, field, value)

    commit_or_409(db, "L'UET n'a pas pu être modifiée.")
    db.refresh(existing)
    return existing


@app.patch("/unites/{id_unite}/archive", response_model=UniteOut)
def archive_unite(
    id_unite: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Unite)
        .filter(Unite.id_unite == id_unite)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UET introuvable.",
        )
    if not existing.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cette UET est déjà archivée.",
        )

    has_active_poles = (
        db.query(Poteau.id_poteau)
        .filter(
            Poteau.id_unite == id_unite,
            Poteau.actif.is_(True),
        )
        .first()
        is not None
    )
    if has_active_poles:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Archivez d'abord les poteaux actifs de cette UET.",
        )

    existing.actif = False
    commit_or_409(db, "L'UET n'a pas pu être archivée.")
    db.refresh(existing)
    return existing


@app.patch("/unites/{id_unite}/restore", response_model=UniteOut)
def restore_unite(
    id_unite: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Unite)
        .filter(Unite.id_unite == id_unite)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UET introuvable.",
        )
    if existing.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cette UET est déjà active.",
        )

    department = (
        db.query(Departement)
        .filter(Departement.id_dep == existing.id_dep)
        .first()
    )
    if department is None or not department.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Le département parent doit être actif avant de restaurer cette UET.",
        )

    existing.actif = True
    commit_or_409(db, "L'UET n'a pas pu être restaurée.")
    db.refresh(existing)
    return existing


@app.delete("/unites/{id_unite}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unused_unite(
    id_unite: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Unite)
        .filter(Unite.id_unite == id_unite)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UET introuvable.",
        )

    has_poles = (
        db.query(Poteau.id_poteau)
        .filter(Poteau.id_unite == id_unite)
        .first()
        is not None
    )
    if has_poles:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cette UET possède des poteaux. Archivez-la au lieu de la supprimer.",
        )

    db.delete(existing)
    commit_or_409(db, "L'UET n'a pas pu être supprimée.")
    return None


@app.get("/poteaux", response_model=list[PoteauOut])
def get_poteaux(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    query = db.query(Poteau)

    if not include_inactive:
        query = query.filter(Poteau.actif.is_(True))

    return query.order_by(Poteau.id_poteau.asc()).all()


@app.post(
    "/poteaux",
    response_model=PoteauOut,
    status_code=status.HTTP_201_CREATED,
)
def create_poteau(
    poteau: PoteauCreate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    unit = (
        db.query(Unite)
        .filter(Unite.id_unite == poteau.id_unite)
        .first()
    )
    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UET introuvable.",
        )
    if not unit.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un poteau ne peut pas être rattaché à une UET archivée.",
        )

    new_pole = Poteau(**poteau.model_dump())
    db.add(new_pole)
    commit_or_409(db, "Le poteau n'a pas pu être créé.")
    db.refresh(new_pole)
    return new_pole


@app.patch("/poteaux/{id_poteau}", response_model=PoteauOut)
def update_poteau(
    id_poteau: int,
    poteau: PoteauUpdate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Poteau)
        .filter(Poteau.id_poteau == id_poteau)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poteau introuvable.",
        )

    data = poteau.model_dump(exclude_unset=True)
    if "id_unite" in data:
        unit = (
            db.query(Unite)
            .filter(Unite.id_unite == data["id_unite"])
            .first()
        )
        if unit is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="UET introuvable.",
            )
        if not unit.actif:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Le poteau ne peut pas être déplacé vers une UET archivée.",
            )

    for field, value in data.items():
        setattr(existing, field, value)

    commit_or_409(db, "Le poteau n'a pas pu être modifié.")
    db.refresh(existing)
    return existing


@app.patch("/poteaux/{id_poteau}/archive", response_model=PoteauOut)
def archive_poteau(
    id_poteau: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Poteau)
        .filter(Poteau.id_poteau == id_poteau)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poteau introuvable.",
        )
    if not existing.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce poteau est déjà archivé.",
        )

    has_active_machines = (
        db.query(Machine.id_machine)
        .filter(
            Machine.id_poteau == id_poteau,
            Machine.actif.is_(True),
        )
        .first()
        is not None
    )
    if has_active_machines:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Décommissionnez d'abord les machines actives de ce poteau.",
        )

    existing.actif = False
    commit_or_409(db, "Le poteau n'a pas pu être archivé.")
    db.refresh(existing)
    return existing


@app.patch("/poteaux/{id_poteau}/restore", response_model=PoteauOut)
def restore_poteau(
    id_poteau: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Poteau)
        .filter(Poteau.id_poteau == id_poteau)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poteau introuvable.",
        )
    if existing.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce poteau est déjà actif.",
        )

    unit = (
        db.query(Unite)
        .filter(Unite.id_unite == existing.id_unite)
        .first()
    )
    if unit is None or not unit.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="L'UET parente doit être active avant de restaurer ce poteau.",
        )

    existing.actif = True
    commit_or_409(db, "Le poteau n'a pas pu être restauré.")
    db.refresh(existing)
    return existing


@app.delete("/poteaux/{id_poteau}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unused_poteau(
    id_poteau: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR)),
):
    existing = (
        db.query(Poteau)
        .filter(Poteau.id_poteau == id_poteau)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poteau introuvable.",
        )

    has_machines = (
        db.query(Machine.id_machine)
        .filter(Machine.id_poteau == id_poteau)
        .first()
        is not None
    )
    if has_machines:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce poteau possède des machines. Archivez-le au lieu de le supprimer.",
        )

    db.delete(existing)
    commit_or_409(db, "Le poteau n'a pas pu être supprimé.")
    return None


@app.get("/etats", response_model=list[EtatOut])
def get_etats(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    # Machine states are a controlled system referential, not administrator CRUD.
    return (
        db.query(Etat)
        .filter(func.lower(Etat.libelle_etat).in_(FIXED_ETAT_LABELS))
        .order_by(Etat.id_etat.asc())
        .all()
    )


@app.get("/statuts", response_model=list[StatutHistoriqueOut])
def get_statuts(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    return (
        db.query(StatutHistorique)
        .filter(StatutHistorique.date_suppression.is_(None))
        .order_by(
            StatutHistorique.date_changement.desc(),
            StatutHistorique.id_statut.desc(),
        )
        .all()
    )




def normalize_machine_state_label(label: str | None) -> str:
    value = (label or "").strip().casefold()

    if "crit" in value:
        return "critical"
    if "attention" in value:
        return "attention"
    if "inconnu" in value:
        return "unknown"
    if "opérationnel" in value or "operationnel" in value:
        return "operational"

    return "unknown"


def operational_health_percent(operational: int, total: int) -> float:
    if total <= 0:
        return 0.0

    return round((operational / total) * 100, 1)


def montage_scope_rows(db: Session):
    return (
        db.query(Machine, Poteau, Unite)
        .join(Poteau, Poteau.id_poteau == Machine.id_poteau)
        .join(Unite, Unite.id_unite == Poteau.id_unite)
        .join(Departement, Departement.id_dep == Unite.id_dep)
        .filter(
            Machine.actif.is_(True),
            Poteau.actif.is_(True),
            Unite.actif.is_(True),
            Departement.actif.is_(True),
            func.lower(func.trim(Departement.nom_dep))
            == MONTAGE_DEPARTMENT_NAME,
        )
        .order_by(Machine.id_machine.asc())
        .all()
    )


def latest_machine_states_for_ids(
    db: Session,
    machine_ids: list[int],
):
    if not machine_ids:
        return {}

    rows = (
        db.query(StatutHistorique, Etat)
        .join(Etat, Etat.id_etat == StatutHistorique.id_etat)
        .filter(
            StatutHistorique.id_machine.in_(machine_ids),
            StatutHistorique.date_suppression.is_(None),
        )
        .order_by(
            StatutHistorique.id_machine.asc(),
            StatutHistorique.date_changement.desc(),
            StatutHistorique.id_statut.desc(),
        )
        .distinct(StatutHistorique.id_machine)
        .all()
    )

    return {
        statut.id_machine: (statut, etat)
        for statut, etat in rows
    }


def count_state_levels(
    machine_ids: list[int],
    state_by_machine: dict[int, str],
):
    counts = {
        "operational": 0,
        "attention": 0,
        "critical": 0,
        "unknown": 0,
    }

    for machine_id in machine_ids:
        level = state_by_machine.get(machine_id, "unknown")
        counts[level] += 1

    return counts

def as_utc_naive(value: datetime) -> datetime:
    """
    Normalizing database datetimes for internal historical comparisons.

    PostgreSQL/SQLAlchemy can return a mix of timezone-aware and
    timezone-naive values because the current schema contains both
    DateTime and DateTime(timezone=True) columns.
    """
    if value.tzinfo is None:
        return value

    return value.astimezone(timezone.utc).replace(tzinfo=None)

def build_montage_trend(
    db: Session,
    machine_ids: list[int],
    now_aware: datetime,
):
    if not machine_ids:
        return []

    today = now_aware.date()
    dates = [today - timedelta(days=offset) for offset in range(6, -1, -1)]

    cutoffs_aware: list[datetime] = []
    for index, day in enumerate(dates):
        if index == len(dates) - 1:
            cutoffs_aware.append(now_aware)
        else:
            cutoffs_aware.append(
                datetime.combine(day, time.max, tzinfo=timezone.utc)
            )

    cutoffs_naive = [item.replace(tzinfo=None) for item in cutoffs_aware]
    first_cutoff_naive = cutoffs_naive[0]
    first_day_start_aware = datetime.combine(
        dates[0],
        time.min,
        tzinfo=timezone.utc,
    )
    first_day_start_naive = first_day_start_aware.replace(tzinfo=None)
    now_naive = now_aware.replace(tzinfo=None)

    baseline_rows = (
        db.query(StatutHistorique, Etat)
        .join(Etat, Etat.id_etat == StatutHistorique.id_etat)
        .filter(
            StatutHistorique.id_machine.in_(machine_ids),
            StatutHistorique.date_suppression.is_(None),
            StatutHistorique.date_changement <= first_cutoff_naive,
        )
        .order_by(
            StatutHistorique.id_machine.asc(),
            StatutHistorique.date_changement.desc(),
            StatutHistorique.id_statut.desc(),
        )
        .distinct(StatutHistorique.id_machine)
        .all()
    )

    state_by_machine = {
        statut.id_machine: normalize_machine_state_label(etat.libelle_etat)
        for statut, etat in baseline_rows
    }

    window_rows = (
        db.query(StatutHistorique, Etat)
        .join(Etat, Etat.id_etat == StatutHistorique.id_etat)
        .filter(
            StatutHistorique.id_machine.in_(machine_ids),
            StatutHistorique.date_suppression.is_(None),
            StatutHistorique.date_changement > first_cutoff_naive,
            StatutHistorique.date_changement <= now_naive,
        )
        .order_by(
            StatutHistorique.date_changement.asc(),
            StatutHistorique.id_statut.asc(),
        )
        .all()
    )

    candidate_incident_ids: set[int] = set()

    current_active_ids = (
        db.query(Incident.id_incident)
        .filter(
            Incident.id_machine.in_(machine_ids),
            Incident.status.in_(ACTIVE_INCIDENT_STATUSES),
        )
        .all()
    )
    candidate_incident_ids.update(row[0] for row in current_active_ids)

    changed_ids = (
        db.query(IncidentStatusHistory.id_incident)
        .join(Incident, Incident.id_incident == IncidentStatusHistory.id_incident)
        .filter(
            Incident.id_machine.in_(machine_ids),
            IncidentStatusHistory.changed_at >= first_day_start_naive,
            IncidentStatusHistory.changed_at <= now_naive,
        )
        .distinct()
        .all()
    )
    candidate_incident_ids.update(row[0] for row in changed_ids)

    created_ids = (
        db.query(Incident.id_incident)
        .filter(
            Incident.id_machine.in_(machine_ids),
            Incident.created_at >= first_day_start_aware,
            Incident.created_at <= now_aware,
        )
        .all()
    )
    candidate_incident_ids.update(row[0] for row in created_ids)

    incidents_by_id: dict[int, Incident] = {}
    baseline_incident_status: dict[int, IncidentStatus] = {}
    window_status_history: list[IncidentStatusHistory] = []
    severity_by_incident: dict[int, IncidentSeverity] = {}
    window_severity_history: list[IncidentSeverityHistory] = []

    if candidate_incident_ids:
        candidate_ids = sorted(candidate_incident_ids)
        incidents = (
            db.query(Incident)
            .filter(Incident.id_incident.in_(candidate_ids))
            .all()
        )
        incidents_by_id = {incident.id_incident: incident for incident in incidents}

        baseline_status_rows = (
            db.query(IncidentStatusHistory)
            .filter(
                IncidentStatusHistory.id_incident.in_(candidate_ids),
                IncidentStatusHistory.changed_at <= first_cutoff_naive,
            )
            .order_by(
                IncidentStatusHistory.id_incident.asc(),
                IncidentStatusHistory.changed_at.desc(),
                IncidentStatusHistory.id_status_change.desc(),
            )
            .distinct(IncidentStatusHistory.id_incident)
            .all()
        )
        baseline_incident_status = {
            row.id_incident: row.status
            for row in baseline_status_rows
        }

        window_status_history = (
            db.query(IncidentStatusHistory)
            .filter(
                IncidentStatusHistory.id_incident.in_(candidate_ids),
                IncidentStatusHistory.changed_at > first_cutoff_naive,
                IncidentStatusHistory.changed_at <= now_naive,
            )
            .order_by(
                IncidentStatusHistory.changed_at.asc(),
                IncidentStatusHistory.id_status_change.asc(),
            )
            .all()
        )

        baseline_severity_rows = (
            db.query(IncidentSeverityHistory)
            .filter(
                IncidentSeverityHistory.id_incident.in_(candidate_ids),
                IncidentSeverityHistory.changed_at <= first_cutoff_naive,
            )
            .order_by(
                IncidentSeverityHistory.id_incident.asc(),
                IncidentSeverityHistory.changed_at.desc(),
                IncidentSeverityHistory.id_severity_change.desc(),
            )
            .distinct(IncidentSeverityHistory.id_incident)
            .all()
        )

        future_severity_rows = (
            db.query(IncidentSeverityHistory)
            .filter(
                IncidentSeverityHistory.id_incident.in_(candidate_ids),
                IncidentSeverityHistory.changed_at > first_cutoff_naive,
                IncidentSeverityHistory.changed_at <= now_naive,
            )
            .order_by(
                IncidentSeverityHistory.changed_at.asc(),
                IncidentSeverityHistory.id_severity_change.asc(),
            )
            .all()
        )
        window_severity_history = future_severity_rows

        first_future_severity: dict[int, IncidentSeverityHistory] = {}
        for row in future_severity_rows:
            first_future_severity.setdefault(row.id_incident, row)

        baseline_severity_by_id = {
            row.id_incident: row.new_severity
            for row in baseline_severity_rows
        }

        for incident_id, incident in incidents_by_id.items():
            if incident_id in baseline_severity_by_id:
                severity_by_incident[incident_id] = baseline_severity_by_id[incident_id]
            elif incident_id in first_future_severity:
                severity_by_incident[incident_id] = (
                    first_future_severity[incident_id].old_severity
                )
            else:
                severity_by_incident[incident_id] = incident.severity

    current_incident_status = dict(baseline_incident_status)
    status_index = 0
    severity_index = 0
    machine_index = 0
    result = []

    for point_index, cutoff_naive in enumerate(cutoffs_naive):
        if point_index > 0:
            while (
                machine_index < len(window_rows) and as_utc_naive(
                window_rows[machine_index][0].date_changement
                ) <= cutoff_naive
            ):
                statut, etat = window_rows[machine_index]
                state_by_machine[statut.id_machine] = normalize_machine_state_label(
                    etat.libelle_etat
                )
                machine_index += 1

            while (
                status_index < len(window_status_history)
                and as_utc_naive(
                    window_status_history[status_index].changed_at
                ) <= cutoff_naive
            ):
                row = window_status_history[status_index]
                current_incident_status[row.id_incident] = row.status
                status_index += 1

            while (
                severity_index < len(window_severity_history)
                and as_utc_naive(
                    window_severity_history[severity_index].changed_at
                ) <= cutoff_naive
            ):
                row = window_severity_history[severity_index]
                severity_by_incident[row.id_incident] = row.new_severity
                severity_index += 1

        counts = count_state_levels(machine_ids, state_by_machine)

        active_incidents = 0
        critical_active_incidents = 0

        for incident_id, incident in incidents_by_id.items():
            created_at = incident.created_at
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            else:
                created_at = created_at.astimezone(timezone.utc)

            if created_at > cutoffs_aware[point_index]:
                continue

            incident_status = current_incident_status.get(incident_id)
            if incident_status is None:
                incident_status = IncidentStatus.OUVERT

            if incident_status not in ACTIVE_INCIDENT_STATUSES:
                continue

            active_incidents += 1
            if severity_by_incident.get(incident_id) == IncidentSeverity.CRITIQUE:
                critical_active_incidents += 1

        result.append(
            {
                "date": dates[point_index],
                **counts,
                "operational_health": operational_health_percent(
                    counts["operational"],
                    len(machine_ids),
                ),
                "active_incidents": active_incidents,
                "critical_active_incidents": critical_active_incidents,
            }
        )

    return result

@app.get("/etat-usine", response_model=EtatUsineOut)
def get_etat_usine(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    now_aware = datetime.now(timezone.utc)
    scope_rows = montage_scope_rows(db)

    machines = [row[0] for row in scope_rows]
    machine_ids = [machine.id_machine for machine in machines]
    machine_by_id = {machine.id_machine: machine for machine in machines}
    pole_by_id = {row[1].id_poteau: row[1] for row in scope_rows}
    unit_by_id = {row[2].id_unite: row[2] for row in scope_rows}

    latest_rows = latest_machine_states_for_ids(db, machine_ids)
    current_state_by_machine = {
        machine_id: normalize_machine_state_label(etat.libelle_etat)
        for machine_id, (_, etat) in latest_rows.items()
    }
    current_counts = count_state_levels(machine_ids, current_state_by_machine)

    active_incidents = []
    if machine_ids:
        active_incidents = (
            db.query(Incident)
            .filter(
                Incident.id_machine.in_(machine_ids),
                Incident.status.in_(ACTIVE_INCIDENT_STATUSES),
            )
            .all()
        )

    pole_metrics: dict[int, dict] = {}
    for machine in machines:
        pole = pole_by_id.get(machine.id_poteau)
        if pole is None:
            continue

        unit = unit_by_id.get(pole.id_unite)
        level = current_state_by_machine.get(machine.id_machine, "unknown")

        item = pole_metrics.setdefault(
            pole.id_poteau,
            {
                "id_poteau": pole.id_poteau,
                "nom_poteau": pole.nom_poteau,
                "id_unite": pole.id_unite,
                "nom_unite": unit.nom_unite if unit is not None else f"UET {pole.id_unite}",
                "attention_machines": 0,
                "critical_machines": 0,
                "unknown_machines": 0,
                "active_incidents": 0,
                "critical_incidents": 0,
                "major_incidents": 0,
                "minor_incidents": 0,
                "highest_severity": None,
            },
        )

        if level == "attention":
            item["attention_machines"] += 1
        elif level == "critical":
            item["critical_machines"] += 1
        elif level == "unknown":
            item["unknown_machines"] += 1

    severity_rank = {
        IncidentSeverity.MINEUR: 1,
        IncidentSeverity.MAJEUR: 2,
        IncidentSeverity.CRITIQUE: 3,
    }

    for incident in active_incidents:
        machine = machine_by_id.get(incident.id_machine)
        if machine is None:
            continue

        item = pole_metrics.get(machine.id_poteau)
        if item is None:
            continue

        item["active_incidents"] += 1

        if incident.severity == IncidentSeverity.CRITIQUE:
            item["critical_incidents"] += 1
        elif incident.severity == IncidentSeverity.MAJEUR:
            item["major_incidents"] += 1
        else:
            item["minor_incidents"] += 1

        current_highest = item["highest_severity"]
        if (
            current_highest is None
            or severity_rank[incident.severity] > severity_rank[current_highest]
        ):
            item["highest_severity"] = incident.severity

    watched_poles = [
        item
        for item in pole_metrics.values()
        if (
            item["attention_machines"]
            or item["critical_machines"]
            or item["unknown_machines"]
            or item["active_incidents"]
        )
    ]

    watched_poles.sort(
        key=lambda item: (
            item["critical_machines"] > 0 or item["critical_incidents"] > 0,
            item["critical_machines"] + item["critical_incidents"],
            item["major_incidents"],
            item["attention_machines"],
            item["active_incidents"],
            item["unknown_machines"],
        ),
        reverse=True,
    )

    recent_changes = []
    if machine_ids:
        recent_rows = (
            db.query(StatutHistorique, Machine, Poteau, Unite, Etat)
            .join(Machine, Machine.id_machine == StatutHistorique.id_machine)
            .join(Poteau, Poteau.id_poteau == Machine.id_poteau)
            .join(Unite, Unite.id_unite == Poteau.id_unite)
            .join(Departement, Departement.id_dep == Unite.id_dep)
            .join(Etat, Etat.id_etat == StatutHistorique.id_etat)
            .filter(
                Machine.id_machine.in_(machine_ids),
                StatutHistorique.date_suppression.is_(None),
            )
            .order_by(
                StatutHistorique.date_changement.desc(),
                StatutHistorique.id_statut.desc(),
            )
            .limit(6)
            .all()
        )

        for statut, machine, pole, unit, current_etat in recent_rows:
            previous_row = (
                db.query(StatutHistorique, Etat)
                .join(Etat, Etat.id_etat == StatutHistorique.id_etat)
                .filter(
                    StatutHistorique.id_machine == machine.id_machine,
                    StatutHistorique.date_suppression.is_(None),
                    or_(
                        StatutHistorique.date_changement < statut.date_changement,
                        and_(
                            StatutHistorique.date_changement == statut.date_changement,
                            StatutHistorique.id_statut < statut.id_statut,
                        ),
                    ),
                )
                .order_by(
                    StatutHistorique.date_changement.desc(),
                    StatutHistorique.id_statut.desc(),
                )
                .first()
            )

            recent_changes.append(
                {
                    "id_statut": statut.id_statut,
                    "changed_at": statut.date_changement,
                    "id_machine": machine.id_machine,
                    "machine_name": machine.nom_machine,
                    "id_poteau": pole.id_poteau,
                    "pole_name": pole.nom_poteau,
                    "id_unite": unit.id_unite,
                    "unite_name": unit.nom_unite,
                    "previous_state": (
                        previous_row[1].libelle_etat
                        if previous_row is not None
                        else None
                    ),
                    "current_state": current_etat.libelle_etat,
                    "id_incident": statut.id_incident,
                }
            )

    trend = build_montage_trend(
        db,
        machine_ids,
        now_aware,
    )

    return {
        "scope": "Montage",
        "generated_at": now_aware,
        "summary": {
            "total_machines": len(machine_ids),
            **current_counts,
            "operational_health": operational_health_percent(
                current_counts["operational"],
                len(machine_ids),
            ),
            "active_incidents": len(active_incidents),
            "critical_active_incidents": sum(
                1
                for incident in active_incidents
                if incident.severity == IncidentSeverity.CRITIQUE
            ),
        },
        "trend": trend,
        "watched_poles": watched_poles,
        "recent_changes": recent_changes,
    }


@app.get(
    "/helper/conversations",
    response_model=list[HelperConversationSummaryOut],
)
def get_helper_conversations(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):
    FirstMessage = aliased(SomacaHelperMessage)

    first_user_message = (
        db.query(FirstMessage.content)
        .filter(
            FirstMessage.conversation_id == SomacaHelperMessage.conversation_id,
            FirstMessage.id_util == current_user.id_util,
            FirstMessage.role == "USER",
        )
        .order_by(
            FirstMessage.date_creation.asc(),
            FirstMessage.id_message.asc(),
        )
        .limit(1)
        .correlate(SomacaHelperMessage)
        .scalar_subquery()
    )

    rows = (
        db.query(
            SomacaHelperMessage.conversation_id.label("conversation_id"),
            first_user_message.label("preview"),
            func.count(SomacaHelperMessage.id_message).label("message_count"),
            func.max(SomacaHelperMessage.date_creation).label("last_activity"),
        )
        .filter(SomacaHelperMessage.id_util == current_user.id_util)
        .group_by(SomacaHelperMessage.conversation_id)
        .order_by(func.max(SomacaHelperMessage.date_creation).desc())
        .all()
    )

    # This aggregate query has no SQLAlchemy entity, so its rows are mapped explicitly.
    return [
        HelperConversationSummaryOut(
            conversation_id=row.conversation_id,
            preview=row.preview or "New conversation",
            message_count=row.message_count,
            last_activity=row.last_activity,
        )
        for row in rows
    ]


@app.get(
    "/helper/conversations/{conversation_id}",
    response_model=list[SomacaHelperMessageOut],
)
def get_helper_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):
    messages = (
        db.query(SomacaHelperMessage)
        .filter(
            SomacaHelperMessage.conversation_id == conversation_id,
            SomacaHelperMessage.id_util == current_user.id_util,
        )
        .order_by(
            SomacaHelperMessage.date_creation.asc(),
            SomacaHelperMessage.id_message.asc(),
        )
        .all()
    )

    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation introuvable.",
        )

    return messages


@app.post("/helper/ask", response_model=HelperAskResponse)
def ask_helper(
    request: HelperAskRequest,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):
    recent_messages = (
        db.query(SomacaHelperMessage)
        .filter(
            SomacaHelperMessage.conversation_id == request.conversation_id,
            SomacaHelperMessage.id_util == current_user.id_util,
        )
        .order_by(
            SomacaHelperMessage.date_creation.desc(),
            SomacaHelperMessage.id_message.desc(),
        )
        .limit(HELPER_CONTEXT_MESSAGE_LIMIT)
        .all()
    )

    # Gemini receives the saved context in chronological order.
    recent_messages.reverse()

    try:
        routing_result = detect_intent(
            request,
            recent_messages,
        )

        if routing_result.unsupported:
            answer = (
                routing_result.unsupported_reason
                or "This request is not supported by SomacaHelper."
            )
            response_status = HelperResponseStatus.UNSUPPORTED_REQUEST
            facts = {}
        elif routing_result.needs_clarification:
            answer = (
                routing_result.clarification_question
                or "Please clarify your request."
            )
            response_status = HelperResponseStatus.CLARIFICATION_REQUIRED
            facts = {}
        else:
            try:
                facts = analyze_routing(
                    db,
                    routing_result,
                )
            except SomacaHelperClarificationError as exc:
                answer = generate_clarification_answer(
                    request=request,
                    clarification=exc,
                )
                response_status = HelperResponseStatus.CLARIFICATION_REQUIRED
                facts = {}
            else:
                answer = generate_final_answer(
                    request=request,
                    routing=routing_result,
                    facts=facts,
                    recent_messages=recent_messages,
                )
                response_status = HelperResponseStatus.ANSWERED

    except SomacaHelperServiceError:
        db.rollback()
        return HelperAskResponse(
            status=HelperResponseStatus.ERROR,
            answer="SomacaHelper is temporarily unavailable. Please try again later.",
        )

    user_message = SomacaHelperMessage(
        conversation_id=request.conversation_id,
        id_util=current_user.id_util,
        role="USER",
        content=request.question,
        id_machine=request.context.current_machine_id,
        intent=(
            routing_result.intent.value
            if routing_result.intent is not None
            else None
        ),
        facts=None,
        model_name=None,
    )
    assistant_message = SomacaHelperMessage(
        conversation_id=request.conversation_id,
        id_util=current_user.id_util,
        role="ASSISTANT",
        content=answer,
        id_machine=request.context.current_machine_id,
        intent=(
            routing_result.intent.value
            if routing_result.intent is not None
            else None
        ),
        facts=facts,
        model_name=GEMINI_MODEL,
    )

    db.add_all([user_message, assistant_message])

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return HelperAskResponse(
            status=HelperResponseStatus.ERROR,
            answer="The conversation could not be saved. Please try again.",
        )

    return HelperAskResponse(
        status=response_status,
        answer=answer,
        intent=routing_result.intent,
        facts=facts,
    )


@app.delete(
    "/helper/conversations/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_helper_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):
    deleted_count = (
        db.query(SomacaHelperMessage)
        .filter(
            SomacaHelperMessage.conversation_id == conversation_id,
            SomacaHelperMessage.id_util == current_user.id_util,
        )
        .delete(synchronize_session=False)
    )

    if deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation introuvable.",
        )

    commit_or_409(db)
    return None


@app.post(
    "/incidents/report",
    response_model=ProblemReportOut,
    status_code=status.HTTP_201_CREATED,
)
def report_problem(
    report: IncidentReportCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        require_role(
            RoleName.ADMINISTRATEUR,
            RoleName.OPERATEUR,
        )
    ),
):
    machine = (
        db.query(Machine)
        .filter(Machine.id_machine == report.id_machine)
        .first()
    )
    if machine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La machine sélectionnée est introuvable.",
        )
    if not machine.actif:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un problème ne peut pas être signalé sur une machine décommissionnée.",
        )

    etat = (
        db.query(Etat)
        .filter(Etat.id_etat == report.id_etat)
        .first()
    )
    if etat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="L'état sélectionné est introuvable.",
        )
    normalized_state = etat.libelle_etat.strip().casefold()
    if normalized_state not in FIXED_ETAT_LABELS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="L'état sélectionné ne fait pas partie du référentiel système.",
        )
    if normalized_state == "opérationnel":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Un signalement doit indiquer un état non opérationnel "
                "ou nécessitant une attention."
            ),
        )

    problem = report.problem.strip()
    if len(problem) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La description du problème est trop courte.",
        )

    now = datetime.now(timezone.utc)
    new_incident = Incident(
        id_machine=report.id_machine,
        problem=problem,
        severity=report.severity,
        status=IncidentStatus.OUVERT,
        created_by_user_id=current_user.id_util,
        created_at=now,
    )

    try:
        # One report creates the incident and its initial machine-state event
        # in the same transaction so the two records cannot diverge.
        db.add(new_incident)
        db.flush()

        initial_history = IncidentStatusHistory(
            id_incident=new_incident.id_incident,
            status=IncidentStatus.OUVERT,
            changed_by_user_id=current_user.id_util,
            changed_at=now,
        )
        new_status = StatutHistorique(
            id_machine=report.id_machine,
            id_etat=report.id_etat,
            id_util=current_user.id_util,
            id_incident=new_incident.id_incident,
            date_changement=now,
        )

        db.add_all([initial_history, new_status])
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Problem report transaction failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Le signalement n'a pas pu être enregistré. "
                "Aucune modification n'a été appliquée. Veuillez réessayer."
            ),
        )

    db.refresh(new_incident)
    db.refresh(new_status)

    background_tasks.add_task(
        manager.broadcast,
        build_status_event(new_status),
    )
    background_tasks.add_task(
        incident_manager.broadcast,
        build_incident_event("incident_created", new_incident),
    )

    return {
        "incident": new_incident,
        "machine_status": new_status,
    }


def filtered_incident_query(
    db: Session,
    search: str | None = None,
    severity=None,
    incident_status=None,
):
    query = db.query(Incident)

    if severity is not None:
        query = query.filter(
            Incident.severity == severity
        )

    if incident_status is not None:
        query = query.filter(
            Incident.status == incident_status
        )

    normalized_search = (
        search.strip()
        if search
        else ""
    )

    if normalized_search:
        query = (
            query
            .join(
                Machine,
                Machine.id_machine == Incident.id_machine,
            )
            .join(
                Poteau,
                Poteau.id_poteau == Machine.id_poteau,
            )
        )

        searchable_text = normalized_search.casefold()
        numeric_search = normalized_search.lstrip("#").strip()
        conditions = [
            func.lower(Incident.problem).contains(
                searchable_text,
                autoescape=True,
            ),
            func.lower(Machine.nom_machine).contains(
                searchable_text,
                autoescape=True,
            ),
            func.lower(Poteau.nom_poteau).contains(
                searchable_text,
                autoescape=True,
            ),
        ]

        if numeric_search.isdigit():
            conditions.append(
                Incident.id_incident == int(numeric_search)
            )

        query = query.filter(
            or_(*conditions)
        )

    return query


@app.get("/incidents/active", response_model=list[IncidentOut])
def get_active_incidents(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    # Operational consumers need only incidents that have not been closed or cancelled.
    return (
        db.query(Incident)
        .filter(
            Incident.status.in_(
                ACTIVE_INCIDENT_STATUSES
            )
        )
        .order_by(
            Incident.created_at.desc(),
            Incident.id_incident.desc(),
        )
        .all()
    )


@app.get("/incidents/summary", response_model=IncidentSummaryOut)
def get_incident_summary(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    active_filter = Incident.status.in_(
        ACTIVE_INCIDENT_STATUSES
    )

    active_count = (
        db.query(func.count(Incident.id_incident))
        .filter(active_filter)
        .scalar()
        or 0
    )
    critical_active_count = (
        db.query(func.count(Incident.id_incident))
        .filter(
            active_filter,
            Incident.severity == IncidentSeverity.CRITIQUE,
        )
        .scalar()
        or 0
    )
    waiting_count = (
        db.query(func.count(Incident.id_incident))
        .filter(
            active_filter,
            Incident.status == IncidentStatus.EN_ATTENTE,
        )
        .scalar()
        or 0
    )
    oldest_active = (
        db.query(Incident)
        .filter(active_filter)
        .order_by(
            Incident.created_at.asc(),
            Incident.id_incident.asc(),
        )
        .limit(10)
        .all()
    )

    return {
        "active_count": active_count,
        "critical_active_count": critical_active_count,
        "waiting_count": waiting_count,
        "oldest_active": oldest_active,
    }


@app.get("/incidents", response_model=IncidentPageOut)
def get_incidents(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=10, le=100),
    search: str | None = Query(default=None, max_length=200),
    severity: IncidentSeverity | None = Query(default=None),
    incident_status: IncidentStatus | None = Query(
        default=None,
        alias="status",
    ),
    focus_id: int | None = Query(default=None, ge=1),
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    query = filtered_incident_query(
        db,
        search=search,
        severity=severity,
        incident_status=incident_status,
    )

    total = query.count()

    if focus_id is not None:
        focused = (
            query
            .filter(Incident.id_incident == focus_id)
            .first()
        )
        if focused is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "L'incident ciblé ne correspond pas "
                    "aux filtres actuels."
                ),
            )

        rows_before = (
            query
            .filter(
                or_(
                    Incident.created_at > focused.created_at,
                    and_(
                        Incident.created_at == focused.created_at,
                        Incident.id_incident > focused.id_incident,
                    ),
                )
            )
            .count()
        )
        page = rows_before // page_size + 1

    total_pages = max(
        1,
        (total + page_size - 1) // page_size,
    )
    page = min(page, total_pages)
    offset = (page - 1) * page_size

    items = (
        query
        .order_by(
            Incident.created_at.desc(),
            Incident.id_incident.desc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@app.get("/incidents/{id_incident}", response_model=IncidentOut)
def get_incident(
    id_incident: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id_incident == id_incident)
        .first()
    )
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident introuvable.",
        )
    return incident


@app.patch("/incidents/{id_incident}", response_model=IncidentOut)
def update_incident(
    id_incident: int,
    incident_update: IncidentUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        require_role(RoleName.TECHNICIEN)
    ),
):
    existing = (
        db.query(Incident)
        .filter(Incident.id_incident == id_incident)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident introuvable.",
        )
    if existing.status not in {
        IncidentStatus.EN_COURS,
        IncidentStatus.EN_ATTENTE,
    }:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "L'incident doit être en cours ou en attente avant "
                "d'enregistrer des informations techniques."
            ),
        )

    data = incident_update.model_dump(exclude_unset=True)
    severity_note = data.pop("severity_note", None)

    for field in ("confirmed_cause", "applied_solution"):
        if field in data and isinstance(data[field], str):
            normalized = data[field].strip()
            data[field] = normalized or None

    if isinstance(severity_note, str):
        severity_note = severity_note.strip() or None

    if not data and severity_note is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Aucune modification n'a été fournie.",
        )

    requested_severity = data.get("severity")
    severity_changed = (
        requested_severity is not None
        and requested_severity != existing.severity
    )

    if severity_note is not None and not severity_changed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Une note de sévérité nécessite un changement réel de sévérité.",
        )

    if severity_changed:
        severity_history = IncidentSeverityHistory(
            id_incident=existing.id_incident,
            old_severity=existing.severity,
            new_severity=requested_severity,
            changed_by_user_id=current_user.id_util,
            note=severity_note.strip() if severity_note else None,
        )
        db.add(severity_history)

    for field, value in data.items():
        setattr(existing, field, value)

    commit_or_409(
        db,
        "L'incident n'a pas pu être modifié.",
    )
    db.refresh(existing)

    background_tasks.add_task(
        incident_manager.broadcast,
        build_incident_event("incident_updated", existing),
    )
    return existing


@app.patch(
    "/incidents/{id_incident}/status",
    response_model=IncidentOut,
)
def update_incident_status(
    id_incident: int,
    status_update: IncidentStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        require_role(
            RoleName.ADMINISTRATEUR,
            RoleName.TECHNICIEN,
        )
    ),
):
    existing = (
        db.query(Incident)
        .filter(Incident.id_incident == id_incident)
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident introuvable.",
        )

    current_status = cast(IncidentStatus, existing.status)
    role_name = current_user.role.nom_role.lower()

    note = validate_incident_transition(
        current_status=current_status,
        target_status=status_update.status,
        role_name=role_name,
        note=status_update.note,
    )

    if (
        role_name == RoleName.TECHNICIEN
        and status_update.status == IncidentStatus.RESOLU
        and (
            not existing.confirmed_cause
            or not existing.applied_solution
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "La cause confirmée et la solution appliquée doivent être "
                "renseignées avant de marquer l'incident comme résolu."
            ),
        )

    existing.status = status_update.status
    history_entry = IncidentStatusHistory(
        id_incident=existing.id_incident,
        status=status_update.status,
        changed_by_user_id=current_user.id_util,
        note=note,
    )
    db.add(history_entry)

    commit_or_409(
        db,
        "Le statut de l'incident n'a pas pu être modifié.",
    )
    db.refresh(existing)

    background_tasks.add_task(
        incident_manager.broadcast,
        build_incident_event("incident_updated", existing),
    )
    return existing


@app.get(
    "/incidents/{id_incident}/history",
    response_model=list[IncidentStatusHistoryOut],
)
def get_incident_history(
    id_incident: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id_incident == id_incident)
        .first()
    )
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident introuvable.",
        )

    return (
        db.query(IncidentStatusHistory)
        .filter(IncidentStatusHistory.id_incident == id_incident)
        .order_by(
            IncidentStatusHistory.changed_at.asc(),
            IncidentStatusHistory.id_status_change.asc(),
        )
        .all()
    )


@app.get(
    "/incidents/{id_incident}/severity-history",
    response_model=list[IncidentSeverityHistoryOut],
)
def get_incident_severity_history(
    id_incident: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id_incident == id_incident)
        .first()
    )
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident introuvable.",
        )

    return (
        db.query(IncidentSeverityHistory)
        .filter(IncidentSeverityHistory.id_incident == id_incident)
        .order_by(
            IncidentSeverityHistory.changed_at.asc(),
            IncidentSeverityHistory.id_severity_change.asc(),
        )
        .all()
    )


@app.post(
    "/incidents/{id_incident}/contacts",
    response_model=IncidentContactOut,
    status_code=status.HTTP_201_CREATED,
)
def create_incident_contact(
    id_incident: int,
    contact: IncidentContactCreate,
    db: Session = Depends(get_db),
        _: Utilisateur = Depends(
        require_role(
            RoleName.TECHNICIEN,
            RoleName.ADMINISTRATEUR,
        )
    ),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id_incident == id_incident)
        .first()
    )
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident introuvable.",
        )
    if incident.status not in {
        IncidentStatus.EN_COURS,
        IncidentStatus.EN_ATTENTE,
    }:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "L'incident doit être en cours ou en attente avant "
                "d'enregistrer un contact technique."
            ),
        )

    if contact.contact_type == ContactType.TECHNICIEN:
        technician = (
            db.query(Utilisateur)
            .join(Role, Utilisateur.id_role == Role.id_role)
            .filter(
                Utilisateur.id_util == contact.id_util,
                func.lower(Role.nom_role) == RoleName.TECHNICIEN,
                Utilisateur.actif.is_(True),
            )
            .first()
        )
        if technician is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Le technicien sélectionné est introuvable ou inactif.",
            )

    external_name = (
        contact.external_contact_name.strip()
        if contact.external_contact_name
        else None
    )

    new_contact = IncidentContact(
        id_incident=id_incident,
        contact_type=contact.contact_type,
        id_util=contact.id_util,
        external_contact_name=external_name,
    )
    db.add(new_contact)
    commit_or_409(db, "Le contact n'a pas pu être enregistré.")
    db.refresh(new_contact)
    return new_contact


@app.get(
    "/incidents/{id_incident}/contacts",
    response_model=list[IncidentContactOut],
)
def get_incident_contacts(
    id_incident: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id_incident == id_incident)
        .first()
    )
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident introuvable.",
        )

    return (
        db.query(IncidentContact)
        .filter(IncidentContact.id_incident == id_incident)
        .order_by(
            IncidentContact.contacted_at.asc(),
            IncidentContact.id_contact.asc(),
        )
        .all()
    )


@app.post("/login", response_model=LoginResponse)
def login(
    credentials: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = (
        db.query(Utilisateur)
        .filter(Utilisateur.email == credentials.email)
        .first()
    )

    if (
        user is None
        or not pwd_context.verify(
            credentials.mot_de_passe,
            user.mot_de_passe,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Adresse e-mail ou mot de passe incorrect.",
        )

    if not user.actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce compte est désactivé. Contactez un administrateur.",
        )

    token = create_access_token(cast(int, user.id_util))
    now = datetime.now(timezone.utc)
    new_session = SessionModel(
        id_util=user.id_util,
        token=hash_token(token),
        date_creation=now,
        date_expiration=now
        + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    db.add(new_session)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Authentication session creation failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="La connexion n'a pas pu être établie. Veuillez réessayer.",
        )

    set_session_cookie(response, token)
    return LoginResponse(authenticated=True)


@app.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    token = request.cookies.get(SESSION_COOKIE_NAME)

    if token:
        revoke_current_token_session(token, db)

    clear_session_cookie(response)
    return None


@app.get("/me", response_model=CurrentUserOut)
def get_me(
    current_user: Utilisateur = Depends(get_current_user),
):
    return {
        "id_util": current_user.id_util,
        "nom": current_user.nom,
        "prenom": current_user.prenom,
        "email": current_user.email,
        "id_role": current_user.id_role,
        "role": current_user.role.nom_role.lower(),
        "actif": current_user.actif,
        "date_desactivation": current_user.date_desactivation,
        "notifications_read_at": current_user.notifications_read_at,
    }


@app.post("/notifications/read", response_model=NotificationReadOut)
def mark_notifications_read(
    payload: NotificationReadRequest | None = None,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    requested_read_at = (
        payload.read_at
        if payload is not None and payload.read_at is not None
        else now
    )

    if requested_read_at.tzinfo is None:
        requested_read_at = requested_read_at.replace(tzinfo=timezone.utc)
    else:
        requested_read_at = requested_read_at.astimezone(timezone.utc)

    # The per-user read cursor is monotonic and can never be moved into the future.
    target_read_at = min(requested_read_at, now)
    current_read_at = current_user.notifications_read_at

    if current_read_at is not None:
        if current_read_at.tzinfo is None:
            current_read_at = current_read_at.replace(tzinfo=timezone.utc)
        else:
            current_read_at = current_read_at.astimezone(timezone.utc)

        target_read_at = max(target_read_at, current_read_at)

    current_user.notifications_read_at = target_read_at
    commit_or_409(
        db,
        "L'état de lecture des notifications n'a pas pu être mis à jour.",
    )

    return {"read_at": target_read_at}


@app.websocket("/ws/statuts")
async def websocket_statuts(websocket: WebSocket):
    if len(manager.active_connections) >= manager.MAX_CONNECTIONS:
        await websocket.close(code=1013)
        return

    token = websocket.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        await websocket.close(code=1008)
        return

    db = SessionLocal()
    try:
        _resolve_user_from_token(token, db)
    except HTTPException:
        await websocket.close(code=1008)
        return
    finally:
        db.close()

    await websocket.accept()
    manager.active_connections.append(websocket)

    try:
        while True:
            try:
                await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30,
                )
            except asyncio.TimeoutError:
                pass

            db = SessionLocal()
            try:
                _resolve_user_from_token(token, db)
            except HTTPException:
                await websocket.close(code=1008)
                return
            finally:
                db.close()

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)


@app.websocket("/ws/incidents")
async def websocket_incidents(websocket: WebSocket):
    if len(incident_manager.active_connections) >= incident_manager.MAX_CONNECTIONS:
        await websocket.close(code=1013)
        return

    token = websocket.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        await websocket.close(code=1008)
        return

    db = SessionLocal()
    try:
        _resolve_user_from_token(token, db)
    except HTTPException:
        await websocket.close(code=1008)
        return
    finally:
        db.close()

    await websocket.accept()
    incident_manager.active_connections.append(websocket)

    try:
        while True:
            try:
                await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30,
                )
            except asyncio.TimeoutError:
                pass

            db = SessionLocal()
            try:
                _resolve_user_from_token(token, db)
            except HTTPException:
                await websocket.close(code=1008)
                return
            finally:
                db.close()

    except WebSocketDisconnect:
        pass
    finally:
        incident_manager.disconnect(websocket)
