import secrets
import string
from datetime import datetime, timezone

from app.config import settings
from app.groups.models import Group, GroupMember, CreateGroupRequest
from app.users.models import UserProfile

COLLECTION = "groups"


def _generate_join_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(6))


# ── Public API (delegates to the configured backend) ─────────────────────────


async def create_group(pm: UserProfile, data: CreateGroupRequest) -> Group:
    if settings.db_backend == "firestore":
        return await _fs_create_group(pm, data)
    return await _pg_create_group(pm, data)


async def join_group(user: UserProfile, join_code: str) -> Group:
    if settings.db_backend == "firestore":
        return await _fs_join_group(user, join_code)
    return await _pg_join_group(user, join_code)


async def get_user_group(uid: str) -> Group | None:
    if settings.db_backend == "firestore":
        return await _fs_get_user_group(uid)
    return await _pg_get_user_group(uid)


async def get_group_by_id(group_id: str) -> Group | None:
    if settings.db_backend == "firestore":
        return await _fs_get_group_by_id(group_id)
    return await _pg_get_group_by_id(group_id)


async def leave_group(user_uid: str, group_id: str) -> None:
    if settings.db_backend == "firestore":
        return await _fs_leave_group(user_uid, group_id)
    return await _pg_leave_group(user_uid, group_id)


async def remove_member(pm_uid: str, group_id: str, target_uid: str) -> Group:
    if settings.db_backend == "firestore":
        return await _fs_remove_member(pm_uid, group_id, target_uid)
    return await _pg_remove_member(pm_uid, group_id, target_uid)


async def delete_group(pm_uid: str, group_id: str) -> None:
    if settings.db_backend == "firestore":
        return await _fs_delete_group(pm_uid, group_id)
    return await _pg_delete_group(pm_uid, group_id)


# ── Firestore implementation ─────────────────────────────────────────────────


def _to_response(data: dict) -> Group:
    """Convert a raw Firestore dict to a Group model, coercing nested dicts."""
    members = [
        GroupMember(**m) if isinstance(m, dict) else m
        for m in data.get("members", [])
    ]
    return Group(
        id=data["id"],
        name=data["name"],
        description=data.get("description"),
        join_code=data["join_code"],
        created_at=data["created_at"],
        pm_uid=data["pm_uid"],
        member_uids=data.get("member_uids", []),
        members=members,
        track=data.get("track"),
    )


async def _fs_unique_join_code() -> str:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()
    for _ in range(10):
        code = _generate_join_code()
        docs = db.collection(COLLECTION).where("join_code", "==", code)
        found = [d async for d in docs.stream()]
        if not found:
            return code
    raise RuntimeError("Could not generate unique join code")


async def _fs_create_group(pm: UserProfile, data: CreateGroupRequest) -> Group:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()

    existing = await _fs_get_user_group(pm.uid)
    if existing:
        raise ValueError("You are already in a group. Leave it first.")

    now = datetime.now(timezone.utc)
    join_code = await _fs_unique_join_code()
    group_id = secrets.token_urlsafe(8)

    pm_member = GroupMember(
        uid=pm.uid, name=pm.name, email=pm.email, picture=pm.picture,
        joined_at=now, is_pm=True,
    )

    group = Group(
        id=group_id, name=data.name, description=data.description,
        join_code=join_code, created_at=now, pm_uid=pm.uid,
        member_uids=[pm.uid], members=[pm_member], track=pm.track,
    )

    await db.collection(COLLECTION).document(group_id).set(
        group.model_dump(mode="json")
    )
    return group


async def _fs_join_group(user: UserProfile, join_code: str) -> Group:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()

    existing = await _fs_get_user_group(user.uid)
    if existing:
        raise ValueError("You are already in a group. Leave it first.")

    query = db.collection(COLLECTION).where("join_code", "==", join_code.upper().strip())
    docs = [doc async for doc in query.stream()]

    if not docs:
        raise ValueError("Invalid join code — no group found.")

    doc = docs[0]
    data = doc.to_dict()

    if user.uid in data.get("member_uids", []):
        raise ValueError("You are already a member of this group.")

    now = datetime.now(timezone.utc)
    new_member = GroupMember(
        uid=user.uid, name=user.name, email=user.email, picture=user.picture,
        joined_at=now, is_pm=False,
    )

    updated_members = data.get("members", []) + [new_member.model_dump(mode="json")]
    updated_uids = data.get("member_uids", []) + [user.uid]

    await doc.reference.update({"members": updated_members, "member_uids": updated_uids})

    data["members"] = updated_members
    data["member_uids"] = updated_uids
    return _to_response(data)


