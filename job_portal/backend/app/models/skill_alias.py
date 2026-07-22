from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class SkillAlias(Base):
    """
    Skill alias table for mapping alternative names to skills.
    Example: 'js' -> JavaScript, 'react.js' -> React
    """
    
    __tablename__ = "skill_aliases"
    
    id = Column(Integer, primary_key=True, index=True)
    
    skill_id = Column(
        Integer,
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    alias = Column(String(100), unique=True, nullable=False, index=True)
    
    # Relationship
    skill = relationship("Skill")
