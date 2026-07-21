from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user_id, get_current_recruiter
from app.schemas.recruiter import RecruiterResponse, RecruiterProfileResponse
from app.services.recruiter_service import (
    register_recruiter,
    get_recruiter_profile,
    update_recruiter_profile
)

router = APIRouter(
    prefix="/recruiters",
    tags=["Recruiters"]
)


@router.post(
    "/register",
    response_model=RecruiterResponse
)
async def register(
    full_name: str = Form(...),
    work_email: str = Form(...),
    password: str = Form(...),
    company_name: str = Form(...),
    industry: str = Form(...),
    work_phone: str = Form(...),
    country: str = Form(...),
    city: str = Form(...),
    website: Optional[str] = Form(None),
    company_description: Optional[str] = Form(None),
    company_logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Register a new recruiter with company information.
    
    - Work Email: Must be unique
    - Company Logo: JPG, JPEG, PNG (max 5MB)
    - All fields except website, company_description, and company_logo are required
    """
    return await register_recruiter(
        db=db,
        full_name=full_name,
        work_email=work_email,
        password=password,
        company_name=company_name,
        industry=industry,
        work_phone=work_phone,
        country=country,
        city=city,
        website=website,
        company_description=company_description,
        company_logo=company_logo,
    )


@router.get(
    "/me/profile",
    response_model=RecruiterProfileResponse
)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Get current recruiter's profile.
    Uses JWT token to identify the recruiter - no recruiter_id in URL needed.
    
    Returns:
        Recruiter profile with company information
    """
    return await get_recruiter_profile(db=db, recruiter_id=current_user_id)


@router.put(
    "/me/profile",
    response_model=RecruiterProfileResponse
)
async def update_my_profile(
    full_name: str = Form(...),
    work_phone: str = Form(...),
    country: str = Form(...),
    city: str = Form(...),
    company_name: str = Form(...),
    industry: str = Form(...),
    website: Optional[str] = Form(None),
    company_description: Optional[str] = Form(None),
    company_logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Update current recruiter's profile.
    Uses JWT token to identify the recruiter - no recruiter_id in URL needed.
    
    - Company Logo: JPG, JPEG, PNG (max 5MB)
    - Logo is optional - only upload if changing
    """
    return await update_recruiter_profile(
        db=db,
        recruiter_id=current_user_id,
        full_name=full_name,
        work_phone=work_phone,
        country=country,
        city=city,
        company_name=company_name,
        industry=industry,
        website=website,
        company_description=company_description,
        company_logo=company_logo,
    )
