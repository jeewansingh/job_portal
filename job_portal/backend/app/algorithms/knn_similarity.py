"""
K-Nearest Neighbors (KNN) Job Similarity Algorithm

This module implements job-to-job similarity for "Jobs You May Like" recommendations.
It compares jobs based on their features (skills, title, experience, category, type)
without requiring user login.

No external libraries used - pure Python implementation.
"""

from typing import List, Dict, Any, Tuple
import math


def calculate_skills_cosine_similarity(skill_ids_1: List[int], skill_ids_2: List[int]) -> float:
    """
    Calculate cosine similarity between two sets of skill IDs.
    
    Cosine Similarity Formula:
        similarity = dot_product / (norm_1 × norm_2)
    
    Where:
        - dot_product = number of common skills
        - norm_1 = square root of total skills in set 1
        - norm_2 = square root of total skills in set 2
    
    Args:
        skill_ids_1: List of skill IDs for first job
        skill_ids_2: List of skill IDs for second job
    
    Returns:
        Similarity score between 0 and 1
    
    Example:
        Job A skills: [1, 2, 3, 4]  (4 skills)
        Job B skills: [2, 3, 5]     (3 skills)
        
        Common: [2, 3] (2 skills)
        dot_product = 2
        norm_1 = sqrt(4) = 2.0
        norm_2 = sqrt(3) = 1.732
        
        similarity = 2 / (2.0 × 1.732) = 0.577 (57.7%)
    """
    # Handle edge case: if either has no skills, similarity is 0
    if not skill_ids_1 or not skill_ids_2:
        return 0.0
    
    # Convert to sets for efficient intersection
    set_1 = set(skill_ids_1)
    set_2 = set(skill_ids_2)
    
    # Find common skills
    common_skills = set_1 & set_2
    dot_product = len(common_skills)
    
    # Calculate norms
    norm_1 = math.sqrt(len(skill_ids_1))
    norm_2 = math.sqrt(len(skill_ids_2))
    
    # Avoid division by zero
    if norm_1 == 0 or norm_2 == 0:
        return 0.0
    
    # Calculate cosine similarity
    similarity = dot_product / (norm_1 * norm_2)
    
    # Ensure result is between 0 and 1
    return max(0.0, min(1.0, similarity))


def calculate_text_similarity(text_1: str, text_2: str) -> float:
    """
    Calculate text similarity using exact case-insensitive match.
    
    Args:
        text_1: First text string
        text_2: Second text string
    
    Returns:
        1.0 if texts match (case-insensitive), 0.0 otherwise
    
    Example:
        "Python Developer" vs "python developer" → 1.0
        "Java Developer" vs "Python Developer" → 0.0
    """
    if not text_1 or not text_2:
        return 0.0
    
    return 1.0 if text_1.lower().strip() == text_2.lower().strip() else 0.0


def calculate_experience_similarity(exp_1: float, exp_2: float) -> float:
    """
    Calculate similarity between experience requirements.
    
    Logic:
        - If both require same experience: similarity = 1.0
        - As difference increases, similarity decreases
        - Uses inverse of normalized difference
    
    Args:
        exp_1: Experience years for first job
        exp_2: Experience years for second job
    
    Returns:
        Similarity score between 0 and 1
    
    Examples:
        Job A: 3 years, Job B: 3 years → 1.0 (identical)
        Job A: 2 years, Job B: 4 years → 0.8 (2 years diff)
        Job A: 0 years, Job B: 10 years → 0.0 (max diff)
    """
    max_diff = 10.0  # Assume max meaningful difference is 10 years
    diff = abs(exp_1 - exp_2)
    
    # Inverse of normalized difference
    similarity = max(0.0, 1.0 - (diff / max_diff))
    
    return similarity


