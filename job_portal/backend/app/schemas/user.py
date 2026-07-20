from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class UserResponse(BaseModel):

    id: int

    full_name: str

    gender: str

    date_of_birth: date

    phone: str

    email: str

    address: str

    education: Optional[str] = None

    experience_years: float

    desired_position: Optional[str] = None

    preferred_job_type: Optional[str] = None

    portfolio_link: Optional[str] = None

    resume_url: Optional[str] = None

    profile_picture_url: Optional[str] = None

    created_at: datetime

    updated_at: datetime

    is_active: bool

    class Config:
        from_attributes = True
