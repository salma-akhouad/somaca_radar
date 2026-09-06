import asyncio
import hashlib
from typing import cast
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from uuid import UUID # Universally Unique Identifier, a 128-bit number used to uniquely identify information in computer systems. 
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from fastapi import BackgroundTasks, FastAPI, Depends, HTTPException, Request, Response, status, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session, aliased
from sqlalchemy.exc import IntegrityError
from .database import SessionLocal, get_db
from .models import (Machine, Role, Utilisateur, Session as SessionModel, Departement, Unite, Poteau, 
                     Etat, StatutHistorique, SomacaHelperMessage, Incident, IncidentStatusHistory, 
                     IncidentContact, IncidentStatus, ContactType
                    )
from .schemas import (CurrentStatusOut,MachineDetailOut, MachineCreate, MachineDetailOut,RoleCreate,
                      UtilisateurCreate, SessionCreate, DepartementCreate, UniteCreate, PoteauCreate, 
                      EtatCreate, StatutHistoriqueCreate, SomacaHelperMessageOut,MachineUpdate, 
                      RoleUpdate, UtilisateurUpdate, DepartementUpdate, UniteUpdate, PoteauUpdate, 
                      EtatUpdate, StatutHistoriqueUpdate,MachineOut, RoleOut, UtilisateurOut, SessionOut, 
                      DepartementOut, UniteOut,PoteauOut, EtatOut, StatutHistoriqueOut, LoginRequest,
                      LoginResponse, HelperConversationSummaryOut, HelperAskRequest, HelperAskResponse, 
                      HelperResponseStatus, RoutingResult, IncidentCreate, IncidentUpdate, IncidentStatusUpdate,
                      IncidentOut, IncidentStatusHistoryOut, IncidentContactCreate, IncidentContactOut,TechnicianOut,
                      CurrentUserOut, NotificationReadOut, NotificationReadRequest)
from .auth import (ACCESS_TOKEN_EXPIRE_MINUTES, SESSION_COOKIE_NAME, RoleName, _resolve_user_from_token,
                   clear_session_cookie, create_access_token, get_current_token, get_current_user, hash_token,
                   require_role, revoke_current_token_session, set_session_cookie)
from .somaca_helper_service import SomacaHelperServiceError, SomacaHelperClarificationError, detect_intent, analyze_routing, generate_final_answer,  generate_clarification_answer
from .gemini_client import GEMINI_MODEL, HELPER_CONTEXT_MESSAGE_LIMIT


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

def build_incident_event(
    event_type: str,
    incident: Incident,
):
    return jsonable_encoder({
        "type": event_type,
        "incident":
            IncidentOut.model_validate(
                incident
            ),
    })

# WebSocket manager to handle multiple connections and broadcast messages to all connected clients
class ConnectionManager:
    MAX_CONNECTIONS = 65 # Generous ceiling for the number of concurrent WebSocket connections, to prevent resource exhaustion and ensure server stability.
                         # Once the connection number 66 is reached, the server will reject new connections with a 1013 "Try Again Later" WebSocket close code. 
                         # untill the other conenctions are closed and the number of active connections drops below 65.

    def __init__(self):
        self.active_connections: list[WebSocket] = [] # This line initializes an empty list to keep track of all active WebSocket connections. Each connection is represented by a WebSocket object.   

    def disconnect(self, websocket: WebSocket): # no async because  there is no network operation, so no waiting is needed so nothing to await.
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    # the purpose of the broadcast method is to send a message to all currently connected clients, to keep them updated with the latest information, and to handle any connections that may have been closed or lost during the process.
    async def broadcast(self, message: dict):
        dead = [] # The dead list is a temporary "cleanup list" containing connections that were discovered to be dead while broadcasting (This browser already disconnected).
        for connection in self.active_connections:
            try: # await pauses the current async function, and since the loop is inside that function, the loop pauses too
                await connection.send_json(message) # send_json() is a method provided by FastAPI's WebSocket class that sends a JSON-encoded message to the client over the WebSocket connection. this message is a Python dictionary, which will be automatically converted to a JSON string before being sent to the client.
            except Exception:
                dead.append(connection)
        for connection in dead:
            self.disconnect(connection)

