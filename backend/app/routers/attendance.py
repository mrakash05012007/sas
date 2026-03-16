from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import random
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter()

@router.post("/face-recognition")
def process_face_attendance(
    request: schemas.FaceAuthRequest,
    current_user: models.User = Depends(dependencies.require_role([models.RoleEnum.student])),
    db: Session = Depends(get_db)
):
    # Mocking Face Recognition
    # In a real app we would decode request.image_base64 and use face_recognition library
    confidence = random.uniform(85.0, 99.8)
    success = random.choice([True, True, True, False]) # 75% success rate for demo
    
    if not success:
        return {"status": "error", "message": "Face not recognized clearly. Please try again or ask teacher for QR."}
        
    # Mark attendance
    attendance = models.Attendance(
        student_id=current_user.id,
        session_id=request.session_id,
        status=models.AttendanceStatusEnum.PRESENT,
        method=models.AttendanceMethodEnum.FACE,
        confidence_score=confidence,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(attendance)
    db.commit()
    return {"status": "success", "message": "Attendance marked via Face Recognition", "confidence": confidence}

@router.post("/qr-scan")
def process_qr_attendance(
    session_id: int,
    qr_data: str,
    current_user: models.User = Depends(dependencies.require_role([models.RoleEnum.student])),
    db: Session = Depends(get_db)
):
    # Validate QR
    if current_user.qr_code_id != qr_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid QR code for this user")
        
    session = db.query(models.ClassSession).filter(models.ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    if not session.qr_fallback_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR attendance is currently DISABLED for this session")
        
    if session.qr_expires_at and datetime.now(timezone.utc) > session.qr_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR attendance window has EXPIRED")
        
    existing_attendance = db.query(models.Attendance).filter(
        models.Attendance.student_id == current_user.id,
        models.Attendance.session_id == session_id
    ).first()
    
    if existing_attendance:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Attendance already marked")

    attendance = models.Attendance(
        student_id=current_user.id,
        session_id=session_id,
        status=models.AttendanceStatusEnum.PRESENT,
        method=models.AttendanceMethodEnum.QR_FALLBACK,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(attendance)
    
    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="MARKED_ATTENDANCE_QR",
        details=f"Student {current_user.full_name} marked attendance via QR Fallback for session {session_id}"
    )
    db.add(audit)
    
    db.commit()
    return {"status": "success", "message": "Attendance marked via QR Fallback"}
