from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.users.service import get_or_create_user
from app.users.models import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=UserResponse)
async def authenticate_with_google(
    current_user: dict = Depends(get_current_user),
):
    """Verify Google token and create/update user profile in Firestore."""
    user = await get_or_create_user(current_user)
    return UserResponse(
        uid=user.uid,
        email=user.email,
        name=user.name,
        picture=user.picture,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
):
    """Get the current authenticated user's profile."""
    user = await get_or_create_user(current_user)
    return UserResponse(
        uid=user.uid,
        email=user.email,
        name=user.name,
        picture=user.picture,
    )
