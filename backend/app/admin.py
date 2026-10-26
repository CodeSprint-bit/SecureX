
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Checkpost, Officer, Verification
from app.routers.auth import get_current_officer


router = APIRouter(
    prefix="/api/admin",
    tags=["Administration"],
)


def require_admin(
    current_officer: Officer = Depends(get_current_officer),
):
    if not current_officer.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    if current_officer.account_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator account is not approved.",
        )

    if not current_officer.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required.",
        )

    return current_officer


@router.get("/pending-officers")
def get_pending_officers(
    db: Session = Depends(get_db),
    admin: Officer = Depends(require_admin),
):
    officers = (
        db.query(Officer)
        .options(joinedload(Officer.checkpost))
        .filter(
            Officer.is_admin.is_(False),
            Officer.account_status == "pending",
        )
        .order_by(Officer.created_at.asc())
        .all()
    )

    return [
        {
            "officer_id": officer.officer_id,
            "full_name": officer.full_name,
            "email": officer.email,
            "designation": officer.designation,
            "checkpost_id": officer.checkpost_id,
            "checkpost_name": (
                officer.checkpost.name if officer.checkpost else None
            ),
            "account_status": officer.account_status,
            "created_at": (
                officer.created_at.isoformat()
                if officer.created_at else None
            ),
        }
        for officer in officers
    ]


@router.post("/officers/{officer_id}/approve")
def approve_officer(
    officer_id: str,
    db: Session = Depends(get_db),
    admin: Officer = Depends(require_admin),
):
    officer = (
        db.query(Officer)
        .filter(Officer.officer_id == officer_id)
        .first()
    )

    if officer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Officer not found.",
        )

    if officer.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrator accounts cannot be approved here.",
        )

    if officer.account_status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Officer is already approved.",
        )

    if not officer.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This officer account is inactive.",
        )

    if not officer.checkpost_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assign a checkpost before approving this officer.",
        )

    checkpost = (
        db.query(Checkpost)
        .filter(Checkpost.id == officer.checkpost_id)
        .first()
    )

    if checkpost is None or not checkpost.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The assigned checkpost does not exist or is inactive.",
        )

    officer.account_status = "approved"

    try:
        db.commit()
        db.refresh(officer)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not approve the officer.",
        )

    return {
        "message": "Officer approved successfully.",
        "officer_id": officer.officer_id,
        "account_status": officer.account_status,
        "checkpost_id": officer.checkpost_id,
        "checkpost_name": checkpost.name,
    }


@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    admin: Officer = Depends(require_admin),
):
    total_checkposts = db.query(Checkpost).count()

    active_checkposts = (
        db.query(Checkpost)
        .filter(Checkpost.is_active.is_(True))
        .count()
    )

    total_officers = (
        db.query(Officer)
        .filter(Officer.is_admin.is_(False))
        .count()
    )

    pending_officers = (
        db.query(Officer)
        .filter(
            Officer.is_admin.is_(False),
            Officer.account_status == "pending",
        )
        .count()
    )

    total_activities = db.query(Verification).count()

    activity_counts = dict(
        db.query(
            Verification.checkpost_id,
            func.count(Verification.id),
        )
        .group_by(Verification.checkpost_id)
        .all()
    )

    pending_activity_counts = dict(
        db.query(
            Verification.checkpost_id,
            func.count(Verification.id),
        )
        .filter(func.lower(Verification.status) == "pending")
        .group_by(Verification.checkpost_id)
        .all()
    )

    officer_counts = dict(
        db.query(
            Officer.checkpost_id,
            func.count(Officer.id),
        )
        .filter(
            Officer.is_admin.is_(False),
            Officer.is_active.is_(True),
            Officer.account_status == "approved",
        )
        .group_by(Officer.checkpost_id)
        .all()
    )

    checkposts = (
        db.query(Checkpost)
        .order_by(Checkpost.name.asc())
        .all()
    )

    return {
        "total_checkposts": total_checkposts,
        "active_checkposts": active_checkposts,
        "total_officers": total_officers,
        "pending_officers": pending_officers,
        "total_activities": total_activities,
        "checkposts": [
            {
                "id": post.id,
                "name": post.name,
                "location": post.address,
                "is_active": post.is_active,
                "total_activities": activity_counts.get(post.id, 0),
                "pending_activities": pending_activity_counts.get(
                    post.id, 0
                ),
                "officer_count": officer_counts.get(post.id, 0),
            }
            for post in checkposts
        ],
    }
