import hashlib
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import Session as SessionModel
from .models import Utilisateur


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

_secret_key = os.getenv("JWT_SECRET_KEY")

if not _secret_key:
    raise RuntimeError(
        "JWT_SECRET_KEY environment variable is missing"
    )

SECRET_KEY: str = _secret_key

bearer_scheme = HTTPBearer()


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def hash_token(token: str) -> str:
    return hashlib.sha256(
        token.encode()
    ).hexdigest()


def _resolve_user_from_token(
    token: str,
    db: Session,
) -> Utilisateur:
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
                detail="Invalid token: missing user ID",
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired, please log in again",
        )

    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    token_hash = hash_token(token)
    now = datetime.now(timezone.utc)

    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.token == token_hash,
            SessionModel.date_expiration > now,
            SessionModel.date_revocation.is_(None),
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or revoked",
        )

    user = (
        db.query(Utilisateur)
        .filter(
            Utilisateur.id_util == int(user_id)
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    return user


def get_current_token(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
) -> str:
    return credentials.credentials


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> Utilisateur:
    return _resolve_user_from_token(
        credentials.credentials,
        db,
    )


def revoke_current_token_session(
    token: str,
    db: Session,
) -> bool:
    token_hash = hash_token(token)

    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.token == token_hash,
            SessionModel.date_revocation.is_(None),
        )
        .first()
    )

    if session is None:
        return False

    setattr(
        session,
        "date_revocation",
        datetime.now(timezone.utc),
    )

    db.commit()

    return True


class RoleName:
    SUPERVISEUR = "superviseur"
    TECHNICIEN = "technicien"
    ADMINISTRATEUR = "administrateur"


def require_role(*allowed_roles: str):
    def role_checker(
        current_user: Utilisateur = Depends(
            get_current_user
        ),
    ) -> Utilisateur:
        current_role = current_user.role.nom_role.lower()

        if current_role not in [
            role.lower()
            for role in allowed_roles
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission "
                    "to perform this action"
                ),
            )

        return current_user

    return role_checker