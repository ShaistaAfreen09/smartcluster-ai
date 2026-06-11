from sqlalchemy.orm import Session
from app.models.user import User


def get_user_count(db: Session) -> int:
    return db.query(User).count()