def calculate_job_similarity(
    reference_job: Dict[str, Any],
    reference_job_skill_ids: List[int],
    candidate_job: Dict[str, Any],
    candidate_job_skill_ids: List[int]
) -> float:
    """
    Calculate similarity between two jobs (job-to-job comparison).
    
    This is the core KNN function that compares two jobs based on:
    1. Skills similarity (50%) - Cosine similarity on skill IDs
    2. Job title similarity (20%) - Exact text match
    3. Experience similarity (15%) - How close the requirements are
    4. Category similarity (10%) - Same category or not
    5. Employment type similarity (5%) - Same type or not
    
    Args:
        reference_job: The current job (base for comparison)
            - job_title: str
            - experience_years: float
            - category: str
            - employment_type: str
        reference_job_skill_ids: List of skill IDs for reference job
        candidate_job: Another job to compare
        candidate_job_skill_ids: List of skill IDs for candidate job
    
    Returns:
        Similarity score between 0 and 100
    
    Example:
        Job A: "Python Developer", 3 years, "IT", "Full-time", skills [1,2,3]
        Job B: "Python Developer", 2 years, "IT", "Full-time", skills [2,3,4]
        
        Skills: 2 common / sqrt(3*3) = 0.667 (66.7%)
        Title: Match = 1.0 (100%)
        Experience: |3-2|=1, similarity = 0.9 (90%)
        Category: Match = 1.0 (100%)
        Type: Match = 1.0 (100%)
        
        Final = (0.667×0.50) + (1.0×0.20) + (0.9×0.15) + (1.0×0.10) + (1.0×0.05)
              = 0.333 + 0.200 + 0.135 + 0.100 + 0.050
              = 0.818 = 81.8%
    """
    
    # Weights for job-to-job similarity
    WEIGHTS = {
        "skills": 0.60,        # 60% - Skills overlap is most important
        "title": 0.10,         # 10% - Similar job titles
        "experience": 0.15,    # 15% - Similar experience requirements
        "category": 0.10,      # 10% - Same job category
        "employment_type": 0.05, # 5% - Same employment type
    }
    
    # 1. Skills similarity (60% weight)
    skills_similarity = calculate_skills_cosine_similarity(
        reference_job_skill_ids,
        candidate_job_skill_ids
    )
    
    # 2. Job title similarity (10% weight)
    title_similarity = calculate_text_similarity(
        reference_job.get("job_title", ""),
        candidate_job.get("job_title", "")
    )
    
    # 3. Experience similarity (15% weight)
    ref_exp = float(reference_job.get("experience_years", 0))
    cand_exp = float(candidate_job.get("experience_years", 0))
    experience_similarity = calculate_experience_similarity(ref_exp, cand_exp)
    
    # 4. Category similarity (10% weight)
    category_similarity = calculate_text_similarity(
        reference_job.get("category", ""),
        candidate_job.get("category", "")
    )
    
    # 5. Employment type similarity (5% weight)
    employment_similarity = calculate_text_similarity(
        reference_job.get("employment_type", ""),
        candidate_job.get("employment_type", "")
    )
    
    # Calculate weighted total similarity
    total_similarity = (
        WEIGHTS["skills"] * skills_similarity +
        WEIGHTS["title"] * title_similarity +
        WEIGHTS["experience"] * experience_similarity +
        WEIGHTS["category"] * category_similarity +
        WEIGHTS["employment_type"] * employment_similarity
    )
    
    # Convert to percentage (0-100) and round to 2 decimal places
    similarity_score = round(total_similarity * 100, 2)
    
    return similarity_score


def find_similar_jobs(
    reference_job: Dict[str, Any],
    reference_job_skill_ids: List[int],
    all_jobs_with_skills: List[Tuple[Dict[str, Any], List[int]]],
    k: int = 3
) -> List[Dict[str, Any]]:
    """
    Find K most similar jobs to a reference job using KNN algorithm.
    
    K-Nearest Neighbors (KNN) Process:
    1. Calculate similarity between reference job and all other jobs
    2. Sort jobs by similarity score (highest first)
    3. Return top K most similar jobs
    
    This is used for "Jobs You May Like" recommendations on job details page.
    
    Args:
        reference_job: The job to find similar jobs for
        reference_job_skill_ids: Skill IDs of the reference job
        all_jobs_with_skills: List of tuples (job_dict, job_skill_ids_list)
        k: Number of similar jobs to return (default: 3)
    
    Returns:
        List of top K most similar jobs, each with a match_score field
        Sorted by match_score descending (highest similarity first)
        Excludes the reference job itself
    
    Example:
        Reference: Job ID 5
        All jobs: [Job 1, Job 2, Job 3, Job 4, Job 6, Job 7]
        Calculated similarities: [45.2, 78.5, 90.1, 55.0, 82.3, 30.5]
        K=3
        Output: [Job 3 (90.1%), Job 6 (82.3%), Job 2 (78.5%)]
    """
    similar_jobs = []
    reference_job_id = reference_job.get("id")
    
    # Calculate similarity for each job
    for job, job_skill_ids in all_jobs_with_skills:
        # Skip the reference job itself
        if job.get("id") == reference_job_id:
            continue
        
        # Calculate similarity score
        similarity_score = calculate_job_similarity(
            reference_job=reference_job,
            reference_job_skill_ids=reference_job_skill_ids,
            candidate_job=job,
            candidate_job_skill_ids=job_skill_ids
        )
        
        # Add match_score to job (using same field name as user recommendations)
        job_with_score = {
            **job,
            "match_score": similarity_score,
        }
        
        similar_jobs.append(job_with_score)
    
    # Sort by similarity score (highest first)
    similar_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    
    # Return top K jobs
    return similar_jobs[:k]
