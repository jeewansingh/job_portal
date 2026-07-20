from sqlalchemy.orm import Session
from typing import List

from app.models.skill import Skill


class SkillRepository:

    @staticmethod
    def get_by_name(db: Session, name: str):
        return (
            db.query(Skill)
            .filter(Skill.name == name)
            .first()
        )
    
    @staticmethod
    def get_by_id(db: Session, skill_id: int):
        """Get a skill by ID."""
        return (
            db.query(Skill)
            .filter(Skill.id == skill_id)
            .first()
        )
    
    @staticmethod
    def get_all(db: Session) -> List[Skill]:
        """
        Get all skills from the database.
        
        Returns:
            List of all Skill objects ordered by name
        """
        return (
            db.query(Skill)
            .order_by(Skill.name)
            .all()
        )
    
    @staticmethod
    def verify_skill_ids(db: Session, skill_ids: List[int]) -> List[int]:
        """
        Verify that skill IDs exist in the database.
        
        Args:
            db: Database session
            skill_ids: List of skill IDs to verify
            
        Returns:
            List of valid skill IDs that exist in the database
        """
        if not skill_ids:
            return []
        
        # Query database for skills with matching IDs
        existing_skills = (
            db.query(Skill.id)
            .filter(Skill.id.in_(skill_ids))
            .all()
        )
        
        # Extract IDs from query result
        return [skill.id for skill in existing_skills]