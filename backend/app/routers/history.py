
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Verification, Officer
from app.routers.auth import get_current_officer


router = APIRouter(prefix="/api", tags=["Verification History"])


class CreateHistoryRequest(BaseModel):
    document_type: str = Field(min_length=1, max_length=100)
    original_filename: str = Field(min_length=1, max_length=255)
    status: str = Field(min_length=1, max_length=50)
    review_notes: str | None = Field(default=None, max_length=2000)


def serialize_record(record: Verification):
    # This is a workflow status, not an authenticity verdict.
    return {
        "id": record.id,
        "reference_id": record.verification_number,
        "filename": record.original_filename,
        "document_type": record.document_type,
        "date": (
            record.created_at.isoformat()
            if record.created_at
            else None
        ),
        "status": record.status,
        "risk_level": "Needs Review",
        "checkpost": (
            record.checkpost.name
            if record.checkpost
            else None
        ),
    }


@router.get("/history")
def get_verification_history(
    db: Session = Depends(get_db),
    officer: Officer = Depends(get_current_officer),
):
    query = db.query(Verification)

    if not officer.is_admin:
        query = query.filter(
            Verification.officer_id == officer.id
        )

    records = (
        query.order_by(Verification.created_at.desc())
        .all()
    )

    return {
        "total": len(records),
        "records": [serialize_record(record) for record in records],
    }


@router.post(
    "/history",
    status_code=status.HTTP_201_CREATED,
)
def create_verification_history(
    payload: CreateHistoryRequest,
    db: Session = Depends(get_db),
    officer: Officer = Depends(get_current_officer),
):
    # The prototype administrator has no real database identity.
    if not officer.id or not officer.checkpost_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Your officer account must have a database ID "
                "and an assigned checkpost to save a review."
            ),
        )

    checkpost = officer.checkpost

    if not checkpost or not checkpost.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your assigned checkpost is unavailable or inactive.",
        )

    allowed_statuses = {
        "pending",
        "review",
        "flagged",
        "inconclusive",
        "completed",
    }

    record_status = payload.status.strip().lower()

    if record_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unsupported preliminary review status.",
        )

    record = Verification(
        verification_number=f"SX-{uuid4().hex[:12].upper()}",
        officer_id=officer.id,
        checkpost_id=checkpost.id,
        document_type=payload.document_type.strip(),
        original_filename=payload.original_filename.strip(),
        status=record_status,
        # Save only a short summary; do not save the full OCR text.
        review_notes=payload.review_notes,
    )

    db.add(record)

    try:
        db.commit()
        db.refresh(record)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save the verification history record.",
        )

    return serialize_record(record)


@router.delete("/history/{record_id}")
def delete_verification_history(
    record_id: int,
    db: Session = Depends(get_db),
    officer: Officer = Depends(get_current_officer),
):
    query = db.query(Verification).filter(
        Verification.id == record_id
    )

    if not officer.is_admin:
        query = query.filter(
            Verification.officer_id == officer.id
        )

    record = query.first()

    if record is None:
        # Do not reveal whether another officer owns this record.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History record not found.",
        )

    db.delete(record)
    db.commit()

    return {"message": "History record deleted successfully."}
