from app.models.user import User
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.recruiter import Recruiter
from app.models.job import Job
from app.models.job_skill import JobSkill
from app.models.skill_alias import SkillAlias
from app.models.application import Application

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.routers.users import router as user_router
from app.routers.recruiters import router as recruiter_router
from app.routers.jobs import router as job_router
from app.routers.resume import router as resume_router
from app.routers.skills import router as skill_router
from app.routers.auth import router as auth_router
from app.routers.applications import router as application_router

from app.models import user
from app.models import skill
from app.models import user_skill
from app.models import recruiter
from app.models import job
from app.models import job_skill
from app.models import skill_alias
from app.models import application

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default port
        "http://localhost:3000",  # Alternative React port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
(uploads_dir / "resumes").mkdir(exist_ok=True)
(uploads_dir / "profile_pictures").mkdir(exist_ok=True)
(uploads_dir / "company_logos").mkdir(exist_ok=True)

# Mount static files for uploaded content
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(recruiter_router)
app.include_router(job_router)
app.include_router(resume_router)
app.include_router(skill_router)
app.include_router(application_router)
