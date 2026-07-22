from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from decimal import Decimal

from app.repositories.job_repository import (
    create_job,
    get_job_by_id,
    get_job_details_with_company,
    get_jobs_by_recruiter,
    get_all_active_jobs,
    get_browse_jobs,
    update_job,
    delete_job,
    close_job
)
from app.repositories.job_skill_repository import (
    add_job_skills,
    get_job_skills,
    update_job_skills
)


async def post_job(
    db: Session,
    recruiter_id: int,
    job_title: str,
    category: str,
    employment_type: str,
    experience_years: float,
    openings: int,
    location: str,
    job_description: str,
    job_specification: str,
    deadline: str,
    salary_per_month: str = None,
    skill_ids: List[int] = None,
):
    """
    Create a new job posting with skills (transactional).
    
    Args:
        db: Database session
        recruiter_id: ID of the recruiter posting the job
        job_title: Job title
        category: Job category
        employment_type: Full-time, Part-time, Contract, etc.
        experience_years: Required years of experience
        openings: Number of openings
        location: Job location
        job_description: Detailed job description
        job_specification: Job specifications/requirements
        deadline: Application deadline (YYYY-MM-DD format)
        salary_per_month: Salary range (optional)
        skill_ids: List of skill IDs (optional)
    
    Returns:
        Created job object
    """
    
    # Validate deadline
    try:
        deadline_date = date.fromisoformat(deadline)
        if deadline_date < date.today():
            raise HTTPException(status_code=400, detail="Deadline cannot be in the past")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid deadline format. Use YYYY-MM-DD")
    
    try:
        # Prepare job data
        job_data = {
            "recruiter_id": recruiter_id,
            "job_title": job_title,
            "category": category,
            "employment_type": employment_type,
            "experience_years": Decimal(str(experience_years)),
            "openings": openings,
            "location": location,
            "job_description": job_description,
            "job_specification": job_specification,
            "deadline": deadline_date,
            "salary_per_month": salary_per_month,
        }
        
        # Create job
        job = create_job(db, job_data)
        
        # Add skills if provided
        if skill_ids and len(skill_ids) > 0:
            add_job_skills(db, job.id, skill_ids)
        
        # Commit transaction
        db.commit()
        db.refresh(job)
        
        return job
    except Exception as e:
        # Rollback on any error
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")


async def get_recruiter_jobs(db: Session, recruiter_id: int):
    """Get all jobs posted by a recruiter"""
    return get_jobs_by_recruiter(db, recruiter_id)