manager = ConnectionManager() 
incident_manager = ConnectionManager()

# bcrypt is a password hashing algorithm that is designed to be slow and computationally expensive, making it more resistant to brute-force attacks. 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # The deprecated="auto" argument means that if the password hash uses an older scheme, it will automatically be rehashed with the new scheme upon verification.

# Helper function to commit changes to the database and handle IntegrityError exceptions                                                              
def commit_or_409(db: Session, conflict_detail: str = "Conflict: duplicate value or invalid foreign key reference."):
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=conflict_detail) 
    # the 409 Conflict status code indicates that the request could not be completed due to a conflict with the current state of the resource. 

# Helper function to get the latest status for each machine
def latest_statut_query(db: Session):
    return (
        db.query(StatutHistorique, Etat)
        .join(
            Etat,
            Etat.id_etat == StatutHistorique.id_etat,  
        )
        .filter(
            StatutHistorique.date_suppression.is_(None)
        )
        .order_by(
            StatutHistorique.id_machine,
            StatutHistorique.date_changement.desc(),
            StatutHistorique.id_statut.desc(),
        )
        .distinct(
            StatutHistorique.id_machine
        )
    )

# CRUD OPS - HTTP endpoints

# Machines
@app.get("/machines", response_model=list[MachineOut])
def get_machines(db: Session = Depends(get_db), _: Utilisateur = Depends(get_current_user)): # _ : Utilisateur is not used in the function, but it's required to ensure that the user is authenticated before accessing this endpoint.
    return db.query(Machine).all()

# Get details of a specific machine
@app.get("/machines/{id_machine}", response_model=MachineDetailOut)
def get_machine(
    id_machine: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user), 
):
    machine = (
        db.query(Machine)
        .filter(
            Machine.id_machine == id_machine
        )
        .first()
    )

    if machine is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )
    
    row = (
        latest_statut_query(db)
        .filter(
            StatutHistorique.id_machine == id_machine
        )
        .first()
    )

    current_status = None 

    if row is not None:
        statut, etat = row 
        current_status = CurrentStatusOut(
            id_statut=statut.id_statut,
            date_changement=statut.date_changement,
            description_probleme=statut.description_probleme,
            etat=EtatOut.model_validate(etat), # Examine this supplied value, validate it, and build an EtatOut object from it.
        )   # model_validate() saves us from copying every field manually.

    return MachineDetailOut(
        **MachineOut.model_validate(machine).model_dump(), # model_validate() :  SQLAlchemy object → Pydantic object
        current_status=current_status,
    )

@app.post("/machines", response_model=MachineOut)
def create_machine(machine: MachineCreate, db: Session = Depends(get_db), 
                   _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    new_machine = Machine(**machine.model_dump()) # model_dump() is a method provided by Pydantic models that returns the model's data as a dictionary. This is useful for creating new instances of SQLAlchemy models, as it allows you to easily pass the data from the Pydantic model to the SQLAlchemy model.
    db.add(new_machine) # it adds the new_machine instance to the current database session, marking it tracked.
    commit_or_409(db)# it commits the current transaction, which means that all changes made in the session  are saved to the database.
    db.refresh(new_machine) # it refreshes the instance with the data from the database, including the auto-generated primary key (id_machine).
    return new_machine

@app.patch("/machines/{id_machine}", response_model=MachineOut)
def update_machine(id_machine: int, machine: MachineUpdate, db: Session = Depends(get_db),
                    _: Utilisateur = Depends(require_role(RoleName.TECHNICIEN, RoleName.ADMINISTRATEUR))):
    existing = db.query(Machine).filter(Machine.id_machine == id_machine).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    for field, value in machine.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)
    commit_or_409(db)
    db.refresh(existing)
    return existing

