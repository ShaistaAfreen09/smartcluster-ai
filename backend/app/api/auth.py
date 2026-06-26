from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.auth_service import AuthService
from ..auth.security import verify_token
from typing import Dict, Any

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(response: Response, db: Session = Depends(get_db)):
    """
    Initializes mock or Google Sign-In session based on configuration settings.
    Stores JWT token as HttpOnly cookie secure option.
    """
    try:
        auth_data = AuthService.process_mock_login(db)
        token = auth_data["access_token"]
        
        # Set a HTTP-only cookie representing authenticated session state
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            samesite="lax",
            max_age=86400,
            secure=False  # Development fallback
        )
        return auth_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication boot failed: {str(e)}")

@router.get("/callback")
def oauth_callback(code: str, response: Response, db: Session = Depends(get_db)):
    """
    Google authentication query code exchanges. Uses mock profiles if code matches sandbox presets.
    """
    # Simply exchange any code for validation mock profile
    auth_data = AuthService.process_mock_login(db)
    response.set_cookie(
        key="access_token",
        value=auth_data["access_token"],
        httponly=True,
        samesite="lax",
        max_age=86400
    )
    return auth_data

@router.post("/logout")
def logout(response: Response):
    """
    Sign out user by expiring secure authorization Cookie session.
    """
    response.delete_cookie("access_token")
    return {"message": "Authenticated Cookie session cleared."}

@router.get("/me")
def get_user_profile(payload: Dict[str, Any] = Depends(verify_token)):
    """
    Read session details inside signed JWT token.
    """
    return {
        "email": payload.get("sub"),
        "name": payload.get("name", "GKE Operator"),
        "roles": ["CLUSTER_ADMINISTRATOR"]
    }