async def _fs_get_user_group(uid: str) -> Group | None:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()
    query = db.collection(COLLECTION).where("member_uids", "array_contains", uid)
    docs = [doc async for doc in query.stream()]
    if not docs:
        return None
    return _to_response(docs[0].to_dict())


async def _fs_get_group_by_id(group_id: str) -> Group | None:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()
    doc = await db.collection(COLLECTION).document(group_id).get()
    if not doc.exists:
        return None
    return _to_response(doc.to_dict())


async def _fs_leave_group(user_uid: str, group_id: str) -> None:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(group_id)
    doc = await doc_ref.get()
    if not doc.exists:
        raise ValueError("Group not found.")

    data = doc.to_dict()
    if data["pm_uid"] == user_uid:
        raise ValueError("Project manager cannot leave — transfer PM role or delete the group.")

    updated_members = [m for m in data.get("members", []) if m["uid"] != user_uid]
    updated_uids = [u for u in data.get("member_uids", []) if u != user_uid]
    await doc_ref.update({"members": updated_members, "member_uids": updated_uids})


async def _fs_remove_member(pm_uid: str, group_id: str, target_uid: str) -> Group:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(group_id)
    doc = await doc_ref.get()
    if not doc.exists:
        raise ValueError("Group not found.")

    data = doc.to_dict()
    if data["pm_uid"] != pm_uid:
        raise ValueError("Only the project manager can remove members.")
    if target_uid == pm_uid:
        raise ValueError("PM cannot remove themselves.")

    updated_members = [m for m in data.get("members", []) if m["uid"] != target_uid]
    updated_uids = [u for u in data.get("member_uids", []) if u != target_uid]
    await doc_ref.update({"members": updated_members, "member_uids": updated_uids})

    data["members"] = updated_members
    data["member_uids"] = updated_uids
    return _to_response(data)


async def _fs_delete_group(pm_uid: str, group_id: str) -> None:
    from app.db.firebase import get_firestore_client

    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(group_id)
    doc = await doc_ref.get()
    if not doc.exists:
        raise ValueError("Group not found.")

    data = doc.to_dict()
    if data["pm_uid"] != pm_uid:
        raise ValueError("Only the project manager can delete the group.")

    await doc_ref.delete()


# ── PostgreSQL implementation ─────────────────────────────────────────────────


def _row_to_group(group_row) -> Group:
    """Convert a SQLAlchemy GroupRow (with loaded memberships) to a Pydantic Group."""
    members = []
    member_uids = []
    for m in group_row.memberships:
        user = m.user
        members.append(GroupMember(
            uid=m.user_uid,
            name=user.name,
            email=user.email,
            picture=user.picture or "",
            joined_at=m.joined_at,
            is_pm=m.is_pm,
        ))
        member_uids.append(m.user_uid)
    return Group(
        id=group_row.id,
        name=group_row.name,
        description=group_row.description,
        join_code=group_row.join_code,
        created_at=group_row.created_at,
        pm_uid=group_row.pm_uid,
        member_uids=member_uids,
        members=members,
        track=group_row.track,
    )


def _eager_group_query():
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.db.database import GroupRow, GroupMemberRow

    return select(GroupRow).options(
        selectinload(GroupRow.memberships).selectinload(GroupMemberRow.user)
    )


async def _pg_unique_join_code() -> str:
    from sqlalchemy import select
    from app.db.database import async_session, GroupRow

    async with async_session() as session:
        for _ in range(10):
            code = _generate_join_code()
            result = await session.execute(
                select(GroupRow).where(GroupRow.join_code == code)
            )
            if result.scalar_one_or_none() is None:
                return code
    raise RuntimeError("Could not generate unique join code")


async def _pg_create_group(pm: UserProfile, data: CreateGroupRequest) -> Group:
    from app.db.database import async_session, GroupRow, GroupMemberRow

    existing = await _pg_get_user_group(pm.uid)
    if existing:
        raise ValueError("You are already in a group. Leave it first.")

    now = datetime.now(timezone.utc)
    join_code = await _pg_unique_join_code()
    group_id = secrets.token_urlsafe(8)

    async with async_session() as session:
        group_row = GroupRow(
            id=group_id, name=data.name, description=data.description,
            join_code=join_code, created_at=now, pm_uid=pm.uid, track=pm.track,
        )
        session.add(group_row)

        member_row = GroupMemberRow(
            group_id=group_id, user_uid=pm.uid, joined_at=now, is_pm=True,
        )
        session.add(member_row)
        await session.commit()

        result = await session.execute(
            _eager_group_query().where(GroupRow.id == group_id)
        )
        return _row_to_group(result.scalar_one())


