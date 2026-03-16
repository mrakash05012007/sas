from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter()

@router.get("/dashboard", response_model=dict)
def get_admin_dashboard(
    current_user: models.User = Depends(dependencies.require_role([models.RoleEnum.admin])),
    db: Session = Depends(get_db)
):
    users_count = db.query(models.User).count()
    sessions_count = db.query(models.ClassSession).count()
    qrs_enabled_count = db.query(models.ClassSession).filter(models.ClassSession.qr_fallback_enabled == True).count()
    return {
        "admin": current_user,
        "metrics": {
            "total_users": users_count,
            "total_sessions": sessions_count,
            "qr_fallbacks_used": qrs_enabled_count
        }
    }

@router.get("/audit_logs")
def get_audit_logs(
    current_user: models.User = Depends(dependencies.require_role([models.RoleEnum.admin])),
    db: Session = Depends(get_db)
):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(100).all()
