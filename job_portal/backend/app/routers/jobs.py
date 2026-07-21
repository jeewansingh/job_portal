from fastapi import APIRouter, Depends, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user_id, get_current_recruiter
from app.schemas.job import JobResponse, JobListItem, BrowseJobItem, BrowseJobsResponse, JobDetailsResponse
from app.services.job_service import (
    post_job,
    get_recruiter_jobs,
    get_job_details,
    update_job_posting,
    close_job_posting,
    delete_job_posting,
    browse_all_jobs
)

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.get(
    "/browse",
    response_model=BrowseJobsResponse
)
async def browse_jobs(
    title: Optional[str] = Query(None, description="Filter by job title"),
    company: Optional[str] = Query(None, description="Filter by company name"),
    employment_type: Optional[str] = Query(None, description="Filter by employment type"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """
    Browse all active jobs with company info and skills (Public endpoint).
    
    - Returns jobs that are active and not closed
    - Includes company name and logo from recruiter
    - Includes skills associated with each job
    - Supports filtering by title, company, and employment type
    - Sorted by newest first
    - Returns pagination info (total count, skip, limit)
    """
    return await browse_all_jobs(
        db=db,
        title=title,
        company=company,
        employment_type=employment_type,
        skip=skip,
        limit=limit
    )


@router.post(
    "",
    response_model=JobResponse
)
async def create_job(
    job_title: str = Form(...),
    category: str = Form(...),
    employment_type: str = Form(...),
    experience_years: float = Form(0),
    openings: int = Form(...),
    location: str = Form(...),
    job_description: str = Form(...),
    job_specification: str = Form(...),
    deadline: str = Form(...),
    salary_per_month: Optional[str] = Form(None),
    skill_ids: Optional[List[int]] = Form(None),
    db: Session = Depends(get_db),
    current_recruiter_id: int = Depends(get_current_user_id)
):
    """
    Create a new job posting (Recruiter only).
    
    - Deadline format: YYYY-MM-DD (e.g., 2024-12-31)
    - Skill IDs: Pass skill IDs as integers (e.g., skill_ids=1, skill_ids=2)
    - All fields except salary_per_month and skill_ids are required
    - Uses JWT token to identify the recruiter
    - Creates entries in both jobs and job_skills tables (transactional)
    """
    return await post_job(
        db=db,
        recruiter_id=current_recruiter_id,
        job_title=job_title,
        category=category,
        employment_type=employment_type,
        experience_years=experience_years,
        openings=openings,
        location=location,
        job_description=job_description,
        job_specification=job_specification,
        deadline=deadline,
        salary_per_month=salary_per_month,
        skill_ids=skill_ids,
    )


@router.get(
    "/my-jobs",
    response_model=List[JobListItem]
)
async def get_my_jobs(
    db: Session = Depends(get_db),
    current_recruiter_id: int = Depends(get_current_user_id)
):
    """
    Get all jobs posted by current recruiter.
    Uses JWT token to identify the recruiter.
    """
    return await get_recruiter_jobs(db=db, recruiter_id=current_recruiter_id)


@router.get(
    "/{job_id}",
    response_model=JobDetailsResponse
)
async def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Get job details by ID with company info and skills (Public endpoint)"""
    return await get_job_details(db=db, job_id=job_id)


@router.put(
    "/{job_id}",
    response_model=JobResponse
)
async def update_job(
    job_id: int,
    job_title: str = Form(...),
    category: str = Form(...),
    employment_type: str = Form(...),
    experience_years: float = Form(0),
    openings: int = Form(...),
    location: str = Form(...),
    job_description: str = Form(...),
    job_specification: str = Form(...),
    deadline: str = Form(...),
    salary_per_month: Optional[str] = Form(None),
    skill_ids: Optional[List[int]] = Form(None),
    db: Session = Depends(get_db),
    current_recruiter_id: int = Depends(get_current_user_id)
):
    """
    Update a job posting (Recruiter only).
    Only the recruiter who created the job can update it.
    Updates both jobs and job_skills tables (transactional).
    """
    return await update_job_posting(
        db=db,
        job_id=job_id,
        recruiter_id=current_recruiter_id,
        job_title=job_title,
        category=category,
        employment_type=employment_type,
        experience_years=experience_years,
        openings=openings,
        location=location,
        job_description=job_description,
        job_specification=job_specification,
        deadline=deadline,
        salary_per_month=salary_per_month,
        skill_ids=skill_ids,
    )


@router.post(
    "/{job_id}/close"
)
async def close_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_recruiter_id: int = Depends(get_current_user_id)
):
    """
    Close a job posting (Recruiter only).
    Only the recruiter who created the job can close it.
    """
    return await close_job_posting(db=db, job_id=job_id, recruiter_id=current_recruiter_id)


@router.delete(
    "/{job_id}"
)
async def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_recruiter_id: int = Depends(get_current_user_id)
):
    """
    Delete a job posting (Recruiter only).
    Only the recruiter who created the job can delete it.
    """
    return await delete_job_posting(db=db, job_id=job_id, recruiter_id=current_recruiter_id)