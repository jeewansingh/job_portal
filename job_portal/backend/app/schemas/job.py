from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


class JobBase(BaseModel):
    """Base schema for job"""
    job_title: str
    category: str
    employment_type: str
    experience_years: Decimal
    salary_per_month: Optional[str] = None
    openings: int
    location: str
    job_description: str
    job_specification: str
    deadline: date


class JobCreate(JobBase):
    """Schema for creating a job"""
    pass


class JobResponse(JobBase):
    """Schema for job response"""
    id: int
    recruiter_id: int
    created_at: datetime
    updated_at: datetime
    is_closed: bool
    is_active: bool

    class Config:
        from_attributes = True


class JobDetailsResponse(BaseModel):
    """Schema for detailed job view with company and skills"""
    id: int
    job_title: str
    category: str
    employment_type: str
    experience_years: Decimal
    salary_per_month: Optional[str] = None
    openings: int
    location: str
    job_description: str
    job_specification: str
    deadline: date
    created_at: datetime
    updated_at: datetime
    is_closed: bool
    is_active: bool
    # Company info
    company_name: str
    company_logo_url: Optional[str] = None
    company_description: Optional[str] = None
    # Skills
    skills: List[SkillInfo] = []


class JobListItem(BaseModel):
    """Schema for job list item (simplified)"""
    id: int
    job_title: str
    category: str
    employment_type: str
    location: str
    openings: int
    deadline: date
    created_at: datetime
    is_closed: bool
    is_active: bool

    class Config:
        from_attributes = True


class SkillInfo(BaseModel):
    """Schema for skill info in browse jobs"""
    id: int
    name: str
    
    class Config:
        from_attributes = True


class BrowseJobItem(BaseModel):
    """Schema for browse jobs list with company and skills info"""
    id: int
    job_title: str
    category: str
    employment_type: str
    experience_years: Decimal
    salary_per_month: Optional[str] = None
    location: str
    job_description: str
    job_specification: str
    deadline: date
    created_at: datetime
    is_closed: bool
    is_active: bool
    # Company info from recruiter
    company_name: str
    company_logo_url: Optional[str] = None
    # Skills
    skills: List[SkillInfo] = []
    
    class Config:
        from_attributes = True


class BrowseJobsResponse(BaseModel):
    """Schema for browse jobs paginated response"""
    jobs: List[BrowseJobItem]
    total: int
    skip: int
    limit: int
