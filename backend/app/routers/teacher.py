from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter()

@router.get("/dashboard", response_model=dict)
def get_teacher_dashboard(
    current_user: models.User = Depends(dependencies.require_role([models.RoleEnum.teacher])),
    db: Session = Depends(get_db)
):
    sessions = db.query(models.ClassSession).filter(models.ClassSession.teacher_id == current_user.id).all()
    return {
        "teacher": current_user,
        "sessions": sessions
    }

@router.post("/session/{session_id}/enable_qr")
def enable_qr_fallback(
    session_id: int,
    reason: str,
    duration_minutes: int = 5,
    current_user: models.User = Depends(dependencies.require_role([models.RoleEnum.teacher, models.RoleEnum.admin])),
    db: Session = Depends(get_db)
):
    session = db.query(models.ClassSession).filter(models.ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.qr_fallback_enabled = True
    session.qr_fallback_reason = reason
    session.qr_enabled_at = datetime.now(timezone.utc)
    session.qr_expires_at = datetime.now(timezone.utc) + timedelta(minutes=duration_minutes)
    
    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="ENABLED_QR",
        details=f"Enabled QR for session {session_id} for {duration_minutes} min. Reason: {reason}"
    )
    db.add(audit)
    db.commit()
    db.refresh(session)
    return session
