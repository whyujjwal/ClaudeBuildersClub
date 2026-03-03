from pydantic import BaseModel
from datetime import datetime


class GroupMember(BaseModel):
    uid: str
    name: str
    email: str
    picture: str = ""
    joined_at: datetime
    is_pm: bool = False


class Group(BaseModel):
    id: str
    name: str
    description: str | None = None
    join_code: str          # 6-char alphanumeric code shared to invite others
    created_at: datetime
    pm_uid: str             # project manager's uid
    member_uids: list[str] = []     # flat list for Firestore array_contains queries
    members: list[GroupMember] = []
    track: str | None = None        # inherited from PM's track at creation time


class CreateGroupRequest(BaseModel):
    name: str
    description: str | None = None


class JoinGroupRequest(BaseModel):
    join_code: str


class GroupMemberResponse(BaseModel):
    uid: str
    name: str
    email: str
    picture: str
    joined_at: datetime
    is_pm: bool


class GroupResponse(BaseModel):
    id: str
    name: str
    description: str | None
    join_code: str
    created_at: datetime
    pm_uid: str
    members: list[GroupMemberResponse]
    track: str | None
