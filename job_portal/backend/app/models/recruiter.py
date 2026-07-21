from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.core.database import Base


class Recruiter(Base):
    """Recruiter model for employers/companies"""
    
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    work_email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    company_name = Column(String(150), nullable=False)
    industry = Column(String(100), nullable=False)
    website = Column(Text)
    work_phone = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    company_description = Column(Text)
    company_logo_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
