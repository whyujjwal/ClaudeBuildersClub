from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user_profile
from app.users.models import UserProfile, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=UserResponse)
async def authenticate_with_google(
    profile: UserProfile = Depends(get_current_user_profile),
):
    """Verify Google token and create/update user profile in Firestore."""
    return UserResponse(
        uid=profile.uid,
        email=profile.email,
        name=profile.name,
        picture=profile.picture,
        role=profile.role,
        onboarding_completed=profile.onboarding_completed,
        track=profile.track,
        path=profile.path,
        interests=profile.interests,
        prd_document=profile.prd_document,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    profile: UserProfile = Depends(get_current_user_profile),
):
    """Get the current authenticated user's profile."""
    return UserResponse(
        uid=profile.uid,
        email=profile.email,
        name=profile.name,
        picture=profile.picture,
        role=profile.role,
        onboarding_completed=profile.onboarding_completed,
        track=profile.track,
        path=profile.path,
        interests=profile.interests,
        prd_document=profile.prd_document,
    )
