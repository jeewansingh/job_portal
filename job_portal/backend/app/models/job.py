from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.sql import func

from app.core.database import Base


class Job(Base):
    """Job model for job postings"""
    
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    job_title = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    employment_type = Column(String(50), nullable=False)
    experience_years = Column(Numeric(3, 1), default=0)
    salary_per_month = Column(String(50))
    openings = Column(Integer, nullable=False, default=1)
    location = Column(String(150), nullable=False)
    job_description = Column(Text, nullable=False)
    job_specification = Column(Text, nullable=False)
    deadline = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_closed = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
