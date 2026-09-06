import hashlib
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from .database import get_db
from .models import Session as SessionModel
from .models import Utilisateur

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480
SESSION_COOKIE_NAME = "somaca_session"

_secret_key = os.getenv("JWT_SECRET_KEY")
if not _secret_key:
    raise RuntimeError("JWT_SECRET_KEY environment variable is missing")
SECRET_KEY = _secret_key

COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() in {"1","true","yes","on"}

def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="strict",
        path="/",
    )

def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        secure=COOKIE_SECURE,
        httponly=True,
        samesite="strict",
    )

def _resolve_user_from_token(token: str, db: Session) -> Utilisateur:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired, please log in again")
    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.token == hash_token(token),
            SessionModel.date_expiration > datetime.now(timezone.utc),
            SessionModel.date_revocation.is_(None),
        )
        .first()
    )
    if session is None:
        raise HTTPException(status_code=401, detail="Session expired or revoked")

    user = db.query(Utilisateur).filter(Utilisateur.id_util == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user

def get_current_token(request: Request) -> str:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication cookie is missing")
    return token

def get_current_user(
    token: str = Depends(get_current_token),
    db: Session = Depends(get_db),
) -> Utilisateur:
    return _resolve_user_from_token(token, db)

def revoke_current_token_session(token: str, db: Session) -> bool:
    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.token == hash_token(token),
            SessionModel.date_revocation.is_(None),
        )
        .first()
    )
    if session is None:
        return False
    setattr(session, "date_revocation", datetime.now(timezone.utc))
    db.commit()
    return True

class RoleName:
    SUPERVISEUR = "superviseur"
    TECHNICIEN = "technicien"
    ADMINISTRATEUR = "administrateur"

def require_role(*allowed_roles: str):
    def role_checker(current_user: Utilisateur = Depends(get_current_user)) -> Utilisateur:
        if current_user.role.nom_role.lower() not in [r.lower() for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user
    return role_checker