@app.delete("/machines/{id_machine}", status_code=status.HTTP_204_NO_CONTENT) # The status_code=status.HTTP_204_NO_CONTENT indicates that the request was successful, but there is no content to return in the response body.
def delete_machine(id_machine: int, db: Session = Depends(get_db),
                   _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Machine).filter(Machine.id_machine == id_machine).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    db.delete(existing) # it marks the existing instance for deletion in the current database session. The actual deletion will occur when the session is committed.
    commit_or_409(db, "Cannot delete: other records still reference this resource.")


# Roles
@app.get("/roles", response_model=list[RoleOut])
def get_roles(db: Session = Depends(get_db),
              _: Utilisateur = Depends(require_role("administrateur"))):
    return db.query(Role).all()

@app.post("/roles", response_model=RoleOut)
def create_role(role: RoleCreate, db: Session = Depends(get_db), _: Utilisateur = Depends(require_role("administrateur"))):
    new_role = Role(**role.model_dump())
    db.add(new_role)
    commit_or_409(db)
    db.refresh(new_role)
    return new_role

@app.patch("/roles/{id_role}", response_model=RoleOut)
def update_role(id_role: int, role: RoleUpdate, db: Session = Depends(get_db), 
                _: Utilisateur = Depends(require_role("administrateur"))):
    existing = db.query(Role).filter(Role.id_role == id_role).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Role not found")
    for field, value in role.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)
    commit_or_409(db)
    db.refresh(existing)
    return existing

@app.delete("/roles/{id_role}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(id_role: int, db: Session = Depends(get_db), 
                _: Utilisateur = Depends(require_role("administrateur"))):
    existing = db.query(Role).filter(Role.id_role == id_role).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(existing)
    commit_or_409(db, "Cannot delete: other records still reference this resource.")


