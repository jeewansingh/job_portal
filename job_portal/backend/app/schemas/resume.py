from pydantic import BaseModel
from typing import List


class SkillMatch(BaseModel):
    """Schema for matched skill"""
    id: int
    name: str


class ResumeResponse(BaseModel):
    """Response schema for resume upload/parsing"""
    name: str
    email: str
    phone: str
    education: str
    skills: List[SkillMatch]  # Returns list of {id, name} objects
    portfolio: List[str]
    projects: List[str]  # Added projects field
   