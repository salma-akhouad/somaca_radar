import os
import hashlib
from datetime import datetime, timedelta, timezone
import jwt  # PyJWT
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models import Utilisateur, Session as SessionModel


ALGORITHM = "HS256" # The algorithm used to sign the JWT. HS256 is a symmetric algorithm that uses a secret key for both signing and verification.
ACCESS_TOKEN_EXPIRE_MINUTES = 480

_secret_key = os.getenv("JWT_SECRET_KEY")
if not _secret_key:
    raise RuntimeError("JWT_SECRET_KEY environment variable is missing")

SECRET_KEY: str = _secret_key

def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM) # jwt.encode() Encode both payload and header (that creates it automatically) using Base64URL encoding then creates the signature and returns the JWT as a string = jwt token. 

# Bearer places the token in the Authorization header
bearer_scheme = HTTPBearer()  # HTTPBearer extracts the token from the Authorization header

 
# this function receives a token that another function has already extracted and do validate the token, the session and retrieve the user.
def _resolve_user_from_token(token: str, db: Session) -> Utilisateur:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # this line receives the encoded JWT token, decodes it and verifies its signature using the secret key and the specified algorithm then compares it with the signature created at first in the server. If the signature is valid, it returns the payload (claims) of the token as a dictionary. 
        user_id = payload.get("sub")
        if user_id is None: # The token may be invalid because it does not contain a user ID because the token was tampered with or the payload was not created correctly.
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired, please log in again")
    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

    token_hash = hashlib.sha256(token.encode()).hexdigest() # This line takes the token string, encodes it to bytes (.encode()), hashes it using SHA-256, that hashlib.sha256 means to create a new SHA-256 hash object to hash the data, then .hexdigest() returns the hexadecimal representation of the hash. This is done to securely store and compare the token in the database without exposing the actual token value as we did when we first created it.
    session = db.query(SessionModel).filter(
        SessionModel.token == token_hash,
        SessionModel.date_expiration > datetime.now(timezone.utc) # timezone.utc ensures that the comparison is done in UTC time AKA Coordinated Universal Time, which can handle time zones and daylight saving time changes correctly for each user, and ensures that the expiration check is accurate regardless of the server's local time zone.
    ).first()
    if session is None:
        raise HTTPException(status_code=401, detail="Session expired or revoked")

    user = db.query(Utilisateur).filter(Utilisateur.id_util == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user

# This function is only used by HTTP endpoints to get the current user from the token in the Authorization header. 
# It uses the HTTPBearer dependency to extract the token from the header, then calls _resolve_user_from_token to validate the token and retrieve the user.
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Utilisateur:
    return _resolve_user_from_token(credentials.credentials, db)


class RoleName:
    SUPERVISEUR = "superviseur"
    TECHNICIEN = "technicien"
    ADMINISTRATEUR = "administrateur"


# Role-based access control (RBAC) dependency
def require_role(*allowed_roles: str): # allowed_roles is a tuple of strings representing the roles that are allowed to access the endpoint.
    def role_checker(current_user: Utilisateur = Depends(get_current_user)) -> Utilisateur:
        if current_user.role.nom_role.lower() not in [r.lower() for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user
    return role_checker