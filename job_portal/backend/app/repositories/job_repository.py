from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.job import Job
from app.models.recruiter import Recruiter
from app.models.skill import Skill
from app.models.job_skill import JobSkill


def create_job(db: Session, job_data: dict) -> Job:
    """Create a new job posting"""
    job = Job(**job_data)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job_by_id(db: Session, job_id: int) -> Optional[Job]:
    """Get job by ID"""
    return db.query(Job).filter(Job.id == job_id).first()


def get_job_details_with_company(db: Session, job_id: int) -> Optional[dict]:
    """
    Get detailed job information including company and skills.
    Similar to browse jobs but for a single job.
    """
    # Query job with recruiter info
    job = db.query(
        Job.id,
        Job.job_title,
        Job.category,
        Job.employment_type,
        Job.experience_years,
        Job.salary_per_month,
        Job.openings,
        Job.location,
        Job.job_description,
        Job.job_specification,
        Job.deadline,
        Job.created_at,
        Job.updated_at,
        Job.is_closed,
        Job.is_active,
        Recruiter.company_name,
        Recruiter.company_logo_url,
        Recruiter.company_description
    ).join(
        Recruiter, Job.recruiter_id == Recruiter.id
    ).filter(
        Job.id == job_id
    ).first()
    
    if not job:
        return None
    
    # Get skills for this job
    skills = db.query(Skill).join(
        JobSkill, Skill.id == JobSkill.skill_id
    ).filter(
        JobSkill.job_id == job_id
    ).all()
    
    # Convert to dict
    job_dict = {
        "id": job.id,
        "job_title": job.job_title,
        "category": job.category,
        "employment_type": job.employment_type,
        "experience_years": job.experience_years,
        "salary_per_month": job.salary_per_month,
        "openings": job.openings,
        "location": job.location,
        "job_description": job.job_description,
        "job_specification": job.job_specification,
        "deadline": job.deadline,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "is_closed": job.is_closed,
        "is_active": job.is_active,
        "company_name": job.company_name,
        "company_logo_url": job.company_logo_url,
        "company_description": job.company_description,
        "skills": [{"id": skill.id, "name": skill.name} for skill in skills]
    }
    
    return job_dict


def get_jobs_by_recruiter(db: Session, recruiter_id: int, skip: int = 0, limit: int = 100) -> List[Job]:
    """Get all jobs posted by a recruiter"""
    return db.query(Job).filter(Job.recruiter_id == recruiter_id).offset(skip).limit(limit).all()


def get_all_active_jobs(db: Session, skip: int = 0, limit: int = 100) -> List[Job]:
    """Get all active jobs"""
    return db.query(Job).filter(Job.is_active == True, Job.is_closed == False).offset(skip).limit(limit).all()


def update_job(db: Session, job_id: int, updates: dict) -> Optional[Job]:
    """Update job information"""
    job = get_job_by_id(db, job_id)
    if not job:
        return None
    
    for key, value in updates.items():
        if hasattr(job, key):
            setattr(job, key, value)
    
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job_id: int) -> bool:
    """Delete a job posting"""
    job = get_job_by_id(db, job_id)
    if not job:
        return False
    
    db.delete(job)
    db.commit()
    return True


def close_job(db: Session, job_id: int) -> Optional[Job]:
    """Close a job posting (mark as closed)"""
    return update_job(db, job_id, {"is_closed": True})


def get_browse_jobs(
    db: Session,
    title: Optional[str] = None,
    company: Optional[str] = None,
    employment_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> tuple[List[dict], int]:
    """
    Get all active jobs with company info and skills for browse page.
    
    Args:
        db: Database session
        title: Filter by job title (case-insensitive partial match)
        company: Filter by company name (case-insensitive partial match)
        employment_type: Filter by employment type (exact match)
        skip: Number of records to skip
        limit: Maximum number of records to return
    
    Returns:
        Tuple of (List of job dictionaries with company and skills info, total count)
    """
    # Build base query
    base_query = db.query(
        Job.id,
        Job.job_title,
        Job.category,
        Job.employment_type,
        Job.experience_years,
        Job.salary_per_month,
        Job.location,
        Job.job_description,
        Job.job_specification,
        Job.deadline,
        Job.created_at,
        Job.is_closed,
        Job.is_active,
        Recruiter.company_name,
        Recruiter.company_logo_url
    ).join(
        Recruiter, Job.recruiter_id == Recruiter.id
    ).filter(
        Job.is_active == True,
        Job.is_closed == False
    )
    
    # Apply filters
    if title:
        base_query = base_query.filter(Job.job_title.ilike(f"%{title}%"))
    
    if company:
        base_query = base_query.filter(Recruiter.company_name.ilike(f"%{company}%"))
    
    if employment_type and employment_type.lower() != "all":
        base_query = base_query.filter(Job.employment_type == employment_type)
    
    # Get total count before pagination
    total_count = base_query.count()
    
    # Order by created_at desc (newest first) and apply pagination
    jobs = base_query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to dict and add skills
    result = []
    for job in jobs:
        # Get skills for this job
        skills = db.query(Skill).join(
            JobSkill, Skill.id == JobSkill.skill_id
        ).filter(
            JobSkill.job_id == job.id
        ).all()
        
        job_dict = {
            "id": job.id,
            "job_title": job.job_title,
            "category": job.category,
            "employment_type": job.employment_type,
            "experience_years": job.experience_years,
            "salary_per_month": job.salary_per_month,
            "location": job.location,
            "job_description": job.job_description,
            "job_specification": job.job_specification,
            "deadline": job.deadline,
            "created_at": job.created_at,
            "is_closed": job.is_closed,
            "is_active": job.is_active,
            "company_name": job.company_name,
            "company_logo_url": job.company_logo_url,
            "skills": [{"id": skill.id, "name": skill.name} for skill in skills]
        }
        result.append(job_dict)
    
    return result, total_count
