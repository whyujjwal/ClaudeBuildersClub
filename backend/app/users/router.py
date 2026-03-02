from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.users.service import get_or_create_user
from app.users.models import UserResponse

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
    )
