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
    get_recruiter_applications,
    get_applicant_profile,
    update_application_status,
)
from app.repositories.job_repository import get_job_by_id
from app.schemas.application import (
    ApplicationResponse,
    ApplicationStatusResponse,
    ApplicationWithJobResponse,
    RecruiterApplicationResponse,
    ApplicantProfileResponse,
    UpdateApplicationStatusRequest,
)

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
    - Deadline must not have passed.
    - User must not have already applied.
    """
    from datetime import date
    
    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.is_active or job.is_closed:
        raise HTTPException(status_code=400, detail="This job is no longer accepting applications")
    
    # Check if deadline has passed
    if job.deadline and job.deadline < date.today():
        raise HTTPException(status_code=400, detail="The application deadline for this job has passed")

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


@router.get(
    "/recruiter/all",
    response_model=List[RecruiterApplicationResponse],
)
async def get_all_recruiter_applications(
    db: Session = Depends(get_db),
    current_recruiter_id: int = Depends(get_current_user_id),
):
    """
    Get all applications for jobs posted by the current recruiter.
    
    Returns applications with applicant details, skills, and match scores.
    Sorted by newest first.
    """
    return get_recruiter_applications(db, recruiter_id=current_recruiter_id)


@router.get(
    "/recruiter/applicant/{user_id}",
    response_model=ApplicantProfileResponse,
)
async def get_applicant_profile_for_recruiter(
    user_id: int,
    db: Session = Depends(get_db),
    current_recruiter_id: int = Depends(get_current_user_id),
):
    """
    Get full applicant profile with security check.
    
    Security: Only returns profile if the applicant has applied to at least one job
    owned by the current recruiter. Returns 403 if not.
    """
    profile = get_applicant_profile(db, user_id=user_id, recruiter_id=current_recruiter_id)
    
    if not profile:
        raise HTTPException(
            status_code=403,
            detail="Access denied. This applicant has not applied to any of your jobs."
        )
    
    return profile


@router.put(
    "/{application_id}/status",
    response_model=ApplicationResponse,
)
async def update_application_status_endpoint(
    application_id: int,
    request: UpdateApplicationStatusRequest,
    db: Session = Depends(get_db),
    current_recruiter_id: int = Depends(get_current_user_id),
):
    """
    Update application status (recruiter only).
    
    Security: Only the recruiter who owns the job can update the application status.
    """
    application = update_application_status(
        db,
        application_id=application_id,
        recruiter_id=current_recruiter_id,
        new_status=request.status,
    )
    
    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found or you don't have permission to update it"
        )
    
    try:
        db.commit()
        db.refresh(application)
        return application
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update application: {str(e)}")
