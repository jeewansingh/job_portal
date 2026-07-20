from pydantic import BaseModel


class ResumeResponse(BaseModel):
    name: str
    email: str
    phone: str
    education: str
    skills: list[str]
    portfolio: list[str]