# Utilisateurs
@app.get("/utilisateurs", response_model=list[UtilisateurOut])
def get_utilisateurs(db: Session = Depends(get_db),
                      _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    return db.query(Utilisateur).all()

@app.post("/utilisateurs", response_model=UtilisateurOut)
def create_utilisateur(utilisateur: UtilisateurCreate, db: Session = Depends(get_db)
                       ,  _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    data = utilisateur.model_dump()
    data["mot_de_passe"] = pwd_context.hash(data["mot_de_passe"]) # it hashes the password provided in the utilisateur object before storing it in the database.
    new_utilisateur = Utilisateur(**data)
    db.add(new_utilisateur)
    commit_or_409(db)
    db.refresh(new_utilisateur)
    return new_utilisateur

# special case: re-hash password if it's part of the update
@app.patch("/utilisateurs/{id_util}", response_model=UtilisateurOut)
def update_utilisateur(
    id_util: int,
    utilisateur: UtilisateurUpdate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(
        require_role(RoleName.ADMINISTRATEUR)
    ),
):
    existing = (
        db.query(Utilisateur)
        .filter(
            Utilisateur.id_util == id_util
        )
        .first()
    )

    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    data = utilisateur.model_dump(
        exclude_unset=True
    )

    password_changed = (
        "mot_de_passe" in data
        and data["mot_de_passe"] is not None
    )

    if password_changed:
        data["mot_de_passe"] = pwd_context.hash(
            data["mot_de_passe"]
        )

    for field, value in data.items():
        setattr(
            existing,
            field,
            value,
        )

    if password_changed:
        now = datetime.now(timezone.utc)

        (
            db.query(SessionModel)
            .filter(
                SessionModel.id_util == id_util,
                SessionModel.date_expiration > now,
                SessionModel.date_revocation.is_(None),
            )
            .update(
                {
                    SessionModel.date_revocation: now
                },
                synchronize_session=False,
            )
        )

    commit_or_409(db)
    db.refresh(existing)

    return existing

@app.delete("/utilisateurs/{id_util}", status_code=status.HTTP_204_NO_CONTENT)
def delete_utilisateur(id_util: int, db: Session = Depends(get_db),
                       _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Utilisateur).filter(Utilisateur.id_util == id_util).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(existing)
    commit_or_409(db, "Cannot delete: other records still reference this resource.")

@app.get("/technicians",
    response_model=list[TechnicianOut],
)
def get_technicians(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    return (
        db.query(Utilisateur)
        .join(
            Role,
            Utilisateur.id_role == Role.id_role,
        )
        .filter(
            func.lower(Role.nom_role)
            == RoleName.TECHNICIEN
        )
        .order_by(
            Utilisateur.nom.asc(),
            Utilisateur.prenom.asc(),
        )
        .all()
    )


# Sessions
@app.get("/sessions", response_model=list[SessionOut])
def get_sessions(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(
        require_role(RoleName.ADMINISTRATEUR)
    ),
):
    return (
        db.query(SessionModel)
        .order_by(
            SessionModel.date_creation.desc()
        )
        .all()
    )

@app.patch("/sessions/{id_session}/revoke", response_model=SessionOut)
def revoke_session(
    id_session: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(
        require_role(RoleName.ADMINISTRATEUR)
    ),
):
    existing = (
        db.query(SessionModel)
        .filter(
            SessionModel.id_session == id_session
        )
        .first()
    )

    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    date_revocation = getattr(
        existing,
        "date_revocation",
    )

    if date_revocation is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Session is already revoked",
        )

    expiration = getattr(
        existing,
        "date_expiration",
    )

    now = datetime.now(timezone.utc)

    if expiration.tzinfo is None:
        now_for_comparison = now.replace(
            tzinfo=None
        )
    else:
        now_for_comparison = now

    if expiration <= now_for_comparison:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Session is already expired",
        )

    setattr(
        existing,
        "date_revocation",
        now_for_comparison,
    )

    commit_or_409(
        db,
        "Could not revoke session",
    )

    db.refresh(existing)

    return existing
# Departements
@app.get("/departements", response_model=list[DepartementOut])
def get_departements(db: Session = Depends(get_db),
                       _: Utilisateur = Depends(get_current_user)):
    return db.query(Departement).all()

@app.post("/departements", response_model=DepartementOut)
def create_departement(departement: DepartementCreate, db: Session = Depends(get_db),
                       _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    new_departement = Departement(**departement.model_dump())
    db.add(new_departement)
    commit_or_409(db)
    db.refresh(new_departement)
    return new_departement

@app.patch("/departements/{id_dep}", response_model=DepartementOut)
def update_departement(id_dep: int, departement: DepartementUpdate, db: Session = Depends(get_db),
                       _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Departement).filter(Departement.id_dep == id_dep).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Departement not found")
    for field, value in departement.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)
    commit_or_409(db)
    db.refresh(existing)
    return existing

@app.delete("/departements/{id_dep}", status_code=status.HTTP_204_NO_CONTENT)
def delete_departement(id_dep: int, db: Session = Depends(get_db),
                       _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Departement).filter(Departement.id_dep == id_dep).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Departement not found")
    db.delete(existing)
    commit_or_409(db, "Cannot delete: other records still reference this resource.")


# Unites
@app.get("/unites", response_model=list[UniteOut])
def get_unites(db: Session = Depends(get_db),
                _: Utilisateur = Depends(get_current_user)):
    return db.query(Unite).all()

@app.post("/unites", response_model=UniteOut)
def create_unite(unite: UniteCreate, db: Session = Depends(get_db),
                 _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    new_unite = Unite(**unite.model_dump())
    db.add(new_unite)
    commit_or_409(db)
    db.refresh(new_unite)
    return new_unite

@app.patch("/unites/{id_unite}", response_model=UniteOut)
def update_unite(id_unite: int, unite: UniteUpdate, db: Session = Depends(get_db),
                  _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Unite).filter(Unite.id_unite == id_unite).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Unit not found")
    for field, value in unite.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)
    commit_or_409(db)
    db.refresh(existing)
    return existing

@app.delete("/unites/{id_unite}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unite(id_unite: int, db: Session = Depends(get_db),
                  _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Unite).filter(Unite.id_unite == id_unite).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Unit not found")
    db.delete(existing)
    commit_or_409(db, "Cannot delete: other records still reference this resource.")


# Poteaux
@app.get("/poteaux", response_model=list[PoteauOut])
def get_poteaux(db: Session = Depends(get_db),
                _: Utilisateur = Depends(get_current_user)):
    return db.query(Poteau).all()

@app.post("/poteaux", response_model=PoteauOut)
def create_poteau(poteau: PoteauCreate, db: Session = Depends(get_db),
                  _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    new_poteau = Poteau(**poteau.model_dump())
    db.add(new_poteau)
    commit_or_409(db)
    db.refresh(new_poteau)
    return new_poteau

@app.patch("/poteaux/{id_poteau}", response_model=PoteauOut)
def update_poteau(id_poteau: int, poteau: PoteauUpdate, db: Session = Depends(get_db),
                  _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Poteau).filter(Poteau.id_poteau == id_poteau).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Post not found")
    for field, value in poteau.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)
    commit_or_409(db)
    db.refresh(existing)
    return existing

@app.delete("/poteaux/{id_poteau}", status_code=status.HTTP_204_NO_CONTENT)
def delete_poteau(id_poteau: int, db: Session = Depends(get_db),
                   _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Poteau).filter(Poteau.id_poteau == id_poteau).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(existing)
    commit_or_409(db, "Cannot delete: other records still reference this resource.")


# Etats
@app.get("/etats", response_model=list[EtatOut])
def get_etats(db: Session = Depends(get_db),
               _: Utilisateur = Depends(get_current_user)):
    return db.query(Etat).all() 

@app.post("/etats", response_model=EtatOut)
def create_etat(etat: EtatCreate, db: Session = Depends(get_db),
                _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    new_etat = Etat(**etat.model_dump())
    db.add(new_etat)
    commit_or_409(db)
    db.refresh(new_etat)
    return new_etat

@app.patch("/etats/{id_etat}", response_model=EtatOut)
def update_etat(id_etat: int, etat: EtatUpdate, db: Session = Depends(get_db),
                _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Etat).filter(Etat.id_etat == id_etat).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="State not found")
    for field, value in etat.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)
    commit_or_409(db)
    db.refresh(existing)
    return existing

