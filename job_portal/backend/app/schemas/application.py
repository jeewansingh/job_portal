from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    applied_at: datetime

    class Config:
        from_attributes = True


class ApplicationWithJobResponse(BaseModel):
    """Application with basic job info for My Applications page."""
    id: int
    job_id: int
    status: str
    applied_at: datetime
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    company_logo_url: Optional[str] = None

    class Config:
        from_attributes = True


class ApplicationStatusResponse(BaseModel):
    """Returned when checking whether a user already applied."""
    applied: bool
    status: Optional[str] = None  # None when not applied
