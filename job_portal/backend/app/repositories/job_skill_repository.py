from sqlalchemy.orm import Session
from typing import List

from app.models.job_skill import JobSkill
from app.models.skill import Skill


def add_job_skills(db: Session, job_id: int, skill_ids: List[int]) -> List[JobSkill]:
    """
    Add multiple skills to a job.
    
    Args:
        db: Database session
        job_id: Job ID
        skill_ids: List of skill IDs to associate with the job
        
    Returns:
        List of created JobSkill objects
    """
    job_skills = []
    for skill_id in skill_ids:
        job_skill = JobSkill(job_id=job_id, skill_id=skill_id)
        db.add(job_skill)
        job_skills.append(job_skill)
    
    return job_skills


def get_job_skills(db: Session, job_id: int) -> List[Skill]:
    """
    Get all skills associated with a job.
    
    Args:
        db: Database session
        job_id: Job ID
        
    Returns:
        List of Skill objects
    """
    return db.query(Skill).join(JobSkill).filter(JobSkill.job_id == job_id).all()


def remove_job_skills(db: Session, job_id: int) -> int:
    """
    Remove all skills associated with a job.
    
    Args:
        db: Database session
        job_id: Job ID
        
    Returns:
        Number of deleted records
    """
    deleted = db.query(JobSkill).filter(JobSkill.job_id == job_id).delete()
    return deleted


def update_job_skills(db: Session, job_id: int, skill_ids: List[int]) -> List[JobSkill]:
    """
    Update skills for a job (remove old, add new).
    
    Args:
        db: Database session
        job_id: Job ID
        skill_ids: New list of skill IDs
        
    Returns:
        List of created JobSkill objects
    """
    # Remove old skills
    remove_job_skills(db, job_id)
    
    # Add new skills
    return add_job_skills(db, job_id, skill_ids)
