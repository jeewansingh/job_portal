from datetime import datetime
from fastapi import HTTPException, UploadFile
from typing import List, Optional

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.skill_repository import SkillRepository
from app.repositories.user_skill_repository import UserSkillRepository
from app.utils.file_upload import save_resume, save_profile_picture


async def register_user(
    db,
    full_name: str,
    gender: str,
    date_of_birth: str,
    phone: str,
    email: str,
    password: str,
    address: str,
    education: Optional[str],
    experience_years: float,
    desired_position: Optional[str],
    preferred_job_type: Optional[str],
    portfolio_link: Optional[str],
    skill_ids: Optional[List[int]],
    resume: Optional[UploadFile],
    profile_picture: Optional[UploadFile],
):
    """
    Register a new user with all profile information including files.
    
    Args:
        db: Database session
        full_name: User's full name
        gender: User's gender
        date_of_birth: Date of birth (string format: YYYY-MM-DD)
        phone: Phone number
        email: Email address
        password: Plain password (will be hashed)
        address: User's address
        education: Education information
        experience_years: Years of experience
        desired_position: Desired job position
        preferred_job_type: Preferred job type
        portfolio_link: Portfolio link
        skill_ids: List of skill IDs (integers)
        resume: Resume PDF file (optional)
        profile_picture: Profile picture file (optional)
        
    Returns:
        The created user object
        
    Raises:
        HTTPException: If date format is invalid or skill IDs don't exist
    """
    
    # Save resume file if provided
    resume_url = await save_resume(resume)
    
    # Save profile picture if provided
    profile_picture_url = await save_profile_picture(profile_picture)
    
    # Convert date_of_birth string to date object
    try:
        dob = datetime.strptime(date_of_birth.strip(), "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format: '{date_of_birth}'. Expected format: YYYY-MM-DD (e.g., 1995-05-15)"
        )
    
    # Create user object
    user = User(
        full_name=full_name,
        gender=gender,
        date_of_birth=dob,
        phone=phone,
        email=email,
        password_hash=hash_password(password),
        address=address,
        education=education,
        experience_years=experience_years,
        desired_position=desired_position,
        preferred_job_type=preferred_job_type,
        portfolio_link=portfolio_link,
        resume_url=resume_url,
        profile_picture_url=profile_picture_url,
    )

    # Save user (flush only, no commit)
    user = UserRepository.create(db, user)

    # Save user's skills by skill IDs
    if skill_ids:
        # Remove duplicates and None values
        unique_skill_ids = list(set(filter(None, skill_ids)))
        
        if unique_skill_ids:
            # Verify all skill IDs exist before inserting
            valid_skill_ids = SkillRepository.verify_skill_ids(db, unique_skill_ids)
            
            if len(valid_skill_ids) != len(unique_skill_ids):
                invalid_ids = set(unique_skill_ids) - set(valid_skill_ids)
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid skill IDs: {sorted(list(invalid_ids))}"
                )
            
            # Insert user skills
            for skill_id in valid_skill_ids:
                UserSkillRepository.create(db, user.id, skill_id)

    db.commit()
    db.refresh(user)

    return user
