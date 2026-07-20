from fastapi import FastAPI

from app.routers.jobs import router as job_router
from app.routers.resume import router as resume_router


app = FastAPI()

app.include_router(job_router)
app.include_router(resume_router)