@app.delete("/etats/{id_etat}", status_code=status.HTTP_204_NO_CONTENT)
def delete_etat(id_etat: int, db: Session = Depends(get_db),
                _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(Etat).filter(Etat.id_etat == id_etat).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="State not found")
    db.delete(existing)
    commit_or_409(db, "Cannot delete: other records still reference this resource.")


# Statuts Historique
@app.get("/statuts", response_model=list[StatutHistoriqueOut])
def get_statuts(db: Session = Depends(get_db), _: Utilisateur = Depends(get_current_user)):
    return db.query(StatutHistorique).filter(StatutHistorique.date_suppression.is_(None)).all() 
# Here we didn't use StatutHistoriqueOut, we used StatutHistorique because we want to return the raw SQLAlchemy model instances, which will be automatically converted to the StatutHistoriqueOut Pydantic model by FastAPI when sending the response. 

@app.post("/statuts", response_model=StatutHistoriqueOut)
async def create_statut(
    statut: StatutHistoriqueCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        require_role(
            RoleName.TECHNICIEN,
            RoleName.ADMINISTRATEUR,
        )
    ),
):
    new_statut = StatutHistorique(
        **statut.model_dump(),
        id_util=current_user.id_util,
        date_changement=datetime.now(
            timezone.utc
        ),
    )
    db.add(new_statut)
    commit_or_409(db)
    db.refresh(new_statut)

    # Broadcast the new status change to all connected clients like the web dashboard, so they can update their UI in real-time without needing to refresh the page.
    await manager.broadcast({
        "type": "machine_status_changed",
        "id_statut": new_statut.id_statut,
        "id_machine": new_statut.id_machine,
        "id_etat": new_statut.id_etat,
        "id_util": new_statut.id_util,
        "date_changement": new_statut.date_changement.isoformat(),
        "description_probleme": new_statut.description_probleme,
    })

    return new_statut

