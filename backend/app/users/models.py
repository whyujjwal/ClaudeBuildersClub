from pydantic import BaseModel
from datetime import datetime


class UserProfile(BaseModel):
    uid: str
    email: str
    name: str
    picture: str = ""
    created_at: datetime | None = None
    last_login: datetime | None = None


class UserResponse(BaseModel):
    uid: str
    email: str
    name: str
    picture: str