async def get_job_details(db: Session, job_id: int, user_id: int = None):
    """
    Get job details by ID with skills and company info.
    If user_id is provided, also calculate match score.
    
    Args:
        db: Database session
        job_id: ID of the job
        user_id: Optional user ID for calculating match score
    
    Returns:
        Job details dict with optional match_score
    """
    from app.repositories.user_repository import UserRepository
    from app.repositories.user_skill_repository import UserSkillRepository
    from app.algorithms.recommendation import calculate_match_score
    
    job = get_job_details_with_company(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # If user is logged in, calculate match score
    if user_id:
        try:
            # Fetch user profile
            user = UserRepository.get_by_id(db, user_id)
            if user and user.is_active:
                # Fetch user skill IDs
                user_skills_objs = UserSkillRepository.get_user_skills(db, user_id)
                user_skill_ids = [skill.id for skill in user_skills_objs]
                
                # Prepare user profile
                user_profile = {
                    "desired_position": user.desired_position or "",
                    "experience_years": float(user.experience_years) if user.experience_years else 0.0,
                    "preferred_job_type": user.preferred_job_type or "",
                }
                
                # Prepare job data
                job_data = {
                    "job_title": job["job_title"],
                    "employment_type": job["employment_type"],
                    "experience_years": float(job["experience_years"]) if job["experience_years"] else 0.0,
                }
                
                # Get job skill IDs
                job_skill_ids = [skill["id"] for skill in job.get("skills", [])]
                
                # Calculate match score (only score, not matched skills)
                match_result = calculate_match_score(
                    user_profile=user_profile,
                    user_skill_ids=user_skill_ids,
                    job=job_data,
                    job_skill_ids=job_skill_ids
                )
                
                # Add only match_score to job
                job["match_score"] = match_result["match_score"]
        except Exception as e:
            # If anything fails, just don't include match score
            # Don't break the endpoint
            job["match_score"] = None
    else:
        # User not logged in
        job["match_score"] = None
    
    return job


async def update_job_posting(
    db: Session,
    job_id: int,
    recruiter_id: int,
    job_title: str,
    category: str,
    employment_type: str,
    experience_years: float,
    openings: int,
    location: str,
    job_description: str,
    job_specification: str,
    deadline: str,
    salary_per_month: str = None,
    skill_ids: List[int] = None,
):
    """Update a job posting with skills (transactional)"""
    
    # Check if job exists and belongs to recruiter
    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.recruiter_id != recruiter_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this job")
    
    # Validate deadline
    try:
        deadline_date = date.fromisoformat(deadline)
        if deadline_date < date.today():
            raise HTTPException(status_code=400, detail="Deadline cannot be in the past")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid deadline format. Use YYYY-MM-DD")
    
    try:
        # Prepare updates
        updates = {
            "job_title": job_title,
            "category": category,
            "employment_type": employment_type,
            "experience_years": Decimal(str(experience_years)),
            "openings": openings,
            "location": location,
            "job_description": job_description,
            "job_specification": job_specification,
            "deadline": deadline_date,
            "salary_per_month": salary_per_month,
        }
        
        # Update job
        updated_job = update_job(db, job_id, updates)
        
        # Update skills if provided
        if skill_ids is not None:
            update_job_skills(db, job_id, skill_ids)
        
        # Commit transaction
        db.commit()
        db.refresh(updated_job)
        
        return updated_job
    except Exception as e:
        # Rollback on any error
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update job: {str(e)}")


async def close_job_posting(db: Session, job_id: int, recruiter_id: int):
    """Close a job posting"""
    
    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.recruiter_id != recruiter_id:
        raise HTTPException(status_code=403, detail="Not authorized to close this job")
    
    closed_job = close_job(db, job_id)
    db.commit()
    return closed_job


async def delete_job_posting(db: Session, job_id: int, recruiter_id: int):
    """Delete a job posting (job_skills will be deleted automatically via CASCADE)"""
    
    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.recruiter_id != recruiter_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")
    
    try:
        success = delete_job(db, job_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete job")
        
        db.commit()
        return {"message": "Job deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete job: {str(e)}")


async def browse_all_jobs(
    db: Session,
    title: str = None,
    company: str = None,
    employment_type: str = None,
    skip: int = 0,
    limit: int = 100
):
    """
    Get all active jobs for browse page with company info and skills.
    
    Args:
        db: Database session
        title: Filter by job title (optional)
        company: Filter by company name (optional)
        employment_type: Filter by employment type (optional)
        skip: Pagination offset
        limit: Maximum number of results
    
    Returns:
        Dict with jobs list and total count
    """
    jobs, total = get_browse_jobs(
        db=db,
        title=title,
        company=company,
        employment_type=employment_type,
        skip=skip,
        limit=limit
    )
    
    return {
        "jobs": jobs,
        "total": total,
        "skip": skip,
        "limit": limit
    }



async def get_all_job_categories(db: Session):
    """
    Get all unique job categories with job counts.
    
    Args:
        db: Database session
    
    Returns:
        Dict with categories list and total count
    """
    from app.repositories.job_repository import get_all_categories
    
    categories = get_all_categories(db)
    
    return {
        "categories": categories,
        "total": len(categories)
    }


async def get_jobs_by_category_name(
    db: Session,
    category: str,
    skip: int = 0,
    limit: int = 100
):
    """
    Get all active jobs in a specific category.
    Reuses browse jobs logic.
    
    Args:
        db: Database session
        category: Category name to filter by
        skip: Pagination offset
        limit: Maximum number of results
    
    Returns:
        Dict with jobs list and metadata
    """
    from app.repositories.job_repository import get_jobs_by_category
    
    jobs, total = get_jobs_by_category(
        db=db,
        category=category,
        skip=skip,
        limit=limit
    )
    
    return {
        "jobs": jobs,
        "total": total,
        "skip": skip,
        "limit": limit
    }
