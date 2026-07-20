from pydantic import BaseModel
from datetime import date
from typing import List


class UserCreate(BaseModel):

    full_name: str

    gender: str

    date_of_birth: date

    phone: str

    email: str

    password: str

    address: str

    education: str | None = None

    experience_years: float = 0

    desired_position: str | None = None

    portfolio_link: str | None = None

    skills: List[str] = []
