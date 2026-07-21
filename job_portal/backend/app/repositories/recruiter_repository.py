from sqlalchemy.orm import Session
from typing import Optional

from app.models.recruiter import Recruiter


def get_recruiter_by_email(db: Session, work_email: str) -> Optional[Recruiter]:
    """Get recruiter by work email"""
    return db.query(Recruiter).filter(Recruiter.work_email == work_email).first()


def get_recruiter_by_id(db: Session, recruiter_id: int) -> Optional[Recruiter]:
    """Get recruiter by ID"""
    return db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()


def create_recruiter(db: Session, recruiter_data: dict) -> Recruiter:
    """Create a new recruiter"""
    recruiter = Recruiter(**recruiter_data)
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)
    return recruiter


def update_recruiter(db: Session, recruiter_id: int, updates: dict) -> Optional[Recruiter]:
    """Update recruiter information"""
    recruiter = get_recruiter_by_id(db, recruiter_id)
    if not recruiter:
        return None
    
    for key, value in updates.items():
        if hasattr(recruiter, key):
            setattr(recruiter, key, value)
    
    db.commit()
    db.refresh(recruiter)
    return recruiter
