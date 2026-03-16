from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Enum, Float
from sqlalchemy.orm import relationship
import enum
from datetime import datetime, timezone

from .database import Base

class RoleEnum(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class AttendanceMethodEnum(str, enum.Enum):
    FACE = "FACE"
    QR_FALLBACK = "QR_FALLBACK"
    MANUAL = "MANUAL"

class AttendanceStatusEnum(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.student)
    
    # Student specific
    enrollment_id = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    section = Column(String, nullable=True)
    face_encoding_id = Column(String, nullable=True) # Mock ID for prototype
    qr_code_id = Column(String, unique=True, nullable=True)

    # Relationships
    attendances = relationship("Attendance", back_populates="student")
    leave_requests = relationship("LeaveRequest", back_populates="student")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    code = Column(String, unique=True, index=True)
    sessions = relationship("ClassSession", back_populates="subject")

class ClassSession(Base):
    __tablename__ = "class_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)
    
    is_active = Column(Boolean, default=True)
    
    # QR Fallback logic
    qr_fallback_enabled = Column(Boolean, default=False)
    qr_fallback_reason = Column(String, nullable=True)
    qr_enabled_at = Column(DateTime, nullable=True)
    qr_expires_at = Column(DateTime, nullable=True)

    subject = relationship("Subject", back_populates="sessions")
    teacher = relationship("User", foreign_keys=[teacher_id])
    attendances = relationship("Attendance", back_populates="session")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("class_sessions.id"))
    
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(Enum(AttendanceStatusEnum), default=AttendanceStatusEnum.PRESENT)
    method = Column(Enum(AttendanceMethodEnum), default=AttendanceMethodEnum.FACE)
    confidence_score = Column(Float, nullable=True) # For face recog

    student = relationship("User", back_populates="attendances")
    session = relationship("ClassSession", back_populates="attendances")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    reason = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    
    student = relationship("User", back_populates="leave_requests")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # User who performed action
    action = Column(String) # e.g., "ENABLED_QR", "MANUAL_ATTENDANCE_OVERRIDE", "SUSPICIOUS_SCAN"
    details = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
