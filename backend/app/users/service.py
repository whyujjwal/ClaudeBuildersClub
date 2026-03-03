from datetime import datetime, timezone

from app.db.firebase import get_firestore_client
from app.users.models import UserProfile, OnboardingUpdate

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
        return UserProfile(**data)
    else:
        profile = UserProfile(
            uid=user_data["sub"],
            email=user_data["email"],
            name=user_data.get("name", ""),
            picture=user_data.get("picture", ""),
            created_at=now,
            last_login=now,
        )
        await doc_ref.set(profile.model_dump())
        return profile


async def update_user_onboarding(uid: str, data: OnboardingUpdate) -> UserProfile:
    """Update user onboarding fields in Firestore."""
    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(uid)

    update_data = {
        "onboarding_completed": True,
        "track": data.track,
        "path": data.path,
        "interests": data.interests,
    }
    await doc_ref.update(update_data)

    doc = await doc_ref.get()
    return UserProfile(**doc.to_dict())
