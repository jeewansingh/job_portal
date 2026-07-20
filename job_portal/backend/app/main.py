from app.models.user import User
from app.models.skill import Skill
from app.models.user_skill import UserSkill

from fastapi import FastAPI

from app.routers.users import router as user_router
from app.routers.jobs import router as job_router
from app.routers.resume import router as resume_router
from app.routers.skills import router as skill_router
from app.routers.auth import router as auth_router

from app.models import user
from app.models import skill
from app.models import user_skill

app = FastAPI()

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(job_router)
app.include_router(resume_router)
app.include_router(skill_router)
