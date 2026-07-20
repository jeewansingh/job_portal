from sqlalchemy.orm import Session

from app.models.user_skill import UserSkill


class UserSkillRepository:

    @staticmethod
    def create(db: Session, user_id: int, skill_id: int):

        user_skill = UserSkill(
            user_id=user_id,
            skill_id=skill_id
        )

        db.add(user_skill)
        db.flush()  # Ensure the record is prepared for commit

        return user_skill
    
    @staticmethod
    def get_by_id(db: Session, skill_id: int):
        return (
            db.query(Skill)
            .filter(Skill.id == skill_id)
            .first()
        )