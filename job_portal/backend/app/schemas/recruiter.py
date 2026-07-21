from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RecruiterBase(BaseModel):
    """Base schema for recruiter"""
    full_name: str
    work_email: EmailStr
    company_name: str
    industry: str
    work_phone: str
    country: str
    city: str
    website: Optional[str] = None
    company_description: Optional[str] = None


class RecruiterCreate(RecruiterBase):
    """Schema for creating a recruiter"""
    password: str


class RecruiterResponse(RecruiterBase):
    """Schema for recruiter response"""
    id: int
    company_logo_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RecruiterProfileResponse(RecruiterBase):
    """Schema for recruiter profile response with all details"""
    id: int
    company_logo_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
