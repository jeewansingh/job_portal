from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginResponse, UserBasicInfo


def login_user(db: Session, email: str, password: str) -> LoginResponse:
    """
    Authenticate user and generate access token.
    
    Args:
        db: Database session
        email: User's email address
        password: User's plain text password
        
    Returns:
        LoginResponse containing access token and user info
        
    Raises:
        HTTPException: 401 if credentials are invalid, 403 if account is disabled
    """
    
    # Find user by email
    user = UserRepository.get_by_email(db, email)
    
    # If user doesn't exist, return generic error
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
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
    
    # Generate JWT access token
    access_token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email
        }
    )
    
    # Prepare user basic info
    user_info = UserBasicInfo(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        profile_picture_url=user.profile_picture_url,
        preferred_job_type=user.preferred_job_type
    )
    
    # Return login response
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_info
    )
