from datetime import datetime, date
from typing import Optional, List
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


class RecruiterApplicationResponse(BaseModel):
    """Application details for recruiter with applicant info."""
    id: int
    user_id: int
    job_id: int
    job_title: str
    applicant_name: str
    applicant_email: str
    applicant_phone: str
    experience_years: float
    skills: List[str]
    resume_url: Optional[str]
    status: str
    applied_at: datetime
    match_score: int

    class Config:
        from_attributes = True


class ApplicantApplicationInfo(BaseModel):
    """Single application info for applicant profile."""
    application_id: int
    job_id: int
    job_title: str
    status: str
    applied_at: datetime

    class Config:
        from_attributes = True


class ApplicantProfileResponse(BaseModel):
    """Full applicant profile for recruiter view."""
    user_id: int
    full_name: str
    email: str
    phone: str
    gender: str
    date_of_birth: date
    age: Optional[int]
    address: str
    education: Optional[str]
    experience_years: float
    desired_position: Optional[str]
    preferred_job_type: Optional[str]
    portfolio_link: Optional[str]
    resume_url: Optional[str]
    profile_picture_url: Optional[str]
    skills: List[str]
    applications: List[ApplicantApplicationInfo]

    class Config:
        from_attributes = True


class UpdateApplicationStatusRequest(BaseModel):
    """Request body for updating application status."""
    status: str
