"""
Job Recommendation Algorithm

This module contains a simple recommendation logic for matching users with jobs
based on four factors: skills, position, experience, and job type.

No external libraries used - pure Python implementation.
Suitable for college final-year project demonstration.
"""

from typing import List, Dict, Any, Tuple
import math


# Weights for different matching factors
# These weights determine how important each factor is in the final recommendation
WEIGHTS = {
    "skills": 0.70,      # 70% - Skills match is most important
    "position": 0.10,    # 10% - Job title match
    "experience": 0.15,  # 15% - Experience level match
    "job_type": 0.05,    # 5% - Employment type preference
}


def calculate_skills_similarity(user_skill_ids: List[int], job_skill_ids: List[int]) -> Tuple[float, List[int]]:
    """
    Calculate cosine similarity between user skills and job skills using skill IDs.
    
    Cosine Similarity Formula:
        similarity = dot_product / (norm_user × norm_job)
    
    Where:
        - dot_product = number of common skills (intersection of sets)
        - norm_user = square root of total user skills
        - norm_job = square root of total job skills
    
    Args:
        user_skill_ids: List of skill IDs that the user has
        job_skill_ids: List of skill IDs required for the job
    
    Returns:
        Tuple of (similarity_score, list_of_matched_skill_ids)
        - similarity_score: Value between 0 and 1
        - list_of_matched_skill_ids: IDs of skills that match between user and job
    
    Example:
        User skills: [1, 2, 3, 4]  (4 skills)
        Job skills:  [2, 3, 5]     (3 skills)
        
        Common skills: [2, 3]  (2 skills match)
        
        dot_product = 2
        norm_user = sqrt(4) = 2.0
        norm_job = sqrt(3) = 1.732
        
        similarity = 2 / (2.0 × 1.732) = 2 / 3.464 = 0.577 (57.7%)
    """
    # Handle edge case: if either has no skills, similarity is 0
    if not user_skill_ids or not job_skill_ids:
        return 0.0, []
    
    # Convert lists to sets for efficient intersection
    user_skills_set = set(user_skill_ids)
    job_skills_set = set(job_skill_ids)
    
    # Find common skills (intersection)
    matched_skills = user_skills_set & job_skills_set
    matched_skill_ids = list(matched_skills)
    
    # Calculate dot product (number of matching skills)
    dot_product = len(matched_skills)
    
    # Calculate norms (magnitudes) using square root
    norm_user = math.sqrt(len(user_skill_ids))
    norm_job = math.sqrt(len(job_skill_ids))
    
    # Avoid division by zero (though we already checked for empty lists)
    if norm_user == 0 or norm_job == 0:
        return 0.0, []
    
    # Calculate cosine similarity
    similarity = dot_product / (norm_user * norm_job)
    
    # Ensure result is between 0 and 1
    similarity = max(0.0, min(1.0, similarity))
    
    return similarity, matched_skill_ids


def calculate_position_similarity(user_desired_position: str, job_title: str) -> float:
    """
    Calculate position/title match score using simple case-insensitive comparison.
    
    Args:
        user_desired_position: The position the user wants (e.g., "Python Developer")
        job_title: The job's title (e.g., "python developer")
    
    Returns:
        1.0 if positions match (case-insensitive), 0.0 otherwise
    
    Example:
        "Python Developer" vs "python developer" → 1.0 (match)
        "Java Developer" vs "Python Developer" → 0.0 (no match)
    """
    if not user_desired_position or not job_title:
        return 0.0
    
    # Convert both to lowercase and compare
    if user_desired_position.lower().strip() == job_title.lower().strip():
        return 1.0
    else:
        return 0.0


def calculate_experience_similarity(user_experience: float, required_experience: float) -> float:
    """
    Calculate experience match score.
    
    Logic:
        - If job requires 0 years of experience: Full score (1.0) for everyone
        - If user has equal or more experience than required: Full score (1.0)
        - If user has less experience: Partial score (user_exp / required_exp)
    
    Args:
        user_experience: User's years of experience (e.g., 3.0)
        required_experience: Job's required years of experience (e.g., 5.0)
    
    Returns:
        Score between 0 and 1
    
    Examples:
        User: 5 years, Required: 3 years → 1.0 (user exceeds requirement)
        User: 3 years, Required: 5 years → 0.6 (user has 60% of required experience)
        User: 2 years, Required: 0 years → 1.0 (no experience required)
    """
    # If job requires no experience, everyone gets full score
    if required_experience == 0:
        return 1.0
    
    # If user meets or exceeds requirement, full score
    if user_experience >= required_experience:
        return 1.0
    
    # Otherwise, calculate partial score based on ratio
    score = user_experience / required_experience
    
    # Ensure score is between 0 and 1
    return max(0.0, min(1.0, score))


def calculate_job_type_similarity(user_preferred_type: str, job_employment_type: str) -> float:
    """
    Calculate job type match score using simple case-insensitive comparison.
    
    Args:
        user_preferred_type: User's preferred employment type (e.g., "Full-time")
        job_employment_type: Job's employment type (e.g., "full-time")
    
    Returns:
        1.0 if types match (case-insensitive), 0.0 otherwise
    
    Example:
        "Full-time" vs "full-time" → 1.0 (match)
        "Part-time" vs "Full-time" → 0.0 (no match)
    """
    if not user_preferred_type or not job_employment_type:
        return 0.0
    
    # Convert both to lowercase and compare
    if user_preferred_type.lower().strip() == job_employment_type.lower().strip():
        return 1.0
    else:
        return 0.0


