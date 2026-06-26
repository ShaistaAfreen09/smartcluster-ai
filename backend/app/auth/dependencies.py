from fastapi import Depends, HTTPException, status, Security
from fastapi.security import APIKeyCookie
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from .jwt_service import decode_token

# Support reading token from cookies or authorization headers
session_cookie = APIKeyCookie(name="smartcluster_session", auto_error=False)

def get_current_user_payload(token: str = Depends(session_cookie)) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials missing.",
            headers={"WWW-Authenticate": "Cookie"},
        )
    
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid signature.",
        )
    return payload

def get_current_user(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> User:
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed session credentials.",
        )
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Security profile not registered.",
        )
    return user

class RoleRequirement:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        # Check against custom role field in db model (or default Admin for mock/sandbox ease)
        user_role = getattr(user, "role", "Viewer")
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Security clearance role '{user_role}' is insufficient.",
            )
        return user
