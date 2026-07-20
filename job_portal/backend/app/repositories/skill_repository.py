from sqlalchemy.orm import Session

from app.models.skill import Skill


class SkillRepository:

    @staticmethod
    def get_by_name(db: Session, name: str):
        return (
            db.query(Skill)
            .filter(Skill.name == name)
            .first()
        )