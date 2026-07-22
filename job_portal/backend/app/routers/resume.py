from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.resume import ResumeResponse
from app.services.resume_service import extract_resume

router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)


@router.post(
    "/upload",
    response_model=ResumeResponse,
)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and parse resume (PDF only).
    
    - Extracts: name, email, phone, portfolio, education, projects
    - Matches skills using three-tier strategy:
      1. Exact match against skills table
      2. Alias lookup using skill_aliases table
      3. Levenshtein distance fallback (max distance = 2)
    - Returns normalized skills with IDs and names
    - Does NOT save anything to database
    - User can edit extracted data before registration
    """
    return await extract_resume(file, db)