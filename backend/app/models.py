from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Checkpost(Base):
    __tablename__ = "checkposts"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), unique=True, nullable=False, index=True)
    address = Column(String(300), nullable=False)
    latitude = Column(String(30), nullable=True)
    longitude = Column(String(30), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now)

    officers = relationship("Officer", back_populates="checkpost")
    verifications = relationship(
        "Verification",
        back_populates="checkpost",
    )


class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True)

    officer_id = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)

    # Store a password hash here, never the original password.
    password_hash = Column(String(255), nullable=False)

    designation = Column(String(100), nullable=False)

    # The officer can request an assignment during registration.
    # An administrator must approve the account and assignment.
    checkpost_id = Column(
        Integer,
        ForeignKey("checkposts.id"),
        nullable=True,
    )

    account_status = Column(
        String(30),
        default="pending",
        nullable=False,
    )

    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now)

    checkpost = relationship("Checkpost", back_populates="officers")

    verifications = relationship(
        "Verification",
        back_populates="officer",
    )


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)

    verification_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # The authenticated officer who performed the verification.
    officer_id = Column(
        Integer,
        ForeignKey("officers.id"),
        nullable=False,
    )

    # The backend will populate this from the officer's approved assignment.
    # It will not accept an arbitrary checkpost chosen during verification.
    checkpost_id = Column(
        Integer,
        ForeignKey("checkposts.id"),
        nullable=False,
    )

    document_type = Column(String(100), nullable=False)
    original_filename = Column(String(255), nullable=False)

    status = Column(
        String(50),
        default="pending",
        nullable=False,
    )

    ocr_text = Column(Text, nullable=True)
    review_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now)

    officer = relationship("Officer", back_populates="verifications")
    checkpost = relationship("Checkpost", back_populates="verifications")
    
class CaseReport(Base):
    __tablename__ = "case_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(
        String(30), unique=True, nullable=False, index=True
    )

    # The authenticated officer who submitted the report.
    officer_id = Column(
        Integer,
        ForeignKey("officers.id"),
        nullable=False,
        index=True,
    )

    case_type = Column(String(80), nullable=False)
    description = Column(Text, nullable=False)

    # Incident location supplied by the reporting officer.
    latitude = Column(String(30), nullable=True)
    longitude = Column(String(30), nullable=True)
    location_description = Column(String(300), nullable=True)

    # Workflow status, not a determination of guilt.
    status = Column(
        String(30),
        default="Submitted",
        nullable=False,
        index=True,
    )

    created_at = Column(DateTime(timezone=True), default=utc_now)

    officer = relationship("Officer")
