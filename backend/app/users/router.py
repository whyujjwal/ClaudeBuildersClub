from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user, get_current_user_profile, require_role
from app.users.service import get_or_create_user, update_user_onboarding, list_all_users, update_user_role
from app.users.models import (
    UserProfile, UserResponse, UserListResponse,
    UpdateRoleRequest, OnboardingUpdate, Role,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_user_profile(
    profile: UserProfile = Depends(get_current_user_profile),
):
    """Get the current user's profile."""
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
        role=user.role,
        onboarding_completed=user.onboarding_completed,
        track=user.track,
        path=user.path,
        interests=user.interests,
        prd_document=user.prd_document,
    )


@router.get("/", response_model=UserListResponse)
async def get_all_users(
    profile: UserProfile = Depends(require_role(Role.ADMIN)),
):
    """List all users. Admin only."""
    users = await list_all_users()
    return UserListResponse(
        users=[
            UserResponse(
                uid=u.uid,
                email=u.email,
                name=u.name,
                picture=u.picture,
                role=u.role,
                onboarding_completed=u.onboarding_completed,
                track=u.track,
                path=u.path,
                interests=u.interests,
                prd_document=u.prd_document,
            )
            for u in users
        ],
        total=len(users),
    )


@router.patch("/{uid}/role", response_model=UserResponse)
async def change_user_role(
    uid: str,
    body: UpdateRoleRequest,
    profile: UserProfile = Depends(require_role(Role.ADMIN)),
):
    """Change a user's role. Admin only."""
    if uid == profile.uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role",
        )
    try:
        updated = await update_user_role(uid, body.role)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    return UserResponse(
        uid=updated.uid,
        email=updated.email,
        name=updated.name,
        picture=updated.picture,
        role=updated.role,
        onboarding_completed=updated.onboarding_completed,
        track=updated.track,
        path=updated.path,
        interests=updated.interests,
        prd_document=updated.prd_document,
    )
