"""
Recommendation Service

Orchestrates the job recommendation process by:
1. Fetching user profile and skill IDs
2. Fetching active jobs with skill IDs
3. Delegating to recommendation algorithm
4. Returning ranked results
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from decimal import Decimal

from app.repositories.user_repository import UserRepository
from app.repositories.user_skill_repository import UserSkillRepository
from app.repositories.job_repository import get_browse_jobs
from app.algorithms.recommendation import rank_jobs_by_match


async def get_recommended_jobs(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> Dict[str, Any]:
    """
    Get recommended jobs for a user based on their profile and skills.
    
    Process:
    1. Fetch user profile
    2. Fetch user skill IDs
    3. Fetch all active jobs
    4. Fetch job skill IDs for each job
    5. Use recommendation algorithm to calculate match scores
    6. Sort by match score
    7. Apply pagination
    8. Return results
    
    Args:
        db: Database session
        user_id: ID of the user requesting recommendations
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
    
    Returns:
        Dictionary with:
            - jobs: List of recommended jobs with match scores
            - total: Total number of recommended jobs
            - skip: Number of records skipped
            - limit: Maximum records requested
    
    Raises:
        HTTPException: If user not found or inactive
    """
    
    # Step 1: Fetch user profile
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    # Step 2: Fetch user skill IDs
    user_skills_objs = UserSkillRepository.get_user_skills(db, user_id)
    user_skill_ids = [skill.id for skill in user_skills_objs]
    
    # Step 3: Prepare user profile dictionary
    user_profile = {
        "desired_position": user.desired_position or "",
        "experience_years": float(user.experience_years) if user.experience_years else 0.0,
        "preferred_job_type": user.preferred_job_type or "",
    }
    
    # Step 4: Fetch all active jobs with company info and skills
    all_jobs, total_jobs = get_browse_jobs(
        db=db,
        title=None,
        company=None,
        employment_type=None,
        skip=0,
        limit=1000  # Get all active jobs for ranking
    )
    
    # Step 5: Prepare jobs with skill IDs for algorithm
    jobs_with_skills = []
    for job in all_jobs:
        job_dict = {
            "id": job["id"],
            "job_title": job["job_title"],
            "category": job["category"],
            "employment_type": job["employment_type"],
            "experience_years": float(job["experience_years"]) if job["experience_years"] else 0.0,
            "salary_per_month": job["salary_per_month"],
            "location": job["location"],
            "job_description": job["job_description"],
            "job_specification": job["job_specification"],
            "deadline": job["deadline"],
            "created_at": job["created_at"],
            "is_closed": job["is_closed"],
            "is_active": job["is_active"],
            "company_name": job["company_name"],
            "company_logo_url": job["company_logo_url"],
        }
        
        # Extract skill IDs for this job
        job_skill_ids = [skill["id"] for skill in job.get("skills", [])]
        
        jobs_with_skills.append((job_dict, job_skill_ids))
    
    # Step 6: Use recommendation algorithm to rank jobs by match score
    ranked_jobs = rank_jobs_by_match(
        user_profile=user_profile,
        user_skill_ids=user_skill_ids,
        jobs_with_skills=jobs_with_skills
    )
    
    # Step 7: Convert matched_skill_ids back to skill names for frontend
    for ranked_job in ranked_jobs:
        job_id = ranked_job["id"]
        matched_skill_ids = ranked_job.get("matched_skill_ids", [])
        
        # Find original job to get full skill objects
        original_job = next((j for j in all_jobs if j["id"] == job_id), None)
        if original_job:
            ranked_job["skills"] = original_job.get("skills", [])
            
            # Convert matched skill IDs to skill names
            all_skills = {skill["id"]: skill["name"] for skill in original_job.get("skills", [])}
            ranked_job["matched_skills"] = [
                all_skills[skill_id] for skill_id in matched_skill_ids if skill_id in all_skills
            ]
        else:
            ranked_job["skills"] = []
            ranked_job["matched_skills"] = []
        
        # Remove matched_skill_ids as we now have matched_skills (names)
        ranked_job.pop("matched_skill_ids", None)
    
    # Step 8: Apply pagination to ranked results
    total_recommended = len(ranked_jobs)
    paginated_jobs = ranked_jobs[skip:skip + limit]
    
    return {
        "jobs": paginated_jobs,
        "total": total_recommended,
        "skip": skip,
        "limit": limit
    }
