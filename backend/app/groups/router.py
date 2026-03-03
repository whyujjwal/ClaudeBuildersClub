from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user_profile
from app.groups.models import (
    CreateGroupRequest,
    GroupResponse,
    GroupMemberResponse,
    JoinGroupRequest,
)
from app.groups import service
from app.users.models import UserProfile

router = APIRouter(prefix="/groups", tags=["groups"])


def _to_response(group) -> GroupResponse:
    return GroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        join_code=group.join_code,
        created_at=group.created_at,
        pm_uid=group.pm_uid,
        track=group.track,
        members=[
            GroupMemberResponse(
                uid=m.uid,
                name=m.name,
                email=m.email,
                picture=m.picture,
                joined_at=m.joined_at,
                is_pm=m.is_pm,
            )
            for m in group.members
        ],
    )


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    body: CreateGroupRequest,
    profile: UserProfile = Depends(get_current_user_profile),
):
    """Create a new group. The authenticated user becomes the project manager."""
    try:
        group = await service.create_group(profile, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return _to_response(group)


@router.post("/join", response_model=GroupResponse)
async def join_group(
    body: JoinGroupRequest,
    profile: UserProfile = Depends(get_current_user_profile),
):
    """Join an existing group using its 6-character invite code."""
    try:
        group = await service.join_group(profile, body.join_code)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return _to_response(group)


@router.get("/my", response_model=GroupResponse | None)
async def get_my_group(
    profile: UserProfile = Depends(get_current_user_profile),
):
    """Return the group the current user belongs to, or null."""
    group = await service.get_user_group(profile.uid)
    if group is None:
        return None
    return _to_response(group)


@router.delete("/{group_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_group(
    group_id: str,
    profile: UserProfile = Depends(get_current_user_profile),
):
    """Leave the group (non-PM members only)."""
    try:
        await service.leave_group(profile.uid, group_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{group_id}/members/{uid}", response_model=GroupResponse)
async def remove_member(
    group_id: str,
    uid: str,
    profile: UserProfile = Depends(get_current_user_profile),
):
    """Remove a member from the group. Project manager only."""
    try:
        group = await service.remove_member(profile.uid, group_id, uid)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return _to_response(group)


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    group_id: str,
    profile: UserProfile = Depends(get_current_user_profile),
):
    """Delete the group entirely. Project manager only."""
    try:
        await service.delete_group(profile.uid, group_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
