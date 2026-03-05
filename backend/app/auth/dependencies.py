from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.auth.google import verify_google_token
from app.users.models import UserProfile, Role, ROLE_HIERARCHY
from app.users.service import get_or_create_user

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify the Google ID token from the Authorization header."""
    token = credentials.credentials
    payload = await verify_google_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    email = payload["email"]
    allowed_domain = "pilani.bits-pilani.ac.in"
    allowed_emails = {"whyujjwalraj@gmail.com"}
    if not email.endswith(f"@{allowed_domain}") and email not in allowed_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only @{allowed_domain} emails are allowed",
        )

    return {
        "sub": payload["sub"],
        "email": email,
        "name": payload.get("name", ""),
        "picture": payload.get("picture", ""),
    }


async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
) -> UserProfile:
    """Get the full UserProfile including role from Firestore."""
    return await get_or_create_user(current_user)


def require_role(minimum_role: Role):
    """Dependency factory enforcing a minimum role level."""
    async def role_checker(
        profile: UserProfile = Depends(get_current_user_profile),
    ) -> UserProfile:
        if ROLE_HIERARCHY[profile.role] < ROLE_HIERARCHY[minimum_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {minimum_role.value} or higher",
            )
        return profile
    return role_checker
