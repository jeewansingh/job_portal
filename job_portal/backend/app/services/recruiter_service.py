from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from typing import Optional

from app.core.security import hash_password
from app.repositories.recruiter_repository import (
    create_recruiter,
    get_recruiter_by_email,
    get_recruiter_by_id,
    update_recruiter
)
from app.utils.file_upload import save_file


async def register_recruiter(
    db: Session,
    full_name: str,
    work_email: str,
    password: str,
    company_name: str,
    industry: str,
    work_phone: str,
    country: str,
    city: str,
    website: Optional[str] = None,
    company_description: Optional[str] = None,
    company_logo: Optional[UploadFile] = None,
):
    """
    Register a new recruiter with company information
    
    Args:
        db: Database session
        full_name: Recruiter's full name
        work_email: Work email (must be unique)
        password: Plain password (will be hashed)
        company_name: Company name
        industry: Industry type
        work_phone: Work phone number
        country: Country
        city: City
        website: Company website (optional)
        company_description: Company description (optional)
        company_logo: Company logo file (optional)
    
    Returns:
        Created recruiter object
    
    Raises:
        HTTPException: If email already exists or validation fails
    """
    
    # Check if email already exists
    existing_recruiter = get_recruiter_by_email(db, work_email)
    if existing_recruiter:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = hash_password(password)
    
    # Prepare recruiter data
    recruiter_data = {
        "full_name": full_name,
        "work_email": work_email,
        "password_hash": password_hash,
        "company_name": company_name,
        "industry": industry,
        "work_phone": work_phone,
        "country": country,
        "city": city,
        "website": website,
        "company_description": company_description,
    }
    
    # Handle company logo upload
    if company_logo:
        logo_url = await save_file(
            file=company_logo,
            allowed_types=["image/jpeg", "image/jpg", "image/png"],
            max_size_mb=5,
            upload_dir="uploads/company_logos"
        )
        recruiter_data["company_logo_url"] = logo_url
    
    # Create recruiter
    recruiter = create_recruiter(db, recruiter_data)
    
    return recruiter


async def get_recruiter_profile(db: Session, recruiter_id: int):
    """
    Get recruiter profile by ID
    
    Args:
        db: Database session
        recruiter_id: Recruiter ID
    
    Returns:
        Recruiter profile
    
    Raises:
        HTTPException: If recruiter not found
    """
    recruiter = get_recruiter_by_id(db, recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    
    return recruiter


async def update_recruiter_profile(
    db: Session,
    recruiter_id: int,
    full_name: str,
    work_phone: str,
    country: str,
    city: str,
    company_name: str,
    industry: str,
    website: Optional[str] = None,
    company_description: Optional[str] = None,
    company_logo: Optional[UploadFile] = None,
):
    """
    Update recruiter profile
    
    Args:
        db: Database session
        recruiter_id: Recruiter ID
        (other fields): Updated recruiter information
    
    Returns:
        Updated recruiter object
    
    Raises:
        HTTPException: If recruiter not found
    """
    recruiter = get_recruiter_by_id(db, recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    
    # Prepare updates
    updates = {
        "full_name": full_name,
        "work_phone": work_phone,
        "country": country,
        "city": city,
        "company_name": company_name,
        "industry": industry,
        "website": website,
        "company_description": company_description,
    }
    
    # Handle company logo upload
    if company_logo:
        logo_url = await save_file(
            file=company_logo,
            allowed_types=["image/jpeg", "image/jpg", "image/png"],
            max_size_mb=5,
            upload_dir="uploads/company_logos"
        )
        updates["company_logo_url"] = logo_url
    
    # Update recruiter
    updated_recruiter = update_recruiter(db, recruiter_id, updates)
    
    return updated_recruiter
