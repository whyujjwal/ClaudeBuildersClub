from datetime import datetime, timezone

from app.config import settings
from app.users.models import UserProfile, OnboardingUpdate, Role

COLLECTION = "users"


# ── Public API (delegates to the configured backend) ─────────────────────────


async def get_or_create_user(user_data: dict) -> UserProfile:
    if settings.db_backend == "firestore":
        return await _fs_get_or_create_user(user_data)
    return await _pg_get_or_create_user(user_data)


async def list_all_users() -> list[UserProfile]:
    if settings.db_backend == "firestore":
        return await _fs_list_all_users()
    return await _pg_list_all_users()


async def update_user_role(uid: str, new_role: Role) -> UserProfile:
    if settings.db_backend == "firestore":
        return await _fs_update_user_role(uid, new_role)
    return await _pg_update_user_role(uid, new_role)


async def update_user_onboarding(uid: str, data: OnboardingUpdate) -> UserProfile:
    if settings.db_backend == "firestore":
        return await _fs_update_user_onboarding(uid, data)
    return await _pg_update_user_onboarding(uid, data)


# ── Firestore implementation ─────────────────────────────────────────────────


async def _fs_get_or_create_user(user_data: dict) -> UserProfile:
    from app.db.firebase import get_firestore_client

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


async def _fs_list_all_users() -> list[UserProfile]:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()
    docs = db.collection(COLLECTION).stream()
    users = []
    async for doc in docs:
        data = doc.to_dict()
        if "role" not in data:
            data["role"] = Role.USER.value
        users.append(UserProfile(**data))
    return users


async def _fs_update_user_role(uid: str, new_role: Role) -> UserProfile:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(uid)
    doc = await doc_ref.get()

    if not doc.exists:
        raise ValueError(f"User {uid} not found")

    await doc_ref.update({"role": new_role.value})
    data = doc.to_dict()
    data["role"] = new_role.value
    return UserProfile(**data)


async def _fs_update_user_onboarding(uid: str, data: OnboardingUpdate) -> UserProfile:
    from app.db.firebase import get_firestore_client

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


# ── PostgreSQL implementation ─────────────────────────────────────────────────


def _row_to_profile(row) -> UserProfile:
    from app.db.database import UserRow  # noqa: F811

    return UserProfile(
        uid=row.uid,
        email=row.email,
        name=row.name,
        picture=row.picture or "",
        role=Role(row.role) if row.role else Role.USER,
        created_at=row.created_at,
        last_login=row.last_login,
        onboarding_completed=row.onboarding_completed or False,
        track=row.track,
        path=row.path,
        interests=row.interests or [],
        prd_document=row.prd_document,
    )


async def _pg_get_or_create_user(user_data: dict) -> UserProfile:
    from sqlalchemy import select
    from app.db.database import async_session, UserRow

    async with async_session() as session:
        result = await session.execute(
            select(UserRow).where(UserRow.uid == user_data["sub"])
        )
        row = result.scalar_one_or_none()
        now = datetime.now(timezone.utc)

        if row:
            row.last_login = now
            await session.commit()
        else:
            row = UserRow(
                uid=user_data["sub"],
                email=user_data["email"],
                name=user_data.get("name", ""),
                picture=user_data.get("picture", ""),
                role=Role.USER.value,
                created_at=now,
                last_login=now,
                onboarding_completed=False,
                interests=[],
            )
            session.add(row)
            await session.commit()

        return _row_to_profile(row)


async def _pg_list_all_users() -> list[UserProfile]:
    from sqlalchemy import select
    from app.db.database import async_session, UserRow

    async with async_session() as session:
        result = await session.execute(select(UserRow))
        rows = result.scalars().all()
        return [_row_to_profile(r) for r in rows]


async def _pg_update_user_role(uid: str, new_role: Role) -> UserProfile:
    from sqlalchemy import select
    from app.db.database import async_session, UserRow

    async with async_session() as session:
        result = await session.execute(
            select(UserRow).where(UserRow.uid == uid)
        )
        row = result.scalar_one_or_none()
        if not row:
            raise ValueError(f"User {uid} not found")
        row.role = new_role.value
        await session.commit()
        return _row_to_profile(row)


async def _pg_update_user_onboarding(uid: str, data: OnboardingUpdate) -> UserProfile:
    from sqlalchemy import select
    from app.db.database import async_session, UserRow

    async with async_session() as session:
        result = await session.execute(
            select(UserRow).where(UserRow.uid == uid)
        )
        row = result.scalar_one_or_none()
        if not row:
            raise ValueError(f"User {uid} not found")
        row.onboarding_completed = True
        row.track = data.track
        row.path = data.path
        row.interests = data.interests
        row.prd_document = data.prd_document
        await session.commit()
        return _row_to_profile(row)
