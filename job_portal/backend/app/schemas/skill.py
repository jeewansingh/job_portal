from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SkillResponse(BaseModel):

    id: int

    name: str

    category: Optional[str] = None

    created_at: datetime

    class Config:
        from_attributes = True
