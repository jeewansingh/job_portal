from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.repositories.recruiter_repository import get_recruiter_by_email
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginResponse, UserBasicInfo


def login_user(db: Session, email: str, password: str) -> LoginResponse:
    """
    Authenticate user or recruiter and generate access token.
    
    Checks both users and recruiters tables to authenticate.
    
    Args:
        db: Database session
        email: User's or recruiter's email address
        password: Plain text password
        
    Returns:
        LoginResponse containing access token and user/recruiter info with role
        
    Raises:
        HTTPException: 401 if credentials are invalid, 403 if account is disabled
    """
    
    # First, try to find as regular user
    user = UserRepository.get_by_email(db, email)
    
    if user:
        # Verify password
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Check if account is active
        if not user.is_active:
            raise HTTPException(
                status_code=403,
                detail="Account has been disabled"
            )
        
        # Generate JWT access token with role
        access_token = create_access_token(
            data={
                "user_id": user.id,
                "email": user.email,
                "role": "candidate"
            }
        )
        
        # Prepare user basic info
        user_info = UserBasicInfo(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role="candidate",
            profile_picture_url=user.profile_picture_url,
            preferred_job_type=user.preferred_job_type
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_info
        )
    
    # If not a user, try to find as recruiter
    recruiter = get_recruiter_by_email(db, email)
    
    if recruiter:
        # Verify password
        if not verify_password(password, recruiter.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Check if account is active
        if not recruiter.is_active:
            raise HTTPException(
                status_code=403,
                detail="Account has been disabled"
            )
        
        # Generate JWT access token with role
        access_token = create_access_token(
            data={
                "user_id": recruiter.id,
                "email": recruiter.work_email,
                "role": "recruiter"
            }
        )
        
        # Prepare recruiter basic info
        user_info = UserBasicInfo(
            id=recruiter.id,
            full_name=recruiter.full_name,
            email=recruiter.work_email,
            role="recruiter",
            company_name=recruiter.company_name,
            company_logo_url=recruiter.company_logo_url
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_info
        )
    
    # Neither user nor recruiter found
    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )
