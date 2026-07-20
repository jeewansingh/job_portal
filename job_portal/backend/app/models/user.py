from sqlalchemy.orm import relationship
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Date
from sqlalchemy import DateTime
from sqlalchemy import DECIMAL
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    gender = Column(String(20), nullable=False)

    date_of_birth = Column(Date, nullable=False)

    phone = Column(String(20), nullable=False)

    email = Column(String(255), unique=True, nullable=False)

    password_hash = Column(Text, nullable=False)

    address = Column(Text, nullable=False)

    education = Column(String(150))

    experience_years = Column(DECIMAL(3, 1), default=0)

    desired_position = Column(String(100))

    preferred_job_type = Column(String(30))

    portfolio_link = Column(Text)

    resume_url = Column(Text)

    profile_picture_url = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    is_active = Column(
        Boolean,
        default=True
    )

    skills = relationship(
    "UserSkill",
    back_populates="user",
    cascade="all, delete"
)