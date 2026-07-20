from fastapi import APIRouter

from app.services.job_service import get_jobs

router = APIRouter()

@router.get("/jobs")
async def read_jobs():
    return await get_jobs()