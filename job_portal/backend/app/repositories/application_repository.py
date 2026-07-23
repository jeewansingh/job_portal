from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text

from app.models.application import Application
from app.models.job import Job
from app.models.recruiter import Recruiter


def get_application(db: Session, user_id: int, job_id: int) -> Application | None:
    """Check if a user has already applied to a job."""
    return (
        db.query(Application)
        .filter(Application.user_id == user_id, Application.job_id == job_id)
        .first()
    )


def create_application(db: Session, user_id: int, job_id: int) -> Application:
    """
    Insert a new application row.
    Raises IntegrityError if the user already applied (duplicate key).
    """
    application = Application(
        user_id=user_id,
        job_id=job_id,
        status="UNDER_REVIEW",
    )
    db.add(application)
    db.flush()  # surface constraint violations before commit
    return application


def get_user_applications(db: Session, user_id: int) -> list[dict]:
    """Return all applications submitted by a user with job details, newest first."""
    rows = (
        db.query(
            Application,
            Job.job_title,
            Job.location,
            Job.employment_type,
            Recruiter.company_name,
            Recruiter.company_logo_url,
        )
        .join(Job, Application.job_id == Job.id)
        .join(Recruiter, Job.recruiter_id == Recruiter.id)
        .filter(Application.user_id == user_id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    results = []
    for app, job_title, location, employment_type, company_name, company_logo_url in rows:
        results.append({
            "id": app.id,
            "job_id": app.job_id,
            "status": app.status,
            "applied_at": app.applied_at,
            "job_title": job_title,
            "location": location,
            "employment_type": employment_type,
            "company_name": company_name,
            "company_logo_url": company_logo_url,
        })

    return results
