import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.user import User
from ..auth.security import create_access_token

class AuthService:
    @staticmethod
    def process_google_login(db: Session, google_user_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register or update a user following social login verification.
        Returns a dictionary containing access token and user metadata.
        """
        email = google_user_info.get("email")
        name = google_user_info.get("name", "GKE Administrator")
        avatar_url = google_user_info.get("picture")
        provider = google_user_info.get("provider", "google")

        if not email:
            raise ValueError("Email not provided by Google OAuth payload.")

        # Find or create user session record
        db_user = db.query(User).filter(User.email == email).first()
        if not db_user:
            db_user = User(
                email=email,
                name=name,
                avatar_url=avatar_url,
                provider=provider
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        else:
            # Sync any updating profile changes (avatar, name info)
            db_user.name = name
            if avatar_url:
                db_user.avatar_url = avatar_url
            db.commit()
            db.refresh(db_user)

        # Create session tokens matching our security protocol
        access_token = create_access_token(
            data={"sub": db_user.email, "name": db_user.name, "id": db_user.id}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "name": db_user.name,
                "avatar_url": db_user.avatar_url,
                "provider": db_user.provider
            }
        }

    @staticmethod
    def process_mock_login(db: Session) -> Dict[str, Any]:
        """
        Bypasses OAuth constraints for local development. Logs in local administrator.
        """
        mock_payload = {
            "email": "admin@smartcluster.ai",
            "name": "Cluster Operator",
            "picture": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120",
            "provider": "mock"
        }
        return AuthService.process_google_login(db, mock_payload)
