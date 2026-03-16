from app.database import SessionLocal, engine
from app import models, dependencies
import uuid
import datetime

# Create tables
models.Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    if db.query(models.User).first():
        print("Database already seeded")
        return
        
    print("Seeding database...")
    
    # 1. Users
    admin_user = models.User(
        full_name="System Admin",
        email="admin@school.edu",
        hashed_password=dependencies.get_password_hash("admin123"),
        role=models.RoleEnum.admin
    )
    
    teacher_user = models.User(
        full_name="Prof. Alan Turing",
        email="teacher@school.edu",
        hashed_password=dependencies.get_password_hash("teacher123"),
        role=models.RoleEnum.teacher
    )
    
    student_user1 = models.User(
        full_name="Alice Hacker",
        email="alice@school.edu",
        hashed_password=dependencies.get_password_hash("student123"),
        role=models.RoleEnum.student,
        enrollment_id="CS-2026-001",
        department="Computer Science",
        year=3,
        section="A",
        qr_code_id=str(uuid.uuid4())
    )
    
    student_user2 = models.User(
        full_name="Bob Builder",
        email="bob@school.edu",
        hashed_password=dependencies.get_password_hash("student123"),
        role=models.RoleEnum.student,
        enrollment_id="CS-2026-002",
        department="Computer Science",
        year=3,
        section="A",
        qr_code_id=str(uuid.uuid4())
    )
    
    db.add_all([admin_user, teacher_user, student_user1, student_user2])
    db.commit()
    
    # 2. Subjects
    subj1 = models.Subject(name="Data Structures", code="CS201")
    subj2 = models.Subject(name="AI & Machine Learning", code="CS401")
    db.add_all([subj1, subj2])
    db.commit()
    
    # 3. Class Sessions
    session1 = models.ClassSession(
        subject_id=subj1.id,
        teacher_id=teacher_user.id,
        is_active=True,
        qr_fallback_enabled=False
    )
    db.add(session1)
    db.commit()
    
    # 4. Mock Attendance
    att1 = models.Attendance(
        student_id=student_user1.id,
        session_id=session1.id,
        status=models.AttendanceStatusEnum.PRESENT,
        method=models.AttendanceMethodEnum.FACE,
        confidence_score=98.5
    )
    db.add(att1)
    db.commit()
    
    print("Seeding complete.")
    db.close()

if __name__ == "__main__":
    seed()
