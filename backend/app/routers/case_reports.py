
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CaseReport, Officer
from app.routers.auth import get_current_officer
from app.routers.admin import require_admin


router = APIRouter(prefix="/api/case-reports", tags=["Case Reports"])

CASE_TYPES = {
    "Suspicious Activity",
    "Theft",
    "Accident",
    "Missing Person",
    "Public Safety",
    "Cybercrime",
    "Other",
}

REPORT_STATUSES = {
    "Submitted",
    "Under Review",
    "Resolved",
    "Closed",
}


class CaseReportCreate(BaseModel):
    case_type: str = Field(min_length=1, max_length=80)
    description: str = Field(min_length=10, max_length=4000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    location_description: str | None = Field(
        default=None, max_length=300
    )

    @field_validator("case_type")
    @classmethod
    def validate_case_type(cls, value: str) -> str:
        value = value.strip()
        if value not in CASE_TYPES:
            raise ValueError("Choose a supported case category.")
        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 10:
            raise ValueError("Description must be at least 10 characters.")
        return value

    @field_validator("location_description")
    @classmethod
    def clean_location(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


def serialize_report(report: CaseReport) -> dict:
    return {
        "id": report.id,
        "report_number": report.report_number,
        "case_type": report.case_type,
        "description": report.description,
        "latitude": (
            float(report.latitude) if report.latitude is not None else None
        ),
        "longitude": (
            float(report.longitude) if report.longitude is not None else None
        ),
        "location_description": report.location_description,
        "status": report.status,
        "created_at": (
            report.created_at.isoformat()
            if report.created_at else None
        ),
        "officer": (
            report.officer.full_name if report.officer else "Unknown"
        ),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_case_report(
    payload: CaseReportCreate,
    db: Session = Depends(get_db),
    officer: Officer = Depends(get_current_officer),
):
    report = CaseReport(
        report_number=f"SX-CASE-{uuid4().hex[:10].upper()}",
        officer_id=officer.id,
        case_type=payload.case_type,
        description=payload.description,
        latitude=(
            str(payload.latitude) if payload.latitude is not None else None
        ),
        longitude=(
            str(payload.longitude) if payload.longitude is not None else None
        ),
        location_description=payload.location_description,
        status="Submitted",
        created_at=datetime.now(timezone.utc),
    )

    db.add(report)
    try:
        db.commit()
        db.refresh(report)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save the case report.",
        )

    return serialize_report(report)


@router.get("")
def list_case_reports(
    db: Session = Depends(get_db),
    officer: Officer = Depends(get_current_officer),
):
    query = db.query(CaseReport)

    # Officers see only their own reports. Admins can see all.
    if not officer.is_admin:
        query = query.filter(CaseReport.officer_id == officer.id)

    reports = query.order_by(CaseReport.created_at.desc()).all()

    return {
        "total": len(reports),
        "reports": [serialize_report(report) for report in reports],
    }


class CaseReportStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        value = value.strip()
        if value not in REPORT_STATUSES:
            raise ValueError("Unsupported report status.")
        return value


@router.patch("/{report_id}/status")
def update_case_report_status(
    report_id: int,
    payload: CaseReportStatusUpdate,
    db: Session = Depends(get_db),
    admin: Officer = Depends(require_admin),
):
    report = (
        db.query(CaseReport)
        .filter(CaseReport.id == report_id)
        .first()
    )

    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")

    report.status = payload.status
    db.commit()
    db.refresh(report)

    return serialize_report(report)
