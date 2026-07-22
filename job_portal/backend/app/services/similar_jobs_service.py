"""
Similar Jobs Service

Provides KNN-based "Jobs You May Like" recommendations.
Works without user authentication - purely job-to-job similarity.
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.repositories.job_repository import get_job_details_with_company, get_browse_jobs
from app.algorithms.knn_similarity import find_similar_jobs


async def get_similar_jobs(
    db: Session,
    job_id: int,
    limit: int = 3
) -> Dict[str, Any]:
    """
    Get similar jobs to a given job using KNN algorithm.
    
    This is used for "Jobs You May Like" section on job details page.
    Works for everyone (no authentication required).
    
    Process:
    1. Fetch the reference job (the one user is viewing)
    2. Fetch all other active jobs
    3. Use KNN algorithm to find most similar jobs
    4. Return top K similar jobs with similarity scores
    
    Args:
        db: Database session
        job_id: ID of the reference job
        limit: Number of similar jobs to return (default: 3)
    
    Returns:
        Dictionary with:
            - jobs: List of similar jobs with match_score
            - total: Number of similar jobs found
    
    Raises:
        HTTPException: If reference job not found
    """
    
    # Step 1: Fetch the reference job (the one being viewed)
    reference_job_data = get_job_details_with_company(db, job_id)
    if not reference_job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Step 2: Prepare reference job data
    reference_job = {
        "id": reference_job_data["id"],
        "job_title": reference_job_data["job_title"],
        "category": reference_job_data["category"],
        "employment_type": reference_job_data["employment_type"],
        "experience_years": float(reference_job_data["experience_years"]) if reference_job_data["experience_years"] else 0.0,
    }
    
    # Get reference job skill IDs
    reference_job_skill_ids = [skill["id"] for skill in reference_job_data.get("skills", [])]
    
    # Step 3: Fetch all active jobs (excluding the reference job)
    all_jobs, total_jobs = get_browse_jobs(
        db=db,
        title=None,
        company=None,
        employment_type=None,
        skip=0,
        limit=1000  # Get all active jobs for comparison
    )
    
    # Step 4: Prepare jobs with skill IDs for KNN algorithm
    jobs_with_skills = []
    for job in all_jobs:
        # Skip the reference job (will be excluded in algorithm anyway)
        if job["id"] == job_id:
            continue
        
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
    
    # Step 5: Use KNN algorithm to find K most similar jobs
    similar_jobs = find_similar_jobs(
        reference_job=reference_job,
        reference_job_skill_ids=reference_job_skill_ids,
        all_jobs_with_skills=jobs_with_skills,
        k=limit
    )
    
    # Step 6: Add skills back to each similar job for frontend display
    for similar_job in similar_jobs:
        job_id_val = similar_job["id"]
        # Find original job to get skills
        original_job = next((j for j in all_jobs if j["id"] == job_id_val), None)
        if original_job:
            similar_job["skills"] = original_job.get("skills", [])
        else:
            similar_job["skills"] = []
    
    return {
        "jobs": similar_jobs,
        "total": len(similar_jobs)
    }