def calculate_match_score(
    user_profile: Dict[str, Any],
    user_skill_ids: List[int],
    job: Dict[str, Any],
    job_skill_ids: List[int]
) -> Dict[str, Any]:
    """
    Calculate overall match score between a user and a job.
    
    This is the main function that combines all four factors:
    1. Skills similarity (60%)
    2. Position similarity (20%)
    3. Experience similarity (15%)
    4. Job type similarity (5%)
    
    Args:
        user_profile: Dictionary containing:
            - desired_position: str
            - experience_years: float
            - preferred_job_type: str
        user_skill_ids: List of user's skill IDs [1, 2, 3, ...]
        job: Dictionary containing:
            - job_title: str
            - experience_years: float
            - employment_type: str
        job_skill_ids: List of job's required skill IDs [2, 3, 4, ...]
    
    Returns:
        Dictionary with:
            - match_score: Overall score (0-100)
            - matched_skill_ids: List of matching skill IDs
            - score_breakdown: Dict with individual scores
    
    Example:
        User has skills [1, 2, 3], wants "Python Developer", 3 years exp, prefers "Full-time"
        Job requires skills [2, 3, 4], title "Python Developer", 2 years exp, type "Full-time"
        
        Skills: 2 common out of 3 user & 3 job → cosine = 2/3 = 0.667 (66.7%)
        Position: "Python Developer" == "Python Developer" → 1.0 (100%)
        Experience: 3 >= 2 → 1.0 (100%)
        Job Type: "Full-time" == "Full-time" → 1.0 (100%)
        
        Final = (0.667 × 0.60) + (1.0 × 0.20) + (1.0 × 0.15) + (1.0 × 0.05)
              = 0.400 + 0.200 + 0.150 + 0.050
              = 0.800
              = 80.0%
    """
    
    # 1. Calculate skills similarity using cosine similarity (60% weight)
    skills_similarity, matched_skill_ids = calculate_skills_similarity(
        user_skill_ids, 
        job_skill_ids
    )
    
    # 2. Calculate position/title similarity (20% weight)
    position_similarity = calculate_position_similarity(
        user_profile.get("desired_position", ""),
        job.get("job_title", "")
    )
    
    # 3. Calculate experience similarity (15% weight)
    experience_similarity = calculate_experience_similarity(
        float(user_profile.get("experience_years", 0)),
        float(job.get("experience_years", 0))
    )
    
    # 4. Calculate job type similarity (5% weight)
    job_type_similarity = calculate_job_type_similarity(
        user_profile.get("preferred_job_type", ""),
        job.get("employment_type", "")
    )
    
    # Calculate weighted total score
    total_score = (
        WEIGHTS["skills"] * skills_similarity +
        WEIGHTS["position"] * position_similarity +
        WEIGHTS["experience"] * experience_similarity +
        WEIGHTS["job_type"] * job_type_similarity
    )
    
    # Convert to percentage (0-100) and round to 2 decimal places
    match_score = round(total_score * 100, 2)
    
    return {
        "match_score": match_score,
        "matched_skill_ids": matched_skill_ids,
        "score_breakdown": {
            "skills_score": round(skills_similarity * 100, 2),
            "position_score": round(position_similarity * 100, 2),
            "experience_score": round(experience_similarity * 100, 2),
            "job_type_score": round(job_type_similarity * 100, 2),
        }
    }


def rank_jobs_by_match(
    user_profile: Dict[str, Any],
    user_skill_ids: List[int],
    jobs_with_skills: List[Tuple[Dict[str, Any], List[int]]]
) -> List[Dict[str, Any]]:
    """
    Rank all jobs by match score for a given user.
    
    This function:
    1. Loops through all jobs
    2. Calculates match score for each job
    3. Adds match_score and matched_skill_ids to each job
    4. Sorts jobs by match_score in descending order (highest first)
    
    Args:
        user_profile: User profile dictionary
        user_skill_ids: List of user's skill IDs
        jobs_with_skills: List of tuples (job_dict, job_skill_ids_list)
    
    Returns:
        List of job dictionaries sorted by match_score (highest to lowest),
        each with added match_score and matched_skill_ids
    
    Example:
        Input: 3 jobs with match scores [65.5, 89.2, 72.0]
        Output: Jobs sorted as [89.2, 72.0, 65.5]
    """
    ranked_jobs = []
    
    for job, job_skill_ids in jobs_with_skills:
        # Calculate match score for this job
        match_result = calculate_match_score(
            user_profile=user_profile,
            user_skill_ids=user_skill_ids,
            job=job,
            job_skill_ids=job_skill_ids
        )
        
        # Add match information to job dictionary
        job_with_score = {
            **job,  # Include all original job fields
            "match_score": match_result["match_score"],
            "matched_skill_ids": match_result["matched_skill_ids"],
            "score_breakdown": match_result["score_breakdown"],
        }
        
        ranked_jobs.append(job_with_score)
    
    # Sort by match score in descending order (highest match first)
    ranked_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    
    return ranked_jobs
