import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

password_hasher = PasswordHash.recommended()

# Development fallback only. Configure a private environment variable
# before deploying the application.
SECRET_KEY = os.getenv("CARECIRCLE_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "CARECIRCLE_SECRET_KEY must be configured before starting SecureX."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def hash_password(password: str) -> str:
    """Hash a password before storing it in the database."""
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Compare a supplied password with its stored hash."""
    return password_hasher.verify(password, password_hash)


def create_access_token(officer_id: int) -> str:
    """Create a short-lived JWT for an authenticated officer."""
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(officer_id),
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Validate a JWT and return its claims."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])