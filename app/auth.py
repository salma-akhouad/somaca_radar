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
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() in {
    "1",
    "true",
    "yes",
    "on",
}


class RoleName:
    OPERATEUR = "operateur_de_production"
    SUPERVISEUR = "superviseur"
    TECHNICIEN = "technicien"
    ADMINISTRATEUR = "administrateur"


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def hash_token(token: str) -> str:
    # Only the SHA-256 digest is persisted; the raw JWT stays in the HttpOnly cookie.
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
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session invalide.",
            )
        user_id = int(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Votre session a expiré. Veuillez vous reconnecter.",
        )
    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalide.",
        )

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Votre session a expiré ou a été révoquée.",
        )

    user = (
        db.query(Utilisateur)
        .filter(Utilisateur.id_util == user_id)
        .first()
    )

    if user is None or not user.actif:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ce compte n'est plus actif.",
        )

    return user


def get_current_token(request: Request) -> str:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise.",
        )
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

    session.date_revocation = datetime.now(timezone.utc)
    db.commit()
    return True


def require_role(*allowed_roles: str):
    normalized_roles = {role.lower() for role in allowed_roles}

    def role_checker(
        current_user: Utilisateur = Depends(get_current_user),
    ) -> Utilisateur:
        if current_user.role.nom_role.lower() not in normalized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à effectuer cette action.",
            )
        return current_user

    return role_checker
