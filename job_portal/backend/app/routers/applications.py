from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.repositories.application_repository import (
    create_application,
    get_application,
    get_user_applications,
)
from app.repositories.job_repository import get_job_by_id
from app.schemas.application import ApplicationResponse, ApplicationStatusResponse, ApplicationWithJobResponse

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


@router.get(
    "/my",
    response_model=List[ApplicationWithJobResponse],
)
async def get_my_applications(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """Return all applications submitted by the current user with job info, newest first."""
    return get_user_applications(db, user_id=current_user_id)


@router.get(
    "/status/{job_id}",
    response_model=ApplicationStatusResponse,
)
async def check_application_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Check whether the current user has already applied for a job.
    Returns { applied: bool, status: str | null }.
    """
    application = get_application(db, user_id=current_user_id, job_id=job_id)
    if application:
        return {"applied": True, "status": application.status}
    return {"applied": False, "status": None}


@router.post(
    "/{job_id}",
    response_model=ApplicationResponse,
    status_code=201,
)
async def apply_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Apply for a job (authenticated users only).

    Checks:
    - Job must exist.
    - Job must be active and not closed.
    - User must not have already applied.
    """
    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.is_active or job.is_closed:
        raise HTTPException(status_code=400, detail="This job is no longer accepting applications")

    existing = get_application(db, user_id=current_user_id, job_id=job_id)
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied for this job")

    try:
        application = create_application(db, user_id=current_user_id, job_id=job_id)
        db.commit()
        db.refresh(application)
        return application
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="You have already applied for this job")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")
