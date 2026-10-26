from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Officer
from app.routers.auth import get_current_officer

router = APIRouter(
    prefix="/api/admin",
    tags=["Administration"],
)


def require_admin(
    officer: Officer = Depends(get_current_officer),
) -> Officer:
    if not officer.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Administrator access required.",
        )

    return officer


@router.get("/pending-officers")
def list_pending_officers(
    admin: Officer = Depends(require_admin),
    db: Session = Depends(get_db),
):
    officers = (
        db.query(Officer)
        .filter(Officer.account_status == "pending")
        .order_by(Officer.created_at.asc())
        .all()
    )

    return [
        {
            "id": officer.id,
            "officer_id": officer.officer_id,
            "full_name": officer.full_name,
            "email": officer.email,
            "designation": officer.designation,
            "requested_checkpost_id": officer.checkpost_id,
        }
        for officer in officers
    ]


@router.post("/officers/{officer_id}/approve")
def approve_officer(
    officer_id: int,
    admin: Officer = Depends(require_admin),
    db: Session = Depends(get_db),
):
    officer = (
        db.query(Officer)
        .filter(Officer.id == officer_id)
        .first()
    )

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer not found.",
        )

    if not officer.is_active:
        raise HTTPException(
            status_code=400,
            detail="This officer account is disabled.",
        )

    if officer.account_status != "pending":
        raise HTTPException(
            status_code=409,
            detail="This officer is not awaiting approval.",
        )

    if officer.checkpost_id is None:
        raise HTTPException(
            status_code=400,
            detail="The officer needs a checkpost assignment.",
        )

    officer.account_status = "approved"

    db.commit()
    db.refresh(officer)

    return {
        "message": "Officer approved successfully.",
        "officer_id": officer.officer_id,
        "account_status": officer.account_status,
        "checkpost_id": officer.checkpost_id,
    }