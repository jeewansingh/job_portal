from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import Form
from fastapi import UploadFile

from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.user import UserResponse
from app.services.user_service import register_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post(
    "/register",
    response_model=UserResponse
)
async def register(

    full_name: str = Form(...),

    gender: str = Form(...),

    date_of_birth: str = Form(...),

    phone: str = Form(...),

    email: str = Form(...),

    password: str = Form(...),

    address: str = Form(...),

    education: Optional[str] = Form(None),

    experience_years: float = Form(0),

    desired_position: Optional[str] = Form(None),

    preferred_job_type: Optional[str] = Form(None),

    portfolio_link: Optional[str] = Form(None),

    skill_ids: Optional[List[int]] = Form(None),

    resume: Optional[UploadFile] = File(None),

    profile_picture: Optional[UploadFile] = File(None),

    db: Session = Depends(get_db)

):
    """
    Register a new user with profile information, resume, and profile picture.
    
    - Date format: YYYY-MM-DD (e.g., 1995-05-15)
    - Skill IDs: Pass skill IDs as integers (e.g., skill_ids=1, skill_ids=2)
    - Resume: PDF only (max 10MB)
    - Profile Picture: JPG, JPEG, PNG (max 5MB)
    - All files and skills are optional
    """

    return await register_user(
        db=db,
        full_name=full_name,
        gender=gender,
        date_of_birth=date_of_birth,
        phone=phone,
        email=email,
        password=password,
        address=address,
        education=education,
        experience_years=experience_years,
        desired_position=desired_position,
        preferred_job_type=preferred_job_type,
        portfolio_link=portfolio_link,
        skill_ids=skill_ids,
        resume=resume,
        profile_picture=profile_picture,
    )