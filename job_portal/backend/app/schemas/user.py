from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


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


class SkillDetail(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
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
    skills: List[SkillDetail] = []
    created_at: datetime
    updated_at: datetime
    is_active: bool

    @staticmethod
    def from_orm_with_skills(user):
        """Convert User ORM object to response with skills"""
        # Extract skill details from user_skills relationship
        skills = [
            SkillDetail(id=user_skill.skill.id, name=user_skill.skill.name)
            for user_skill in user.skills
        ]
        
        return UserProfileResponse(
            id=user.id,
            full_name=user.full_name,
            gender=user.gender,
            date_of_birth=user.date_of_birth,
            phone=user.phone,
            email=user.email,
            address=user.address,
            education=user.education,
            experience_years=user.experience_years,
            desired_position=user.desired_position,
            preferred_job_type=user.preferred_job_type,
            portfolio_link=user.portfolio_link,
            resume_url=user.resume_url,
            profile_picture_url=user.profile_picture_url,
            skills=skills,
            created_at=user.created_at,
            updated_at=user.updated_at,
            is_active=user.is_active,
        )

    class Config:
        from_attributes = True