async def _pg_join_group(user: UserProfile, join_code: str) -> Group:
    from app.db.database import async_session, GroupRow, GroupMemberRow

    existing = await _pg_get_user_group(user.uid)
    if existing:
        raise ValueError("You are already in a group. Leave it first.")

    async with async_session() as session:
        result = await session.execute(
            _eager_group_query().where(
                GroupRow.join_code == join_code.upper().strip()
            )
        )
        group_row = result.scalar_one_or_none()
        if not group_row:
            raise ValueError("Invalid join code — no group found.")

        for m in group_row.memberships:
            if m.user_uid == user.uid:
                raise ValueError("You are already a member of this group.")

        now = datetime.now(timezone.utc)
        member_row = GroupMemberRow(
            group_id=group_row.id, user_uid=user.uid, joined_at=now, is_pm=False,
        )
        session.add(member_row)
        await session.commit()

        result = await session.execute(
            _eager_group_query().where(GroupRow.id == group_row.id)
        )
        return _row_to_group(result.scalar_one())


async def _pg_get_user_group(uid: str) -> Group | None:
    from app.db.database import async_session, GroupRow, GroupMemberRow

    async with async_session() as session:
        result = await session.execute(
            _eager_group_query().join(GroupRow.memberships).where(
                GroupMemberRow.user_uid == uid
            )
        )
        group_row = result.scalar_one_or_none()
        if not group_row:
            return None
        return _row_to_group(group_row)


async def _pg_get_group_by_id(group_id: str) -> Group | None:
    from app.db.database import async_session, GroupRow

    async with async_session() as session:
        result = await session.execute(
            _eager_group_query().where(GroupRow.id == group_id)
        )
        group_row = result.scalar_one_or_none()
        if not group_row:
            return None
        return _row_to_group(group_row)


async def _pg_leave_group(user_uid: str, group_id: str) -> None:
    from sqlalchemy import select, delete
    from app.db.database import async_session, GroupRow, GroupMemberRow

    async with async_session() as session:
        result = await session.execute(
            select(GroupRow).where(GroupRow.id == group_id)
        )
        group_row = result.scalar_one_or_none()
        if not group_row:
            raise ValueError("Group not found.")
        if group_row.pm_uid == user_uid:
            raise ValueError(
                "Project manager cannot leave — transfer PM role or delete the group."
            )

        await session.execute(
            delete(GroupMemberRow).where(
                GroupMemberRow.group_id == group_id,
                GroupMemberRow.user_uid == user_uid,
            )
        )
        await session.commit()


async def _pg_remove_member(pm_uid: str, group_id: str, target_uid: str) -> Group:
    from sqlalchemy import select, delete
    from app.db.database import async_session, GroupRow, GroupMemberRow

    async with async_session() as session:
        result = await session.execute(
            select(GroupRow).where(GroupRow.id == group_id)
        )
        group_row = result.scalar_one_or_none()
        if not group_row:
            raise ValueError("Group not found.")
        if group_row.pm_uid != pm_uid:
            raise ValueError("Only the project manager can remove members.")
        if target_uid == pm_uid:
            raise ValueError("PM cannot remove themselves.")

        await session.execute(
            delete(GroupMemberRow).where(
                GroupMemberRow.group_id == group_id,
                GroupMemberRow.user_uid == target_uid,
            )
        )
        await session.commit()

        result = await session.execute(
            _eager_group_query().where(GroupRow.id == group_id)
        )
        return _row_to_group(result.scalar_one())


async def _pg_delete_group(pm_uid: str, group_id: str) -> None:
    from sqlalchemy import select
    from app.db.database import async_session, GroupRow

    async with async_session() as session:
        result = await session.execute(
            select(GroupRow).where(GroupRow.id == group_id)
        )
        group_row = result.scalar_one_or_none()
        if not group_row:
            raise ValueError("Group not found.")
        if group_row.pm_uid != pm_uid:
            raise ValueError("Only the project manager can delete the group.")

        await session.delete(group_row)
        await session.commit()
