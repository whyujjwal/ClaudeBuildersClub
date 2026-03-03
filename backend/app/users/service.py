from datetime import datetime, timezone

from app.db.firebase import get_firestore_client
from app.users.models import UserProfile, OnboardingUpdate, Role

COLLECTION = "users"


async def get_or_create_user(user_data: dict) -> UserProfile:
    """Get existing user or create new one in Firestore."""
    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(user_data["sub"])
    doc = await doc_ref.get()

    now = datetime.now(timezone.utc)

    if doc.exists:
        await doc_ref.update({"last_login": now})
        data = doc.to_dict()
        if "role" not in data:
            data["role"] = Role.USER.value
        return UserProfile(**data)
    else:
        profile = UserProfile(
            uid=user_data["sub"],
            email=user_data["email"],
            name=user_data.get("name", ""),
            picture=user_data.get("picture", ""),
            role=Role.USER,
            created_at=now,
            last_login=now,
        )
        await doc_ref.set(profile.model_dump())
        return profile


async def list_all_users() -> list[UserProfile]:
    """List all users from Firestore."""
    db = await get_firestore_client()
    docs = db.collection(COLLECTION).stream()
    users = []
    async for doc in docs:
        data = doc.to_dict()
        if "role" not in data:
            data["role"] = Role.USER.value
        users.append(UserProfile(**data))
    return users


async def update_user_role(uid: str, new_role: Role) -> UserProfile:
    """Update a user's role in Firestore."""
    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(uid)
    doc = await doc_ref.get()

    if not doc.exists:
        raise ValueError(f"User {uid} not found")

    await doc_ref.update({"role": new_role.value})
    data = doc.to_dict()
    data["role"] = new_role.value
    return UserProfile(**data)


async def update_user_onboarding(uid: str, data: OnboardingUpdate) -> UserProfile:
    """Update user onboarding fields in Firestore."""
    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(uid)

    update_data = {
        "onboarding_completed": True,
        "track": data.track,
        "path": data.path,
        "interests": data.interests,
        "prd_document": data.prd_document,
    }
    await doc_ref.update(update_data)

    doc = await doc_ref.get()
    return UserProfile(**doc.to_dict())
