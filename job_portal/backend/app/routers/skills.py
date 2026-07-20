from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.skill import SkillResponse
from app.repositories.skill_repository import SkillRepository

router = APIRouter(
    prefix="/skills",
    tags=["Skills"]
)


@router.get(
    "",
    response_model=List[SkillResponse]
)
def get_all_skills(db: Session = Depends(get_db)):
    """
    Get all available skills.
    
    Returns a list of all skills with their IDs, names, and categories.
    Frontend can use this to display skill options and get their IDs.
    """
    return SkillRepository.get_all(db)
