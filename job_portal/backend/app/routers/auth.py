from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth_service import login_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access token.
    
    - Email and password are required
    - Returns JWT access token valid for 24 hours
    - Returns basic user information
    
    **Error Responses:**
    - 401: Invalid email or password
    - 403: Account has been disabled
    """
    
    return login_user(db, credentials.email, credentials.password)
