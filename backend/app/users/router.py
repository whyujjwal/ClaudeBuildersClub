from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.users.service import get_or_create_user, update_user_onboarding
from app.users.models import UserResponse, OnboardingUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_user_profile(
    current_user: dict = Depends(get_current_user),
):
    """Get the current user's profile."""
    user = await get_or_create_user(current_user)
    return UserResponse(
        uid=user.uid,
        email=user.email,
        name=user.name,
        picture=user.picture,
        onboarding_completed=user.onboarding_completed,
        track=user.track,
        path=user.path,
        interests=user.interests,
    )


@router.patch("/me/onboarding", response_model=UserResponse)
async def complete_onboarding(
    onboarding_data: OnboardingUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Mark onboarding as complete and save track/path/interests."""
    user = await update_user_onboarding(current_user["sub"], onboarding_data)
    return UserResponse(
        uid=user.uid,
        email=user.email,
        name=user.name,
        picture=user.picture,
        onboarding_completed=user.onboarding_completed,
        track=user.track,
        path=user.path,
        interests=user.interests,
    )
