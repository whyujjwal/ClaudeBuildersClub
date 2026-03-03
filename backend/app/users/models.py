from pydantic import BaseModel
from datetime import datetime


class UserProfile(BaseModel):
    uid: str
    email: str
    name: str
    picture: str = ""
    created_at: datetime | None = None
    last_login: datetime | None = None
    onboarding_completed: bool = False
    track: str | None = None          # "product" or "research"
    path: str | None = None           # "solo" or "team"
    interests: list[str] = []


class OnboardingUpdate(BaseModel):
    track: str           # "product" or "research"
    path: str            # "solo" or "team"
    interests: list[str] = []


class UserResponse(BaseModel):
    uid: str
    email: str
    name: str
    picture: str
    onboarding_completed: bool = False
    track: str | None = None
    path: str | None = None
    interests: list[str] = []
