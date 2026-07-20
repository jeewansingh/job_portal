from fastapi import APIRouter, File, UploadFile

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
    file: UploadFile = File(...)
):
    return await extract_resume(file)