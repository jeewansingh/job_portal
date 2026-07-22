from fastapi import APIRouter, Depends, Form, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user_id, get_current_recruiter
from app.core.security import verify_access_token
from app.schemas.job import JobResponse, JobListItem, BrowseJobItem, BrowseJobsResponse, JobDetailsResponse, RecommendedJobsResponse, SimilarJobsResponse, CategoriesResponse
from app.services.job_service import (
    post_job,
    get_recruiter_jobs,
    get_job_details,
    update_job_posting,
    close_job_posting,
    delete_job_posting,
    browse_all_jobs,
    get_all_job_categories,
    get_jobs_by_category_name
)
from app.services.recommendation_service import get_recommended_jobs
from app.services.similar_jobs_service import get_similar_jobs

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


@router.get(
    "/categories",
    response_model=CategoriesResponse
)
async def get_categories(
    db: Session = Depends(get_db)
):
    """
    Get all unique job categories with job counts (Public endpoint).
    
    - Returns only categories that have active jobs
    - Each category includes the count of active jobs
    - Sorted alphabetically
    - No authentication required
    """
    return await get_all_job_categories(db=db)


@router.get(
    "/category/{category_name}",
    response_model=BrowseJobsResponse
)
async def get_jobs_by_category(
    category_name: str,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """
    Get all jobs in a specific category (Public endpoint).
    
    - Returns only active jobs in the specified category
    - Sorted by newest first (created_at DESC)
    - Includes company info and skills
    - No authentication required
    - No match scores (this is not a recommendation endpoint)
    - Supports pagination
    """
    return await get_jobs_by_category_name(
        db=db,
        category=category_name,
        skip=skip,
        limit=limit
    )


@router.get(
    "/recommended",
    response_model=RecommendedJobsResponse
)
async def get_recommended_jobs_for_user(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Get recommended jobs for the logged-in user (Protected endpoint).
    
    - Requires authentication (user must be logged in)
    - Calculates match score based on:
      * Skills match (60% weight) - TF-IDF + Cosine Similarity
      * Position/Title match (20% weight) - TF-IDF + Cosine Similarity
      * Experience match (15% weight) - Ratio comparison
      * Job type preference (5% weight) - Exact match
    - Returns jobs sorted by match score (highest first)
    - Includes match_score and matched_skills for each job
    - Supports pagination
    """
    return await get_recommended_jobs(
        db=db,
        user_id=current_user_id,
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
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    Get job details by ID with company info and skills.
    
    - Public endpoint (no authentication required)
    - If Authorization header is provided and valid, includes match_score
    - If no auth or invalid auth, match_score will be null
    """
    user_id = None
    
    # Try to extract user_id from token if provided
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "")
            payload = verify_access_token(token)
            if payload:
                user_id = payload.get("user_id")
        except:
            # Invalid token, but that's okay - continue without user_id
            pass
    
    return await get_job_details(
        db=db, 
        job_id=job_id,
        user_id=user_id
    )


@router.get(
    "/{job_id}/similar",
    response_model=SimilarJobsResponse
)
async def get_similar_jobs_for_job(
    job_id: int,
    limit: int = Query(3, ge=1, le=10, description="Number of similar jobs to return"),
    db: Session = Depends(get_db)
):
    """
    Get similar jobs using KNN algorithm (Public endpoint).
    
    - Works for everyone (no authentication required)
    - Uses job-to-job similarity based on:
      * Skills (50% weight)
      * Job title (20% weight)
      * Experience requirements (15% weight)
      * Category (10% weight)
      * Employment type (5% weight)
    - Returns top K most similar active jobs
    - Excludes the reference job itself
    - Used for "Jobs You May Like" section
    """
    return await get_similar_jobs(
        db=db,
        job_id=job_id,
        limit=limit
    )


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