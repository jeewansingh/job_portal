from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text

from app.models.application import Application
from app.models.job import Job
from app.models.recruiter import Recruiter
from app.models.user import User
from app.models.user_skill import UserSkill
from app.models.skill import Skill


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


def get_recruiter_applications(db: Session, recruiter_id: int) -> list[dict]:
    """Return all applications for jobs owned by the recruiter, newest first."""
    rows = (
        db.query(
            Application,
            User.full_name,
            User.email,
            User.phone,
            User.experience_years,
            User.resume_url,
            Job.id.label("job_id"),
            Job.job_title,
        )
        .join(Job, Application.job_id == Job.id)
        .join(User, Application.user_id == User.id)
        .filter(Job.recruiter_id == recruiter_id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    results = []
    for app, full_name, email, phone, experience_years, resume_url, job_id, job_title in rows:
        # Get user skills
        user_skills = (
            db.query(Skill.name)
            .join(UserSkill, Skill.id == UserSkill.skill_id)
            .filter(UserSkill.user_id == app.user_id)
            .all()
        )
        skills = [skill.name for skill in user_skills]

        # Calculate match score placeholder (can be enhanced later)
        match_score = 85  # Default score

        results.append({
            "id": app.id,
            "user_id": app.user_id,
            "job_id": job_id,
            "job_title": job_title,
            "applicant_name": full_name,
            "applicant_email": email,
            "applicant_phone": phone,
            "experience_years": float(experience_years) if experience_years else 0,
            "skills": skills,
            "resume_url": resume_url,
            "status": app.status,
            "applied_at": app.applied_at,
            "match_score": match_score,
        })

    return results


def get_applicant_profile(db: Session, user_id: int, recruiter_id: int) -> dict | None:
    """
    Get applicant profile with all details.
    Security check: Verify the user has applied to at least one job owned by this recruiter.
    Returns None if user never applied to recruiter's jobs.
    """
    # Security check: Verify user applied to at least one recruiter's job
    has_application = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(Application.user_id == user_id, Job.recruiter_id == recruiter_id)
        .first()
    )

    if not has_application:
        return None

    # Get user details
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # Get user skills
    user_skills = (
        db.query(Skill.name)
        .join(UserSkill, Skill.id == UserSkill.skill_id)
        .filter(UserSkill.user_id == user_id)
        .all()
    )
    skills = [skill.name for skill in user_skills]

    # Get all applications from this user to recruiter's jobs
    applications = (
        db.query(Application, Job.job_title, Job.id.label("job_id"))
        .join(Job, Application.job_id == Job.id)
        .filter(Application.user_id == user_id, Job.recruiter_id == recruiter_id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    applications_list = []
    for app, job_title, job_id in applications:
        applications_list.append({
            "application_id": app.id,
            "job_id": job_id,
            "job_title": job_title,
            "status": app.status,
            "applied_at": app.applied_at,
        })

    # Calculate age from date_of_birth
    age = None
    if user.date_of_birth:
        from datetime import date
        today = date.today()
        age = today.year - user.date_of_birth.year - (
            (today.month, today.day) < (user.date_of_birth.month, user.date_of_birth.day)
        )

    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "gender": user.gender,
        "date_of_birth": user.date_of_birth,
        "age": age,
        "address": user.address,
        "education": user.education,
        "experience_years": float(user.experience_years) if user.experience_years else 0,
        "desired_position": user.desired_position,
        "preferred_job_type": user.preferred_job_type,
        "portfolio_link": user.portfolio_link,
        "resume_url": user.resume_url,
        "profile_picture_url": user.profile_picture_url,
        "skills": skills,
        "applications": applications_list,
    }


def update_application_status(
    db: Session, application_id: int, recruiter_id: int, new_status: str
) -> Application | None:
    """
    Update application status.
    Security check: Verify the recruiter owns the job this application is for.
    Returns None if application not found or recruiter doesn't own the job.
    """
    application = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(Application.id == application_id, Job.recruiter_id == recruiter_id)
        .first()
    )

    if not application:
        return None

    application.status = new_status
    db.flush()
    return application
