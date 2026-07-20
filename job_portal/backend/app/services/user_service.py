from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.skill_repository import SkillRepository
from app.repositories.user_skill_repository import UserSkillRepository


def register_user(db, user_data):

    user = User(
        full_name=user_data.full_name,
        gender=user_data.gender,
        date_of_birth=user_data.date_of_birth,
        phone=user_data.phone,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        address=user_data.address,
        education=user_data.education,
        experience_years=user_data.experience_years,
        desired_position=user_data.desired_position,
        portfolio_link=user_data.portfolio_link,
    )

    # Save user (flush only, no commit)
    user = UserRepository.create(db, user)

    # Save user's skills
    for skill_name in user_data.skills:

        skill = SkillRepository.get_by_name(db, skill_name)

        if skill:

            UserSkillRepository.create(
                db,
                user.id,
                skill.id
            )

    db.commit()

    return user