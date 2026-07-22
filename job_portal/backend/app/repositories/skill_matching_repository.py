"""
Skill Matching Repository

Handles skill matching with three-tier fallback:
1. Exact match against skills table
2. Alias lookup using skill_aliases table
3. Levenshtein distance as final fallback (uses algorithms folder)
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Optional

from app.models.skill import Skill
from app.models.skill_alias import SkillAlias
from app.algorithms.skill_matching import (
    normalize_skill_name,
    match_skill_levenshtein,
    filter_invalid_skills
)


def match_skill_exact(db: Session, skill_name: str) -> Optional[Dict]:
    """
    Try to match skill using exact match (case-insensitive).
    
    Args:
        db: Database session
        skill_name: Normalized skill name
    
    Returns:
        Dict with id and name if found, None otherwise
    """
    skill = db.query(Skill).filter(
        Skill.name.ilike(skill_name)
    ).first()
    
    if skill:
        return {"id": skill.id, "name": skill.name}
    
    return None


def match_skill_alias(db: Session, skill_name: str) -> Optional[Dict]:
    """
    Try to match skill using alias lookup.
    
    Args:
        db: Database session
        skill_name: Normalized skill name
    
    Returns:
        Dict with id and name if found, None otherwise
    """
    normalized = normalize_skill_name(skill_name)
    
    alias_record = db.query(SkillAlias).join(
        Skill, SkillAlias.skill_id == Skill.id
    ).filter(
        SkillAlias.alias.ilike(normalized)
    ).first()
    
    if alias_record:
        return {
            "id": alias_record.skill.id,
            "name": alias_record.skill.name
        }
    
    return None


def match_skill_levenshtein_db(
    db: Session,
    skill_name: str,
    max_distance: int = 2
) -> Optional[Dict]:
    """
    Try to match skill using Levenshtein distance as final fallback.
    
    Uses the algorithm from app.algorithms.skill_matching module.
    
    Args:
        db: Database session
        skill_name: Normalized skill name
        max_distance: Maximum edit distance to consider a match (default: 2)
    
    Returns:
        Dict with id and name if found, None otherwise
    """
    # Get all skills from database
    all_skills = db.query(Skill).all()
    
    # Convert to list of dicts for algorithm
    skills_list = [{"id": skill.id, "name": skill.name} for skill in all_skills]
    
    # Use Levenshtein matching algorithm
    return match_skill_levenshtein(skill_name, skills_list, max_distance)


def match_skills(db: Session, skill_names: List[str]) -> List[Dict]:
    """
    Match a list of skill names using three-tier fallback strategy.
    
    Strategy:
    1. Exact match against skills table
    2. Alias lookup using skill_aliases table
    3. Levenshtein distance (max distance = 2) - uses algorithms folder
    
    Args:
        db: Database session
        skill_names: List of raw skill names extracted from resume
    
    Returns:
        List of dicts with matched skills: [{"id": 1, "name": "Python"}, ...]
        Duplicates are removed
    """
    # Filter out invalid skills first
    valid_skills = filter_invalid_skills(skill_names)
    
    matched_skills = []
    matched_ids = set()  # Track IDs to avoid duplicates
    
    for raw_skill in valid_skills:
        skill_name = normalize_skill_name(raw_skill)
        
        # Tier 1: Exact match
        matched = match_skill_exact(db, skill_name)
        
        # Tier 2: Alias lookup
        if not matched:
            matched = match_skill_alias(db, skill_name)
        
        # Tier 3: Levenshtein distance (from algorithms folder)
        if not matched:
            matched = match_skill_levenshtein_db(db, skill_name, max_distance=2)
        
        # Add to results if found and not already added
        if matched and matched["id"] not in matched_ids:
            matched_skills.append(matched)
            matched_ids.add(matched["id"])
    
    return matched_skills
