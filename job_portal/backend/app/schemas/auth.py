from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """Schema for login request."""
    
    email: EmailStr
    password: str


class UserBasicInfo(BaseModel):
    """Basic user information returned after login."""
    
    id: int
    full_name: str
    email: str
    role: str  # "candidate" or "recruiter"
    profile_picture_url: Optional[str] = None
    preferred_job_type: Optional[str] = None
    company_name: Optional[str] = None  # For recruiters
    company_logo_url: Optional[str] = None  # For recruiters
    
    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Schema for login response."""
    
    access_token: str
    token_type: str
    user: UserBasicInfo
