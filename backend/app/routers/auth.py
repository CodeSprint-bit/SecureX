
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Officer, Checkpost
from app.schemas import OfficerRegister, OfficerLogin, OfficerProfile
from app.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

bearer_scheme = HTTPBearer(auto_error=False)


# --------------------------------------------------
# AUTHENTICATION DEPENDENCY
# --------------------------------------------------

def get_current_officer(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Officer:

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
        officer_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    officer = (
        db.query(Officer)
        .filter(Officer.id == officer_id)
        .first()
    )

    if officer is None or not officer.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Officer account not found or disabled.",
        )

    # Prototype: pending accounts can access the application.
    # Disabled accounts are still blocked.
    return officer


# --------------------------------------------------
# OFFICER REGISTRATION
# --------------------------------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_officer(
    details: OfficerRegister,
    db: Session = Depends(get_db),
):
    email = str(details.email).strip().lower()
    officer_id = details.officer_id.strip()

    # Check email separately.
    existing_email = (
        db.query(Officer)
        .filter(Officer.email == email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already registered. Please log in or use another email.",
        )

    # Check Officer ID separately.
    existing_officer_id = (
        db.query(Officer)
        .filter(Officer.officer_id == officer_id)
        .first()
    )

    if existing_officer_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Officer ID is already registered. Please use another Officer ID.",
        )

    # Validate checkpost.
    checkpost = (
        db.query(Checkpost)
        .filter(
            Checkpost.id == details.checkpost_id,
            Checkpost.is_active.is_(True),
        )
        .first()
    )

    if checkpost is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select a valid active checkpost.",
        )

    officer = Officer(
        full_name=details.full_name.strip(),
        officer_id=officer_id,
        email=email,
        password_hash=hash_password(details.password),
        designation=details.designation.strip(),
        checkpost_id=checkpost.id,
        account_status="pending",
        is_active=True,
        is_admin=False,
    )

    db.add(officer)

    try:
        db.commit()
        db.refresh(officer)

    except IntegrityError as exc:
        db.rollback()

        # Identify the database constraint when possible.
        error_text = str(exc.orig).lower()

        if "email" in error_text:
            message = "This email is already registered."
        elif "officer_id" in error_text:
            message = "This Officer ID is already registered."
        else:
            message = (
                "Registration failed because of a database constraint. "
                "Check the email, Officer ID, and database fields."
            )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
        )

    return {
        "message": "Registration successful. You can now log in.",
        "officer_id": officer.officer_id,
        "account_status": officer.account_status,
    }


# --------------------------------------------------
# OFFICER LOGIN
# --------------------------------------------------

@router.post("/login")
def login_officer(
    details: OfficerLogin,
    db: Session = Depends(get_db),
):
    email = str(details.email).strip().lower()

    officer = (
        db.query(Officer)
        .filter(Officer.email == email)
        .first()
    )

    # Validate credentials.
    if officer is None or not verify_password(
        details.password,
        officer.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not officer.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled.",
        )

    # No email verification or approval requirement.
    token = create_access_token(officer.id)

    checkpost_data = None

    if officer.checkpost:
        checkpost_data = {
            "id": officer.checkpost.id,
            "name": officer.checkpost.name,
            "address": officer.checkpost.address,
        }

    return {
        "access_token": token,
        "token_type": "bearer",
        "officer": {
            "id": officer.id,
            "officer_id": officer.officer_id,
            "full_name": officer.full_name,
            "email": officer.email,
            "designation": officer.designation,
            "account_status": officer.account_status,
            "is_admin": officer.is_admin,
            "checkpost_id": officer.checkpost_id,
            "checkpost": checkpost_data,
        },
    }


# --------------------------------------------------
# CURRENT OFFICER PROFILE
# --------------------------------------------------

@router.get("/me", response_model=OfficerProfile)
def get_my_profile(
    officer: Officer = Depends(get_current_officer),
):
    return officer
