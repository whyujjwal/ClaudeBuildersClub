from enum import Enum

from pydantic import BaseModel
from datetime import datetime


class Role(str, Enum):
    USER = "user"
    PROJECT_MANAGER = "project_manager"
    ADMIN = "admin"


ROLE_HIERARCHY: dict[Role, int] = {
    Role.USER: 0,
    Role.PROJECT_MANAGER: 1,
    Role.ADMIN: 2,
}


class UserProfile(BaseModel):
    uid: str
    email: str
    name: str
    picture: str = ""
    role: Role = Role.USER
    created_at: datetime | None = None
    last_login: datetime | None = None
    onboarding_completed: bool = False
    track: str | None = None          # "product" or "research"
    path: str | None = None           # "solo" or "team"
    interests: list[str] = []
    prd_document: str | None = None   # completed PRD or research proposal


class OnboardingUpdate(BaseModel):
    track: str           # "product" or "research"
    path: str            # "solo" or "team"
    interests: list[str] = []
    prd_document: str | None = None


class UserResponse(BaseModel):
    uid: str
    email: str
    name: str
    picture: str
    role: Role = Role.USER
    created_at: datetime | None = None
    last_login: datetime | None = None
    onboarding_completed: bool = False
    track: str | None = None
    path: str | None = None
    interests: list[str] = []
    prd_document: str | None = None


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int


class UpdateRoleRequest(BaseModel):
    role: Role