@app.patch("/statuts/{id_statut}", response_model=StatutHistoriqueOut)
def update_statut(id_statut: int, statut: StatutHistoriqueUpdate, db: Session = Depends(get_db),
                  _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(StatutHistorique).filter(StatutHistorique.id_statut == id_statut).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Historical Status not found")
    for field, value in statut.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)
    commit_or_409(db)
    db.refresh(existing)
    return existing

@app.delete("/statuts/{id_statut}", status_code=status.HTTP_204_NO_CONTENT)
def delete_statut(id_statut: int, db: Session = Depends(get_db),
                   _: Utilisateur = Depends(require_role(RoleName.ADMINISTRATEUR))):
    existing = db.query(StatutHistorique).filter(
        StatutHistorique.id_statut == id_statut,
        StatutHistorique.date_suppression.is_(None) # Ensures that we only attempt to "delete" records that haven't already been soft-deleted
    ).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Historical status not found")
    setattr(existing,"date_suppression",datetime.now(timezone.utc))
    commit_or_409(db, "Cannot delete: other records still reference this resource.")


# SomacaHelper Conversations
@app.get("/helper/conversations",response_model=list[HelperConversationSummaryOut])
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
            SomacaHelperMessage.conversation_id.label(
                "conversation_id"
            ),
            first_user_message.label("preview"),
            func.count(
                SomacaHelperMessage.id_message
            ).label("message_count"),
            func.max(
                SomacaHelperMessage.date_creation
            ).label("last_activity"),
        )
        .filter(
            SomacaHelperMessage.id_util == current_user.id_util
        )
        .group_by(
            SomacaHelperMessage.conversation_id
        )
        .order_by(
            func.max(
                SomacaHelperMessage.date_creation
            ).desc()
        )
        .all()
    )
    # We are mapping each field in the rows to the corresponding field in the Pydantic model.Bc there is no direct SQLAlchemy table for this query.
    return [
        HelperConversationSummaryOut(
            conversation_id=row.conversation_id,
            preview=row.preview or "New conversation",
            message_count=row.message_count,
            last_activity=row.last_activity,
        )
        for row in rows
    ]

@app.get("/helper/conversations/{conversation_id}", response_model=list[SomacaHelperMessageOut])
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
            status_code=404,
            detail="Conversation not found",
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

    # The database returned newest first; Gemini needs chronological context.
    recent_messages.reverse()

    try:
        routing_result = detect_intent(
            request,
            recent_messages,
        )

        if routing_result.unsupported:
            answer = routing_result.unsupported_reason or "This request is not supported by SomacaHelper."
            response_status = HelperResponseStatus.UNSUPPORTED_REQUEST
            facts = {}

        elif routing_result.needs_clarification:
            answer = routing_result.clarification_question  or "Please clarify your request."
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
            answer=(
                "SomacaHelper is temporarily unavailable. Please try again later."
            ),
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

    db.add(user_message) 
    db.add(assistant_message)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return HelperAskResponse(
            status=HelperResponseStatus.ERROR,
            answer= "The conversation could not be saved. Please try again."
        )

    return HelperAskResponse(
        status=response_status,
        answer=answer,
        intent=routing_result.intent,
        facts=facts,
    )

@app.delete("/helper/conversations/{conversation_id}",status_code=status.HTTP_204_NO_CONTENT)
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
            status_code=404,
            detail="Conversation not found",
        )

    commit_or_409(db)


