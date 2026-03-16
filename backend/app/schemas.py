from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import RoleEnum, AttendanceStatusEnum, AttendanceMethodEnum

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[RoleEnum] = None

# User
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: RoleEnum

class UserCreate(UserBase):
    password: str
    enrollment_id: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    section: Optional[str] = None

class UserResponse(UserBase):
    id: int
    enrollment_id: Optional[str]
    department: Optional[str]
    year: Optional[int]
    section: Optional[str]
    face_encoding_id: Optional[str]
    qr_code_id: Optional[str]

    class Config:
        from_attributes = True

# Session
class ClassSessionResponse(BaseModel):
    id: int
    subject_id: int
    teacher_id: int
    start_time: datetime
    end_time: Optional[datetime]
    is_active: bool
    qr_fallback_enabled: bool
    qr_expires_at: Optional[datetime]

    class Config:
        from_attributes = True

# Attendance
class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    session_id: int
    timestamp: datetime
    status: AttendanceStatusEnum
    method: AttendanceMethodEnum

    class Config:
        from_attributes = True

# Face recognition mock
class FaceAuthRequest(BaseModel):
    image_base64: str
    session_id: int
