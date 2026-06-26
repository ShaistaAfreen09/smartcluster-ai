import os
from typing import Dict, Any, Optional
import httpx

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

async def get_google_oauth_tokens(code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
    """
    Exchanges authorization code for Google access and ID tokens
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return None
        
    url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, data=data)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception:
            return None

async def get_google_user_profile(access_token: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves Google User Profile details using OAuth access token
    """
    url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                profile = response.json()
                return {
                    "google_id": profile.get("sub"),
                    "name": profile.get("name"),
                    "email": profile.get("email"),
                    "avatar_url": profile.get("picture")
                }
            return None
        except Exception:
            return None
