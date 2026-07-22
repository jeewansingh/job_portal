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
    # Match score (only if user is logged in)
    match_score: Optional[float] = None


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


class RecommendedJobItem(BaseModel):
    """Schema for recommended job with match score"""
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
    # Company info
    company_name: str
    company_logo_url: Optional[str] = None
    # Skills
    skills: List[SkillInfo] = []
    # Recommendation specific fields
    match_score: float
    matched_skills: List[str] = []
    score_breakdown: Optional[dict] = None


class RecommendedJobsResponse(BaseModel):
    """Schema for recommended jobs paginated response"""
    jobs: List[RecommendedJobItem]
    total: int
    skip: int
    limit: int


class SimilarJobItem(BaseModel):
    """Schema for similar job (KNN-based)"""
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
    # Company info
    company_name: str
    company_logo_url: Optional[str] = None
    # Skills
    skills: List[SkillInfo] = []
    # Similarity score
    match_score: float


class SimilarJobsResponse(BaseModel):
    """Schema for similar jobs response"""
    jobs: List[SimilarJobItem]
    total: int


class CategoryItem(BaseModel):
    """Schema for job category with count"""
    category: str
    job_count: int


class CategoriesResponse(BaseModel):
    """Schema for categories list response"""
    categories: List[CategoryItem]
    total: int