# Incident Management
@app.post(
    "/incidents",
    response_model=IncidentOut,
    status_code=status.HTTP_201_CREATED,
)
def create_incident(
    incident: IncidentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        require_role(
            RoleName.ADMINISTRATEUR,
            RoleName.TECHNICIEN,
        )
    ),
):
    machine = (
        db.query(Machine)
        .filter(
            Machine.id_machine
            == incident.id_machine
        )
        .first()
    )

    if machine is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    new_incident = Incident(
        id_machine=incident.id_machine,
        problem=incident.problem,
        severity=incident.severity,
        status=IncidentStatus.OUVERT,
        created_by_user_id=current_user.id_util,
    )

    db.add(new_incident)

    try:
        db.flush()

        initial_history = (
            IncidentStatusHistory(
                id_incident=
                    new_incident.id_incident,
                status=
                    IncidentStatus.OUVERT,
                changed_by_user_id=
                    current_user.id_util,
            )
        )

        db.add(initial_history)
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,
            detail=
                "Could not create incident",
        )

    db.refresh(new_incident)

    background_tasks.add_task(
        incident_manager.broadcast,
        build_incident_event(
            "incident_created",
            new_incident,
        ),
    )

    return new_incident


@app.get("/incidents",response_model=list[IncidentOut])
def get_incidents(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    return (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .all()
    )

@app.get("/incidents/{id_incident}",response_model=IncidentOut)
def get_incident(
    id_incident: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .filter(
            Incident.id_incident == id_incident
        )
        .first()
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return incident


@app.patch(
    "/incidents/{id_incident}",
    response_model=IncidentOut,
)
def update_incident(
    id_incident: int,
    incident: IncidentUpdate,
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
        .filter(
            Incident.id_incident
            == id_incident
        )
        .first()
    )

    if existing is None:
        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    data = incident.model_dump(
        exclude_unset=True
    )

    if (
        current_user.role.nom_role.lower()
        == RoleName.TECHNICIEN
    ):
        forbidden_fields = {
            "problem",
            "severity",
        }

        if forbidden_fields.intersection(
            data
        ):
            raise HTTPException(
                status_code=
                    status.HTTP_403_FORBIDDEN,
                detail=(
                    "Technicians cannot modify "
                    "the problem or severity."
                ),
            )

    for field, value in data.items():
        setattr(
            existing,
            field,
            value,
        )

    commit_or_409(db)
    db.refresh(existing)

    background_tasks.add_task(
        incident_manager.broadcast,
        build_incident_event(
            "incident_updated",
            existing,
        ),
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
        .filter(
            Incident.id_incident
            == id_incident
        )
        .first()
    )

    if existing is None:
        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    existing_status = cast(
        IncidentStatus,
        existing.status,
    )

    if (
        existing_status
        == status_update.status
    ):
        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,
            detail=
                "Incident already has this status",
        )

    setattr(
        existing,
        "status",
        status_update.status,
    )

    history_entry = (
        IncidentStatusHistory(
            id_incident=
                existing.id_incident,
            status=
                status_update.status,
            changed_by_user_id=
                current_user.id_util,
        )
    )

    db.add(history_entry)

    commit_or_409(
        db,
        "Could not update incident status",
    )

    db.refresh(existing)

    background_tasks.add_task(
        incident_manager.broadcast,
        build_incident_event(
            "incident_updated",
            existing,
        ),
    )

    return existing


@app.get("/incidents/{id_incident}/history",
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
            detail="Incident not found",
        )

    return (
        db.query(IncidentStatusHistory)
        .filter(
            IncidentStatusHistory.id_incident == id_incident
        )
        .order_by(
            IncidentStatusHistory.changed_at.asc(),
            IncidentStatusHistory.id_status_change.asc(),
        )
        .all()
    )

@app.post("/incidents/{id_incident}/contacts",
    response_model=IncidentContactOut,
    status_code=status.HTTP_201_CREATED,
)
def create_incident_contact(
    id_incident: int,
    contact: IncidentContactCreate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(
        require_role(RoleName.ADMINISTRATEUR,RoleName.TECHNICIEN)
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
            detail="Incident not found",
        )

    if contact.contact_type == ContactType.TECHNICIEN:
        technician = (
            db.query(Utilisateur)
            .filter(Utilisateur.id_util == contact.id_util)
            .first()
        )

        if technician is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Technician user not found",
            )

        if technician.role.nom_role.lower() != RoleName.TECHNICIEN:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The selected user is not a technician",
            )

    new_contact = IncidentContact(
        id_incident=id_incident,
        contact_type=contact.contact_type,
        id_util=contact.id_util,
        external_contact_name=contact.external_contact_name,
    )

    db.add(new_contact)
    commit_or_409(db)
    db.refresh(new_contact)
    return new_contact

