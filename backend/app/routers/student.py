from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, dependencies
from ..database import get_db
from typing import List

router = APIRouter()

@router.get("/dashboard", response_model=dict)
def get_student_dashboard(
    current_user: models.User = Depends(dependencies.require_role([models.RoleEnum.student])),
    db: Session = Depends(get_db)
):
    attendances = db.query(models.Attendance).filter(models.Attendance.student_id == current_user.id).all()
    out = {
        "student": current_user,
        "attendances": attendances,
        "qr_code_id": current_user.qr_code_id,
        "metrics": {
            "total_classes": len(attendances),
            "present_count": len([a for a in attendances if a.status == models.AttendanceStatusEnum.PRESENT]),
            "absent_count": len([a for a in attendances if a.status == models.AttendanceStatusEnum.ABSENT])
        }
    }
    return out

@router.post("/leave")
def request_leave(
    reason: str,
    start_date: str,
    end_date: str,
    current_user: models.User = Depends(dependencies.require_role([models.RoleEnum.student])),
    db: Session = Depends(get_db)
):
    # Just a mock endpoint for prototype
    return {"status": "success", "message": "Leave requested"}