@app.get("/incidents/{id_incident}/contacts",
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
            detail="Incident not found",
        )

    return (
        db.query(IncidentContact)
        .filter(
            IncidentContact.id_incident == id_incident
        )
        .order_by(
            IncidentContact.contacted_at.asc(),
            IncidentContact.id_contact.asc(),
        )
        .all()
    )

# Authentication
@app.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.email == credentials.email).first()
    if user is None or not pwd_context.verify(credentials.mot_de_passe, user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(cast(int, user.id_util))
    now = datetime.now(timezone.utc)
    new_session = SessionModel(
        id_util=user.id_util,
        token=hash_token(token),
        date_creation=now,
        date_expiration=now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    db.add(new_session)
    commit_or_409(db, "Could not create authentication session")
    set_session_cookie(response, token)
    return LoginResponse(authenticated=True)
# bearer represent the way the token is sent in the Authorization header of HTTP requests. The client includes the token in the header as follows: "Authorization


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


# Returns the current user's information based on the provided JWT token. 
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
        "notifications_read_at": current_user.notifications_read_at,
    }


@app.post("/notifications/read", response_model=NotificationReadOut)
def mark_notifications_read(
    payload: NotificationReadRequest | None = None,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        get_current_user
    ),
):
    now = datetime.now(
        timezone.utc
    )

    requested_read_at = (
        payload.read_at
        if payload is not None
        and payload.read_at is not None
        else now
    )

    if (
        requested_read_at.tzinfo
        is None
    ):
        requested_read_at = (
            requested_read_at.replace(
                tzinfo=timezone.utc
            )
        )
    else:
        requested_read_at = (
            requested_read_at.astimezone(
                timezone.utc
            )
        )

    # Never let a client move the read cursor into the future.
    target_read_at = min(
        requested_read_at,
        now,
    )

    current_read_at = (
        current_user.notifications_read_at
    )

    if current_read_at is not None:
        if (
            current_read_at.tzinfo
            is None
        ):
            current_read_at = (
                current_read_at.replace(
                    tzinfo=timezone.utc
                )
            )
        else:
            current_read_at = (
                current_read_at.astimezone(
                    timezone.utc
                )
            )

        # The cursor must only move forward.
        target_read_at = max(
            target_read_at,
            current_read_at,
        )

    setattr(
        current_user,
        "notifications_read_at",
        target_read_at,
    )

    commit_or_409(
        db,
        "Could not update notification state",
    )

    return {
        "read_at":
            target_read_at,
    }


# WebSocket endpoint - streams machine status updates
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
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
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
async def websocket_incidents(
    websocket: WebSocket,
):
    if (
        len(
            incident_manager.active_connections
        )
        >= incident_manager.MAX_CONNECTIONS
    ):
        await websocket.close(code=1013)
        return

    token = websocket.cookies.get(
        SESSION_COOKIE_NAME
    )

    if not token:
        await websocket.close(code=1008)
        return

    db = SessionLocal()

    try:
        _resolve_user_from_token(
            token,
            db,
        )
    except HTTPException:
        await websocket.close(code=1008)
        return
    finally:
        db.close()

    await websocket.accept()

    incident_manager.active_connections.append(
        websocket
    )

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
                _resolve_user_from_token(
                    token,
                    db,
                )
            except HTTPException:
                await websocket.close(
                    code=1008
                )
                return
            finally:
                db.close()

    except WebSocketDisconnect:
        pass

    finally:
        incident_manager.disconnect(
            websocket
        )